import e from "express";
import prisma from "../config/prisma";
import { ConstituencyModel } from "../models";


// working on function to close voting for a constituency
export const closeVotingForConstituency = async (constituencyId: number,isClosed: boolean): Promise<void> => {
    await prisma.$queryRaw`
        UPDATE "Constituency"
        SET is_closed = ${isClosed}
        WHERE id = ${constituencyId}
    `;
};


export const getOpenConstituencies = async (): Promise<ConstituencyModel[]> => {
    const result = await prisma.$queryRaw<ConstituencyModel[]>`
        SELECT id, province, district_number, is_closed
        FROM "Constituency"
        WHERE is_closed = false
        ORDER BY province ASC, district_number ASC
    `;
    return result;
};

export const getClosedConstituencies = async (): Promise<any[]> => {
    const result = await prisma.$queryRaw<any[]>`
        SELECT con.id, con.province, con.district_number, con.is_closed, con.created_at,
            json_agg(json_build_object(
                'id', c.id, 'title', c.title, 'first_name', c.first_name, 'last_name', c.last_name,
                'number', c.number, 'party_id', c.party_id, 'party_name', p.name,
                'party_logo_url', p.logo_url, 'vote_count', COALESCE(vc.count, 0)
            )) as candidates,
            COALESCE(SUM(vc.count), 0)::int as total_votes
        FROM "Constituency" con
        LEFT JOIN "Candidate" c ON con.id = c.constituency_id
        LEFT JOIN "Party" p ON c.party_id = p.id
        LEFT JOIN (
            SELECT candidate_id, COUNT(*) as count
            FROM "Vote"
            GROUP BY candidate_id
        ) vc ON c.id = vc.candidate_id
        WHERE con.is_closed = true
        GROUP BY con.id, con.province, con.district_number, con.is_closed, con.created_at
        ORDER BY con.province ASC, con.district_number ASC
    `;
    console.log('Closed constituencies with candidates and vote counts grouped by constituency:', result);
    return result;
   
};

export const updateConstituencyWinner = async (constituencyId: number, winnerCandidateId: number): Promise<void> => {
    // Winner information is stored in the returned results, not in the database
    // This function can be used for future enhancements if needed
    console.log(`Winner for constituency ${constituencyId}: candidate ${winnerCandidateId}`);
};