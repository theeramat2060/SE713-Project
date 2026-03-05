import prisma from '../config/prisma';
import { ConstituencyModel } from '../models';

export const getConstituencyById = async (id: number): Promise<ConstituencyModel | null> => {
    const result = await prisma.$queryRaw<ConstituencyModel[]>`
        SELECT id, province, district_number, is_closed
        FROM "Constituency"
        WHERE id = ${id}
    `;
    return result[0] ?? null;
};

export const getAllConstituencies = async (): Promise<ConstituencyModel[]> => {
    const result = await prisma.$queryRaw<ConstituencyModel[]>`
        SELECT id, province, district_number, is_closed
        FROM "Constituency"
        ORDER BY province ASC, district_number ASC
    `;
    return result;
};

export const getCandidatesWithVotes = async (
    constituencyId: number,
    includeCounts: boolean
): Promise<any[]> => {
    if (includeCounts) {
        const result = await prisma.$queryRaw`
            SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url, c.party_id,
                p.name as party_name, p.logo_url as party_logo_url, COUNT(v.id) as vote_count
            FROM "Candidate" c
            JOIN "Party" p ON c.party_id = p.id
            LEFT JOIN "Vote" v ON c.id = v.candidate_id
            WHERE c.constituency_id = ${constituencyId}
            GROUP BY c.id, p.name, p.logo_url
            ORDER BY c.number ASC
        `;
        return result;
    } else {
        const result = await prisma.$queryRaw`
            SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url, c.party_id,
                p.name as party_name, p.logo_url as party_logo_url, 0 as vote_count
            FROM "Candidate" c
            JOIN "Party" p ON c.party_id = p.id
            WHERE c.constituency_id = ${constituencyId}
            ORDER BY c.number ASC
        `;
        return result;
    }
};

export const getClosedConstituencies = async (): Promise<any[]> => {
    const result = await prisma.$queryRaw`
        SELECT con.id, con.province, con.district_number, con.is_closed, con.created_at,
            json_agg(json_build_object(
                'id', c.id, 'title', c.title, 'first_name', c.first_name, 'last_name', c.last_name,
                'number', c.number, 'party_id', c.party_id, 'party_name', p.name,
                'party_logo_url', p.logo_url, 'vote_count', COALESCE(vc.count, 0)
            )) as candidates
        FROM "Constituency" con
        LEFT JOIN "Candidate" c ON con.id = c.constituency_id
        LEFT JOIN "Party" p ON c.party_id = p.id
        LEFT JOIN (SELECT candidate_id, COUNT(*) as count FROM "Vote" GROUP BY candidate_id) vc ON c.id = vc.candidate_id
        WHERE con.is_closed = true
        GROUP BY con.id, con.province, con.district_number, con.is_closed, con.created_at
    `;
    return result;
};
