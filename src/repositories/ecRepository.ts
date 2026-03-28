import prisma from "../config/prisma";
import { ConstituencyModel } from "../models";
import { supabase } from "../config/supabase";
import { config } from "../config/env";
import { getPresignedUrl } from "../services/UploadFileService";

// Helper function to convert file key to full signed S3 URL
export const getFullS3Url = async (fileKey: string | null): Promise<string | null> => {
    if (!fileKey) {
        console.log(' getFullS3Url called with null/empty key');
        return null;
    }
    
    // If it's already a full URL, return as is
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
        return fileKey;
    }
    
    try {

        // Use AWS SDK to generate signed URL (works with Supabase S3-compatible storage)
        // TTL: 86400 seconds = 24 hours (sufficient for election system)
        const signedUrl = await getPresignedUrl('election-bucket', fileKey, 86400);
        
        console.log('Signed URL created successfully');
        return signedUrl;
    } catch (error) {
        console.error(' Exception in getFullS3Url for:', fileKey, error);
        return null;
    }
};

// working on function to close voting for a constituency
export const closeVotingForConstituency = async (constituencyId: number,isClosed: boolean): Promise<void> => {
    // await prisma.$queryRaw`
    //     UPDATE "Constituency"
    //     SET is_closed = ${isClosed}
    //     WHERE id = ${constituencyId}
    // `;
    await prisma.constituency.update({
        where: { id: constituencyId },
        data: { is_closed: isClosed }
    });
};

// Batch update all constituencies voting status - much faster than one-by-one
export const updateAllConstituenciesVotingStatus = async (isClosed: boolean): Promise<{ count: number }> => {
    const result = await prisma.constituency.updateMany({
        data: { is_closed: isClosed }
    });
    console.log(`Batch update completed: ${result.count} constituencies updated`);
    return result;
};

export const getOpenConstituencies = async (): Promise<ConstituencyModel[]> => {
    const result = await prisma.constituency.findMany({
        where: {
            is_closed: false,
        },
        select: {
            id: true,
            province: true,
            district_number: true,
            is_closed: true,
        },
        orderBy: [
            { province: 'asc' },
            { district_number: 'asc' },
        ],
    });

    return result.map((constituency) => ({
        id: constituency.id,
        province: constituency.province,
        district_number: constituency.district_number,
        is_closed: constituency.is_closed ?? false,
    })) as unknown as ConstituencyModel[];
};

export const getClosedConstituencies = async (): Promise<any[]> => {
    const constituencies = await prisma.constituency.findMany({
        where: {
            is_closed: true,
        },
        select: {
            id: true,
            province: true,
            district_number: true,
            is_closed: true,
            created_at: true,
            Candidate: {
                orderBy: {
                    number: 'asc',
                },
                select: {
                    id: true,
                    title: true,
                    first_name: true,
                    last_name: true,
                    number: true,
                    party_id: true,
                    Party: {
                        select: {
                            name: true,
                            logo_url: true,
                        },
                    },
                    _count: {
                        select: {
                            Vote: true,
                        },
                    },
                },
            },
        },
        orderBy: [
            { province: 'asc' },
            { district_number: 'asc' },
        ],
    });

    const result = constituencies.map((constituency) => {
        const candidates = constituency.Candidate.map((candidate) => ({
            id: candidate.id,
            title: candidate.title,
            first_name: candidate.first_name,
            last_name: candidate.last_name,
            number: candidate.number,
            party_id: candidate.party_id,
            party_name: candidate.Party.name,
            party_logo_url: candidate.Party.logo_url,
            vote_count: candidate._count.Vote,
        }));

        const total_votes = candidates.reduce((sum, candidate) => sum + candidate.vote_count, 0);

        return {
            id: constituency.id,
            province: constituency.province,
            district_number: constituency.district_number,
            is_closed: constituency.is_closed ?? false,
            created_at: constituency.created_at,
            candidates,
            total_votes,
        };
    });

    console.log('Closed constituencies with candidates and vote counts grouped by constituency:', result);
    return result;
};

export const updateConstituencyWinner = async (constituencyId: number, winnerCandidateId: number): Promise<void> => {
    // Winner information is stored in the returned results, not in the database
    // This function can be used for future enhancements if needed
    console.log(`Winner for constituency ${constituencyId}: candidate ${winnerCandidateId}`);
};



// Get basic info of all parties (id, name, logo_url, policy, candidate count) with pagination
export const getAllPartiesBasic = async (page: number = 1, pageSize: number = 10): Promise<any[]> => {
    console.log(`Fetching parties - Page: ${page}, Size: ${pageSize}`);
    const offset = (page - 1) * pageSize;
    const result = await prisma.party.findMany({
        select: {
            id: true,
            name: true,
            logo_url: true,
            policy: true,
            _count: {
                select: {
                    Candidate: true,
                },
            },
        },
        orderBy: {
            name: 'asc',
        },
        skip: offset,
        take: pageSize,
    });
    
    const promises = result.map(async (p) => ({
        id: p.id,
        name: p.name,
        logo_url: await getFullS3Url(p.logo_url),
        policy: p.policy,
        candidates_count: p._count.Candidate,
    }));
    
    return Promise.all(promises);
};

