import prisma from '../../config/prisma';
import {
    adminSeedData,
    constituencySeedData,
    partySeedData,
    candidateSeedData,
    userSeedData,
    voteSeedData,
} from './index';
import * as bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('🌱 Starting seed data insertion...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await prisma.$queryRaw`TRUNCATE TABLE "Vote" CASCADE`;
        await prisma.$queryRaw`TRUNCATE TABLE "Candidate" CASCADE`;
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE`;
        await prisma.$queryRaw`TRUNCATE TABLE "Party" CASCADE`;
        await prisma.$queryRaw`TRUNCATE TABLE "Constituency" CASCADE`;
        await prisma.$queryRaw`TRUNCATE TABLE "Admin" CASCADE`;

        // Reset sequences
        await prisma.$queryRaw`ALTER SEQUENCE "Admin_id_seq" RESTART WITH 1`;
        await prisma.$queryRaw`ALTER SEQUENCE "Constituency_id_seq" RESTART WITH 1`;
        await prisma.$queryRaw`ALTER SEQUENCE "Party_id_seq" RESTART WITH 1`;
        await prisma.$queryRaw`ALTER SEQUENCE "Candidate_id_seq" RESTART WITH 1`;

        // 1. Seed Admin
        console.log('\n📝 Seeding Admin...');
        for (const admin of adminSeedData) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            await prisma.$queryRaw`
                INSERT INTO "Admin" (username, password, created_at) VALUES (${admin.username}, ${hashedPassword}, ${admin.created_at})
            `;
        }
        console.log(`✅ Inserted ${adminSeedData.length} admins`);

        // 2. Seed Constituencies
        console.log('\n📝 Seeding Constituencies...');
        for (const constituency of constituencySeedData) {
            await prisma.$queryRaw`
                INSERT INTO "Constituency" (province, district_number, is_closed) VALUES (${constituency.province}, ${constituency.district_number}, ${constituency.is_closed})
            `;
        }
        console.log(`✅ Inserted ${constituencySeedData.length} constituencies`);

        // 3. Seed Parties
        console.log('\n📝 Seeding Parties...');
        for (const party of partySeedData) {
            await prisma.$queryRaw`
                INSERT INTO "Party" (name, policy, logo_url, created_at) VALUES (${party.name}, ${party.policy}, ${party.logo_url}, ${party.created_at})
            `;
        }
        console.log(`✅ Inserted ${partySeedData.length} parties`);

        // 4. Seed Candidates
        console.log('\n📝 Seeding Candidates...');
        for (const candidate of candidateSeedData) {
            await prisma.$queryRaw`
                INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id, created_at)
                VALUES (${candidate.title}, ${candidate.first_name}, ${candidate.last_name}, ${candidate.number}, ${candidate.image_url}, ${candidate.party_id}, ${candidate.constituency_id}, ${candidate.created_at})
            `;
        }
        console.log(`✅ Inserted ${candidateSeedData.length} candidates`);

        // 5. Seed Users
        console.log('\n📝 Seeding Users...');
        for (const user of userSeedData) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await prisma.$queryRaw`
                INSERT INTO "User" (national_id, password, title, first_name, last_name, address, role, constituency_id, created_at)
                VALUES (${user.national_id}, ${hashedPassword}, ${user.title}, ${user.first_name}, ${user.last_name}, ${user.address}, ${user.role}, ${user.constituency_id}, ${user.created_at})
            `;
        }
        console.log(`✅ Inserted ${userSeedData.length} users`);

        // 6. Seed Votes (get actual user and candidate IDs)
        console.log('\n📝 Seeding Votes...');
        const users = await prisma.$queryRaw<{ id: string }[]>`SELECT id FROM "User" LIMIT 10`;
        const candidates = await prisma.$queryRaw<{ id: number }[]>`SELECT id FROM "Candidate" LIMIT 10`;

        let votesInserted = 0;
        for (const vote of voteSeedData) {
            if (users.length > 0 && candidates.length > 0) {
                const userId = users[votesInserted % users.length].id;
                const candidateId = candidates[votesInserted % candidates.length].id;

                await prisma.$queryRaw`
                    INSERT INTO "Vote" (user_id, candidate_id, created_at, updated_at)
                    VALUES (${userId}, ${candidateId}, ${vote.created_at}, ${vote.updated_at})
                `;
                votesInserted++;
            }
        }
        console.log(`✅ Inserted ${votesInserted} votes`);

        // Verify data
        console.log('\n📊 Data Summary:');
        const adminCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Admin"`;
        const constituencyCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Constituency"`;
        const partyCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Party"`;
        const candidateCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Candidate"`;
        const userCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "User"`;
        const voteCount = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM "Vote"`;

        console.log(`  Admins: ${adminCount[0]?.count}`);
        console.log(`  Constituencies: ${constituencyCount[0]?.count}`);
        console.log(`  Parties: ${partyCount[0]?.count}`);
        console.log(`  Candidates: ${candidateCount[0]?.count}`);
        console.log(`  Users: ${userCount[0]?.count}`);
        console.log(`  Votes: ${voteCount[0]?.count}`);

        console.log('\n✨ Seeding completed successfully!\n');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run seeds
seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
