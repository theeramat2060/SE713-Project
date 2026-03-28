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

export const getAllConstituenciesWithCandidates = async (): Promise<any[]> => {
    const result = await prisma.$queryRaw`
        SELECT con.id, con.province, con.district_number, con.is_closed, con.created_at,
               json_agg(json_build_object(
                   'id', c.id, 'title', c.title, 'first_name', c.first_name, 'last_name', c.last_name,
                   'number', c.number, 'party_id', c.party_id, 'party_name', p.name,
                   'party_logo_url', p.logo_url, 'image_url', c.image_url, 'vote_count', COALESCE(vc.count, 0)
               ) ORDER BY c.number) as candidates
        FROM "Constituency" con
        LEFT JOIN "Candidate" c ON con.id = c.constituency_id
        LEFT JOIN "Party" p ON c.party_id = p.id
        LEFT JOIN (SELECT candidate_id, COUNT(*) as count FROM "Vote" GROUP BY candidate_id) vc ON c.id = vc.candidate_id
        GROUP BY con.id, con.province, con.district_number, con.is_closed, con.created_at
        ORDER BY con.province ASC, con.district_number ASC
    `;
    
    const mappedResults = (result as any[]).map((con: any) => {
        const candidates = (con.candidates || []).map((c: any) => {
            const candidateData: any = {
                id: c.id,
                title: c.title,
                first_name: c.first_name,
                last_name: c.last_name,
                number: c.number,
                party_id: c.party_id,
                party_name: c.party_name,
                party_logo_url: c.party_logo_url,
                image_url: c.image_url,
            };
            
            if (con.is_closed) {
                candidateData.vote_count = c.vote_count || 0;
            }
            
            return candidateData;
        });
        
        return {
            id: con.id,
            province: con.province,
            district_number: con.district_number,
            is_closed: con.is_closed,
            created_at: con.created_at,
            candidates,
        };
    });
    
    return mappedResults;
};
