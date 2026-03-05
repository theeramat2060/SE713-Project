import prisma from "../config/prisma";

export const getUserVote = async (userId: string) => {
    const result = await prisma.$queryRaw<any[]>`
        SELECT id, user_id, candidate_id, created_at, updated_at
        FROM "Vote"
        WHERE user_id = ${userId}
    `;
    return result[0] ?? null;
};

export const addVote = async (userId: string, candidateId: number, constituencyId: number) => {
    // Check if user already has a vote
    const existingVote = await getUserVote(userId);
    
    if (existingVote) {
        // Update existing vote
        const result = await prisma.$queryRaw<any[]>`
            UPDATE "Vote"
            SET candidate_id = ${candidateId}, updated_at = NOW()
            WHERE user_id = ${userId}
            RETURNING id, user_id, candidate_id, created_at, updated_at
        `;
        return result[0] ?? null;
    } else {
        // Insert new vote
        const result = await prisma.$queryRaw<any[]>`
            INSERT INTO "Vote" (user_id, candidate_id, created_at)
            VALUES (${userId}, ${candidateId}, NOW())
            RETURNING id, user_id, candidate_id, created_at
        `;
        return result[0] ?? null;
    }
};


