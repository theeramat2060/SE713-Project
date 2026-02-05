import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin1111:[yourpassword]@localhost:5432/mydatabase';
const DB_NAME = 'mydatabase';
const DB_HOST = 'localhost';
const DB_USER = 'admin111';
const DB_PASSWORD = '[yourpassword]';

async function resetDatabase() {
  console.log('\n🔄 Database Reset & Recreation Script\n');

  // Connect to default postgres database to drop/create mydatabase
  const adminPool = new Pool({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: 5432,
    database: 'postgres',
  });

  try {
    // Step 1: Drop existing database
    console.log('1️⃣  Dropping existing database...');
    try {
      await adminPool.query(`DROP DATABASE IF EXISTS "${DB_NAME}" WITH (FORCE);`);
      console.log('   ✅ Database dropped');
    } catch (err: any) {
      console.log(`   ⚠️  ${err.message}`);
    }

    // Step 2: Create new database
    console.log('\n2️⃣  Creating new database...');
    await adminPool.query(`CREATE DATABASE "${DB_NAME}";`);
    console.log('   ✅ Database created');

    await adminPool.end();

    // Give database a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 3: Connect to new database and run migrations
    console.log('\n3️⃣  Running migrations...');
    const newPool = new Pool({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: 5432,
      database: DB_NAME,
    });

    // Read and execute init migration
    const initPath = path.join(__dirname, '../migrations/001_init.sql');
    const initSQL = fs.readFileSync(initPath, 'utf-8');
    
    // Execute as single query
    await newPool.query(initSQL);
    console.log('   ✅ Init migration completed');

    // Step 4: Run seed data
    console.log('\n4️⃣  Loading seed data...');
    const seedPath = path.join(__dirname, '../migrations/002_seed_test_data.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf-8');
    
    await newPool.query(seedSQL);
    console.log('   ✅ Seed data loaded');

    // Step 5: Verify tables
    console.log('\n5️⃣  Verifying tables...');
    const result = await newPool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   ✅ Tables created: ${result.rows.length}`);
    result.rows.forEach((row: any) => {
      console.log(`      - ${row.table_name}`);
    });

    // Check row counts
    console.log('\n6️⃣  Data verification:');
    const tables = ['Constituency', 'Party', 'Candidate', 'User', 'Vote'];
    for (const table of tables) {
      try {
        const countResult = await newPool.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`   - ${table}: ${countResult.rows[0].count} rows`);
      } catch (err) {
        console.log(`   - ${table}: table not found`);
      }
    }

    await newPool.end();

    console.log('\n✅ Database reset and recreation completed!\n');
    process.exit(0);

  } catch (err: any) {
    console.error('\n❌ Error during reset:', err.message);
    process.exit(1);
  }
}

resetDatabase();

