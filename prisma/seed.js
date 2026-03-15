import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { adminSeedData } from '../src/db/seeds/adminSeed.js';
import { constituencySeedData } from '../src/db/seeds/constituencySeed.js';
import { partySeedData } from '../src/db/seeds/partySeed.js';
import { candidateSeedData } from '../src/db/seeds/candidateSeed.js';
import { userSeedData } from '../src/db/seeds/userSeed.js';
import { voteSeedData } from '../src/db/seeds/voteSeed.js';
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
async function main() {
    const client = await pool.connect();
    console.log('🌱 Starting seed data insertion...\n');
    try {
        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await client.query('TRUNCATE TABLE "Vote" CASCADE');
        await client.query('TRUNCATE TABLE "Candidate" CASCADE');
        await client.query('TRUNCATE TABLE "User" CASCADE');
        await client.query('TRUNCATE TABLE "Party" CASCADE');
        await client.query('TRUNCATE TABLE "Constituency" CASCADE');
        await client.query('TRUNCATE TABLE "Admin" CASCADE');
        // Reset sequences
        await client.query('ALTER SEQUENCE "Admin_id_seq" RESTART WITH 1');
        await client.query('ALTER SEQUENCE "Constituency_id_seq" RESTART WITH 1');
        await client.query('ALTER SEQUENCE "Party_id_seq" RESTART WITH 1');
        await client.query('ALTER SEQUENCE "Candidate_id_seq" RESTART WITH 1');
        // 1. Seed Admin
        console.log('\n📝 Seeding Admin...');
        for (const admin of adminSeedData) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await client.query('INSERT INTO "Admin" (username, password, created_at) VALUES ($1, $2, $3)', [admin.username, hashedPassword, admin.created_at]);
        }
        console.log(`✅ Inserted ${adminSeedData.length} admins`);
        // 2. Seed Constituencies
        console.log('\n📝 Seeding Constituencies...');
        for (const constituency of constituencySeedData) {
            await client.query('INSERT INTO "Constituency" (province, district_number, is_closed) VALUES ($1, $2, $3)', [constituency.province, constituency.district_number, constituency.is_closed]);
        }
        console.log(`✅ Inserted ${constituencySeedData.length} constituencies`);
        // 3. Seed Parties
        console.log('\n📝 Seeding Parties...');
        for (const party of partySeedData) {
            await client.query('INSERT INTO "Party" (name, policy, logo_url, created_at) VALUES ($1, $2, $3, $4)', [party.name, party.policy, party.logo_url, party.created_at]);
        }
        console.log(`✅ Inserted ${partySeedData.length} parties`);
        // 4. Seed Candidates
        console.log('\n📝 Seeding Candidates...');
        for (const candidate of candidateSeedData) {
            await client.query(`INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                candidate.title,
                candidate.first_name,
                candidate.last_name,
                candidate.number,
                candidate.image_url,
                candidate.party_id,
                candidate.constituency_id,
                candidate.created_at,
            ]);
        }
        console.log(`✅ Inserted ${candidateSeedData.length} candidates`);
        // 5. Seed Users
        console.log('\n📝 Seeding Users...');
        for (const user of userSeedData) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await client.query(`INSERT INTO "User" (national_id, password, title, first_name, last_name, address, role, constituency_id, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
                user.national_id,
                hashedPassword,
                user.title,
                user.first_name,
                user.last_name,
                user.address,
                user.role,
                user.constituency_id,
                user.created_at,
            ]);
        }
        console.log(`✅ Inserted ${userSeedData.length} users`);
        // 6. Seed Votes (get actual user and candidate IDs)
        console.log('\n📝 Seeding Votes...');
        const usersResult = await client.query('SELECT id FROM "User" LIMIT 10');
        const candidatesResult = await client.query('SELECT id FROM "Candidate" LIMIT 10');
        const userIds = usersResult.rows.map((r) => r.id);
        const candidateIds = candidatesResult.rows.map((r) => r.id);
        let votesInserted = 0;
        for (const vote of voteSeedData) {
            if (userIds.length > 0 && candidateIds.length > 0) {
                const userId = userIds[votesInserted % userIds.length];
                const candidateId = candidateIds[votesInserted % candidateIds.length];
                await client.query(`INSERT INTO "Vote" (user_id, candidate_id, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4)`, [userId, candidateId, vote.created_at, vote.updated_at]);
                votesInserted++;
            }
        }
        console.log(`✅ Inserted ${votesInserted} votes`);
        // Verify data
        console.log('\n📊 Data Summary:');
        const adminCount = await client.query('SELECT COUNT(*) as count FROM "Admin"');
        const constituencyCount = await client.query('SELECT COUNT(*) as count FROM "Constituency"');
        const partyCount = await client.query('SELECT COUNT(*) as count FROM "Party"');
        const candidateCount = await client.query('SELECT COUNT(*) as count FROM "Candidate"');
        const userCount = await client.query('SELECT COUNT(*) as count FROM "User"');
        const voteCount = await client.query('SELECT COUNT(*) as count FROM "Vote"');
        console.log(`  Admins: ${adminCount.rows[0].count}`);
        console.log(`  Constituencies: ${constituencyCount.rows[0].count}`);
        console.log(`  Parties: ${partyCount.rows[0].count}`);
        console.log(`  Candidates: ${candidateCount.rows[0].count}`);
        console.log(`  Users: ${userCount.rows[0].count}`);
        console.log(`  Votes: ${voteCount.rows[0].count}`);
        console.log('\n✨ Seeding completed successfully!\n');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
    finally {
        client.release();
        await pool.end();
    }
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map