// Get total count of parties
export const getPartiesCount = async (): Promise<number> => {
    const count = await prisma.party.count();
    return count;
};  

export const getElectionStats = async () => {
    const totalRegistered = await prisma.user.count();
    
    // Total users who have a record in Vote table
    const totalVoted = await prisma.vote.count();
    const userNoVoteResult = await prisma.$queryRaw<{count: bigint}[]>`
        SELECT COUNT(*) as count FROM "Vote" WHERE candidate_id IS NULL
    `;
    const userNoVote = Number(userNoVoteResult[0]?.count || 0);
    
    const turnoutPercentage = totalRegistered > 0 
        ? parseFloat(((totalVoted / totalRegistered) * 100).toFixed(2))
        : 0;

    return {
        totalRegistered,
        totalVoted,
        userNoVote,
        turnoutPercentage
    };
};

export const deleteParty = async (id: number): Promise<void> => {
    await prisma.party.delete({
        where: { id }
    });
};

export const getCandidatesByPartyId = async (partyId: number): Promise<any[]> => {
    // const result = await prisma.$queryRaw<any[]>`
    //     SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
    //         con.province, con.district_number
    //     FROM "Candidate" c
    //     JOIN "Constituency" con ON c.constituency_id = con.id
    //     WHERE c.party_id = ${partyId}
    //     ORDER BY con.province, con.district_number
    // `;
    // return result ?? [];
    const result = await prisma.candidate.findMany({
        where: {
            party_id: partyId,
        },
        select: {
            id: true,
            title: true,
            first_name: true,
            last_name: true,
            number: true,
            image_url: true,
            party_id: true,
            constituency_id: true,
            Constituency: {
                select: {
                    province: true,
                    district_number: true,
                },
            },
        },
        orderBy: {
            Constituency: {
                province: 'asc',
                district_number: 'asc',
            },
        },
    });
    const promises = result.map(async (candidate) => ({
        id: candidate.id,
        title: candidate.title,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        number: candidate.number,
        image_url: await getFullS3Url(candidate.image_url),
        party_id: candidate.party_id,
        constituency_id: candidate.constituency_id,
        province: candidate.Constituency.province,
        district_number: candidate.Constituency.district_number,
    }));
    
    return Promise.all(promises) as unknown as any[];
};

export const deleteCandidate = async (id: number): Promise<void> => {
    // await prisma.$queryRaw`
    //     DELETE FROM "Candidate"
    //     WHERE id = ${id}
    // `;
    await prisma.candidate.delete({
        where: { id }
    });
}

export const CreateParty = async (name: string, logo_url: string, policy: string): Promise<void> => {
await prisma.$queryRaw`
        INSERT INTO "Party" (name, logo_url, policy)
        VALUES (${name}, ${logo_url}, ${policy})
    `;
};

export const UpdateParty = async (id: number, name: string, logo_url: string, policy: string): Promise<void> => {
    console.log('UpdateParty repository called:', { id, name, logo_url });
    
    await prisma.$queryRaw`
        UPDATE "Party"
        SET name = ${name}, logo_url = ${logo_url}, policy = ${policy}
        WHERE id = ${id}
    `;
    
    // Verify the update was successful
    const updated = await prisma.party.findUnique({
        where: { id },
        select: { id: true, name: true, logo_url: true, policy: true }
    });
    
};

