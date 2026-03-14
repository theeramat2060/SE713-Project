export interface VoteSeedRecord {
    user_id: string;
    candidate_id: number;
    created_at: Date;
    updated_at: Date;
}

export const voteSeedData: VoteSeedRecord[] = [
    // Bangkok Constituency 3 (CLOSED) - Votes counted
    {
        user_id: '1234567890006',
        candidate_id: 9, // Pradit (candidate 1 in Bangkok 3)
        created_at: new Date('2026-02-05T08:30:00Z'),
        updated_at: new Date('2026-02-05T08:30:00Z'),
    },
    {
        user_id: '1234567890007',
        candidate_id: 10, // Suphat (candidate 2 in Bangkok 3)
        created_at: new Date('2026-02-05T09:15:00Z'),
        updated_at: new Date('2026-02-05T09:15:00Z'),
    },

    // Chiang Mai Constituency 2 (CLOSED) - Votes counted
    {
        user_id: '1234567890010',
        candidate_id: 17, // Visut (candidate 1 in Chiang Mai 2)
        created_at: new Date('2026-02-05T10:00:00Z'),
        updated_at: new Date('2026-02-05T10:00:00Z'),
    },
    {
        user_id: '1234567890011',
        candidate_id: 19, // Pairoj (candidate 3 in Chiang Mai 2)
        created_at: new Date('2026-02-05T10:45:00Z'),
        updated_at: new Date('2026-02-05T10:45:00Z'),
    },
];
