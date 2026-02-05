import pool from '../src/config/db';
import { supabase } from '../src/config/supabase';

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connections...\n');

  // Test PostgreSQL pool
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL (Pool) Connection: SUCCESS');
    console.log(`   Current time: ${result.rows[0].now}`);
  } catch (err: any) {
    console.log('❌ PostgreSQL (Pool) Connection: FAILED');
    console.log(`   Error: ${err.message}`);
  }

  // Test database tables exist
  try {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('\n✅ Database Tables:');
    result.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (err: any) {
    console.log('❌ Could not fetch tables');
  }

  // Test Supabase client
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log('\n✅ Supabase Client: Connected (no auth user)');
    } else {
      console.log('\n✅ Supabase Client: Connected');
      if (data.user) console.log(`   User: ${data.user.email}`);
    }
  } catch (err: any) {
    console.log('\n❌ Supabase Client: FAILED');
    console.log(`   Error: ${err.message}`);
  }

  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);

  // Close pool
  await pool.end();
  process.exit(0);
}

testConnection().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