export const getAllCandidates = async (page: number = 1, pageSize: number = 10, search?: string, partyId?: number, constituencyId?: number): Promise<any[]> => {
    const offset = (page - 1) * pageSize;
    
    const where: any = {};
    if (search) {
        where.OR = [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { Party: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }
    
    if (partyId) {
        where.party_id = partyId;
    }
    
    if (constituencyId) {
        where.constituency_id = constituencyId;
    }

    const result = await prisma.candidate.findMany({
        where,
        select: {
            id: true,
            title: true,
            first_name: true,
            last_name: true,
            number: true,
            image_url: true,
            party_id: true,
            constituency_id: true,
            Party: {
                select: {
                    name: true,
                    logo_url: true,
                },
            },
            Constituency: {
                select: {
                    province: true,
                    district_number: true,
                },
            },
        },
        orderBy: [
            { Constituency: { province: 'asc' } },
            { Constituency: { district_number: 'asc' } },
            { number: 'asc' },
        ],
        skip: offset,
        take: pageSize,
    });
    const promises = result.map(async (candidate) => ({
        id: candidate.id,
        title: candidate.title,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        number: candidate.number,
        image_url: await getFullS3Url(candidate.image_url),
        party_id: candidate.party_id,
        party_name: candidate.Party.name,
        party_logo_url: await getFullS3Url(candidate.Party.logo_url),
        constituency_id: candidate.constituency_id,
        province: candidate.Constituency.province,
        district_number: candidate.Constituency.district_number,
    }));
    
    return Promise.all(promises) as unknown as any[];
};

export const getCandidatesCount = async (search?: string, partyId?: number, constituencyId?: number): Promise<number> => {
    const where: any = {};
    if (search) {
        where.OR = [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { Party: { name: { contains: search, mode: 'insensitive' } } }
        ];
    }
    
    if (partyId) {
        where.party_id = partyId;
    }
    
    if (constituencyId) {
        where.constituency_id = constituencyId;
    }
    
    const count = await prisma.candidate.count({ where });
    return count;
};

export const getCandidateForEdit = async (name: string): Promise<any[]> => {
    //get candidate to edit query for name like %kim% innoring case and constituency id = 1
// const result = await prisma.$queryRaw<any[]>`
//         SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
//             c.party_id, c.constituency_id,
//             p.name as party_name, p.logo_url as party_logo_url,
//             con.province, con.district_number
//         FROM "Candidate" c
//         JOIN "Party" p ON c.party_id = p.id
//         JOIN "Constituency" con ON c.constituency_id = con.id
//         WHERE LOWER(c.first_name) LIKE LOWER(${`%${name}%`})
//     `;
//     return result ?? [];
    const result = await prisma.candidate.findMany({
        where: {
            first_name: {
                contains: name,
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            title: true,
            first_name: true,
            last_name: true,
            number: true,
            image_url: true,
            party_id: true,
            constituency_id: true,
            Party: {
                select: {
                    name: true,
                    logo_url: true,
                },
            },
            Constituency: {
                select: {
                    province: true,
                    district_number: true,
                },
            },
        },
    });
    const promises = result.map(async (candidate) => ({
        id: candidate.id,
        title: candidate.title,
        first_name: candidate.first_name,
        last_name: candidate.last_name,
        number: candidate.number,
        image_url: await getFullS3Url(candidate.image_url),
        party_id: candidate.party_id,
        constituency_id: candidate.constituency_id,
        party_name: candidate.Party.name,
        party_logo_url: await getFullS3Url(candidate.Party.logo_url),
        province: candidate.Constituency.province,
        district_number: candidate.Constituency.district_number,
    }));
    
    return Promise.all(promises) as unknown as any[];
};


export const updateCandidate = async (id: number,updatedData: any): Promise<any> => {
    const { title, first_name, last_name, number, image_url, party_id, constituency_id } = updatedData;
    return await prisma.candidate.update({
        where: { id },
        data: {
            title,
            first_name,
            last_name,
            number,
            image_url,
            party_id,
            constituency_id,
        },
    });
};

export const addCandidate = async (candidateData: any): Promise<void> => {
    //update regular user to candidate by inserting into candidate table with user id and constituency id and party id
    const { title, first_name, last_name, number, image_url, party_id, constituency_id } = candidateData;
    // await prisma.$queryRaw`
    //     INSERT INTO "Candidate" (title, first_name, last_name, number, image_url, party_id, constituency_id)
    //     VALUES (${title}, ${first_name}, ${last_name}, ${number}, ${image_url}, ${party_id}, ${constituency_id})
    // `;
    await prisma.candidate.create({
        data: {
            title,
            first_name,
            last_name,
            number,
            image_url,
            party_id,
            constituency_id,
        },
    }); 
};

// Get ballot statistics by constituency for the ballot page
export const getBallotStatisticsByConstituency = async () => {
    const constituencies = await prisma.constituency.findMany({
        select: {
            id: true,
            province: true,
            district_number: true,
            is_closed: true,
        },
        orderBy: [
            { province: 'asc' },
            { district_number: 'asc' }
        ]
    });

    const stats = await Promise.all(
        constituencies.map(async (c) => {
            // Get total votes cast in this constituency (votes with candidate_id)
            const votesWithCandidate = await prisma.vote.count({
                where: {
                    Candidate: {
                        constituency_id: c.id
                    }
                }
            });

            // Get no-votes (votes with null candidate_id from this constituency's voters) using raw SQL
            const noVotesResult = await prisma.$queryRaw<{count: bigint}[]>`
                SELECT COUNT(*) as count FROM "Vote" v
                WHERE v.candidate_id IS NULL
                AND v.user_id IN (SELECT id FROM "User" WHERE constituency_id = ${c.id})
            `;
            const noVotes = Number(noVotesResult[0]?.count || 0);

            // Get registered voters in this constituency
            const registeredVoters = await prisma.user.count({
                where: {
                    constituency_id: c.id
                }
            });

            const totalCast = votesWithCandidate + noVotes;
            const turnout = registeredVoters > 0 ? (totalCast / registeredVoters) * 100 : 0;

            return {
                id: c.id,
                name: `${c.province} เขต ${c.district_number}`,
                province: c.province,
                district_number: c.district_number,
                is_closed: c.is_closed,
                progress: Math.round(turnout),
                status: c.is_closed ? 'Complete' : (totalCast > 0 ? 'Reporting' : 'Pending'),
                ballotsTotal: registeredVoters,
                ballotsCast: totalCast,
                lastUpdated: new Date().toLocaleString('th-TH')
            };
        })
    );

    return stats;
};

