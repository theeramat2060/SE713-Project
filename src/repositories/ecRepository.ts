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



// Get basic info of all parties (id, name, logo_url) with pagination
export const getAllPartiesBasic = async (page: number = 1, pageSize: number = 10): Promise<any[]> => {
    console.log(`Fetching parties - Page: ${page}, Size: ${pageSize}`);
    const offset = (page - 1) * pageSize;
    const result = await prisma.$queryRaw<any[]>`
        SELECT id, name, logo_url
        FROM "Party"
        ORDER BY name ASC
        LIMIT ${pageSize} OFFSET ${offset}
    `;
    console.log('Fetched parties:', result);
    return result ?? [];
};

// Get total count of parties
export const getPartiesCount = async (): Promise<number> => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
        SELECT COUNT(*) as count
        FROM "Party"
    `;
    return result ? Number(result[0].count) : 0;
};

export const deleteParty = async (id: number): Promise<void> => {
    await prisma.$queryRaw`
        DELETE FROM "Party"
        WHERE id = ${id}
    `;
};

export const getCandidatesByPartyId = async (partyId: number): Promise<any[]> => {
    const result = await prisma.$queryRaw<any[]>`
        SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
            con.province, con.district_number
        FROM "Candidate" c
        JOIN "Constituency" con ON c.constituency_id = con.id
        WHERE c.party_id = ${partyId}
        ORDER BY con.province, con.district_number
    `;
    return result ?? [];
};

export const deleteCandidate = async (id: number): Promise<void> => {
    await prisma.$queryRaw`
        DELETE FROM "Candidate"
        WHERE id = ${id}
    `;
}

export const CreateParty = async (name: string, logo_url: string, policy: string): Promise<void> => {
await prisma.$queryRaw`
        INSERT INTO "Party" (name, logo_url, policy)
        VALUES (${name}, ${logo_url}, ${policy})
    `;
};

export const getAllCandidates = async (page: number = 1, pageSize: number = 10): Promise<any[]> => {
    const offset = (page - 1) * pageSize;
    const result = await prisma.$queryRaw<any[]>`
        SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
            p.name as party_name, p.logo_url as party_logo_url,
            con.province, con.district_number
        FROM "Candidate" c
        JOIN "Party" p ON c.party_id = p.id
        JOIN "Constituency" con ON c.constituency_id = con.id
        ORDER BY con.province ASC, con.district_number ASC, c.number ASC
        LIMIT ${pageSize} OFFSET ${offset}
    `;
    return result ?? [];
};

export const getCandidatesCount = async (): Promise<number> => {
    const result = await prisma.$queryRaw<{count: bigint}[]>`
        SELECT COUNT(*) as count
        FROM "Candidate"
    `;
    return result ? Number(result[0].count) : 0;
};

export const getCandidateForEdit = async (name: string): Promise<any[]> => {
    //get candidate to edit query for name like %kim% innoring case and constituency id = 1
const result = await prisma.$queryRaw<any[]>`
        SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
            c.party_id, c.constituency_id,
            p.name as party_name, p.logo_url as party_logo_url,
            con.province, con.district_number
        FROM "Candidate" c
        JOIN "Party" p ON c.party_id = p.id
        JOIN "Constituency" con ON c.constituency_id = con.id
        WHERE LOWER(c.first_name) LIKE LOWER(${`%${name}%`})
    `;
    return result ?? [];
};


export const updateCandidate = async (id: number,updatedData: any): Promise<void> => {
    const { title, first_name, last_name, number, image_url, party_id, constituency_id } = updatedData;
    await prisma.$queryRaw`
        UPDATE "Candidate"
        SET title = ${title},
            first_name = ${first_name},
            last_name = ${last_name},
            number = ${number},
            image_url = ${image_url},
            party_id = ${party_id},
            constituency_id = ${constituency_id}
        WHERE id = ${id}
    `;
};

export const addCandidate = async (candidateData: any): Promise<void> => {
    //update regular user to candidate by inserting into candidate table with user id and constituency id and party id
    const { title, first_name, last_name, number, image_url, party_id, constituency_id } = candidateData;
    await prisma.$queryRaw`
        INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id)
        VALUES (${title}, ${first_name}, ${last_name}, ${number}, ${image_url}, ${party_id}, ${constituency_id})
    `;
};

