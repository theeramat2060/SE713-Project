import prisma from '../config/prisma';
import { Party } from '../models';

export const getPartyById = async (id: number): Promise<Party | null> => {
    const result = await prisma.$queryRaw<Party[]>`
        SELECT id, name, logo_url, policy, created_at
        FROM "Party"
        WHERE id = ${id}
    `;
    return result[0] ?? null;
};

export const getPartiesBasic = async (): Promise<any[]> => {
    const result = await prisma.$queryRaw<any[]>`
        SELECT id, name, logo_url
        FROM "Party"
        ORDER BY name ASC
    `;
    return result ?? [];
};

export const getPartyWithCandidates = async (id: number): Promise<any | null> => {
    const partyResult = await prisma.$queryRaw<Party[]>`
        SELECT id, name, logo_url, policy, created_at
        FROM "Party"
        WHERE id = ${id}
    `;
    if (!partyResult[0]) return null;

    const candidatesResult = await prisma.$queryRaw`
        SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
            con.province, con.district_number
        FROM "Candidate" c
        JOIN "Constituency" con ON c.constituency_id = con.id
        WHERE c.party_id = ${id}
        ORDER BY con.province, con.district_number
    `;

    return {
        ...partyResult[0],
        candidates: candidatesResult,
    };
};

export const getPartyByName = async (name: string): Promise<Party | null> => {
    const result = await prisma.$queryRaw<Party[]>`
        SELECT id, name, logo_url, policy, created_at
        FROM "Party"
        WHERE name = ${name}
    `;
    return result[0] ?? null;
};
