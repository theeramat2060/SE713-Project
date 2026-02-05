#!/usr/bin/env node

/**
 * Seed Data Script for Election System
 * Populates database with test data for public API testing
 * 
 * Usage:
 *   npm run seed              # Run seeding
 */

import * as fs from 'fs';
import * as path from 'path';
import pool from '../src/config/db';

const seedFile = path.join(process.cwd(), 'migrations/002_seed_test_data.sql');

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('📊 Starting database seeding...\n');

    const sqlScript = fs.readFileSync(seedFile, 'utf-8');
    
    // Execute the entire SQL script as a single query
    await client.query(sqlScript);

    console.log(`✅ Seeding completed!\n`);

    // Verify data
    console.log('📈 Data Summary:');
    const results = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM constituencies'),
      client.query('SELECT COUNT(*) as count FROM parties'),
      client.query('SELECT COUNT(*) as count FROM candidates'),
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM votes'),
    ]);

    console.log(`  Constituencies: ${results[0].rows[0].count}`);
    console.log(`  Parties: ${results[1].rows[0].count}`);
    console.log(`  Candidates: ${results[2].rows[0].count}`);
    console.log(`  Users (Voters): ${results[3].rows[0].count}`);
    console.log(`  Votes: ${results[4].rows[0].count}\n`);

    // Show closed constituencies
    const closedConstituencies = await client.query(
      'SELECT id, province, district_number FROM constituencies WHERE is_closed = true ORDER BY province, district_number'
    );

    if (closedConstituencies.rows.length > 0) {
      console.log('🗳️  Closed Constituencies (showing vote results):');
      closedConstituencies.rows.forEach((row) => {
        console.log(`  - ${row.province} District ${row.district_number} (ID: ${row.id})`);
      });
    }

    console.log('\n🧪 Test Public API Endpoints:');
    console.log('  npm run dev          # Start server in one terminal');
    console.log('  npm run test:api     # Run API tests in another terminal\n');
    
    console.log('  Manual endpoint tests:');
    console.log('  curl http://localhost:3000/api/public/constituencies');
    console.log('  curl http://localhost:3000/api/public/constituencies/3/results');
    console.log('  curl http://localhost:3000/api/public/parties');
    console.log('  curl http://localhost:3000/api/public/parties/1');
    console.log('  curl http://localhost:3000/api/public/party-overview\n');

    console.log('✨ Database is ready for testing!');
    process.exit(0);
  } catch (error: any) {
    console.error(' Seeding failed:');
    console.error('   Error:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();


