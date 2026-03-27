import prisma from '../config/prisma';

export function getConstituencyById (id: number)  {
    return prisma.constituency.findUnique({
        where: { id }
    });
}

export const findAllConstituencies= async() =>{
    return prisma.constituency.findMany({
        orderBy: [{ province: 'asc' }, { district_number: 'asc' }]
    });
}

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
    return result as any[];
};
