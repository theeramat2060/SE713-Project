import prisma from '../config/prisma';
import { getFullS3Url } from './ecRepository';

export const getCandidateById = async (id: number) => {
    const result = await prisma.$queryRaw<any[]>`
        SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
               c.party_id, c.constituency_id, c.created_at,
               p.name as party_name, p.logo_url as party_logo_url,
               con.province, con.district_number, con.is_closed
        FROM "Candidate" c
        JOIN "Party" p ON c.party_id = p.id
        JOIN "Constituency" con ON c.constituency_id = con.id
        WHERE c.id = ${id}
    `;
    
    const candidate = result[0] ?? null;
    if (!candidate) return null;
    
    // Convert image URLs to signed URLs
    const signedImageUrl = await getFullS3Url(candidate.image_url);
    const signedPartyLogoUrl = await getFullS3Url(candidate.party_logo_url);
    
    // Structure the response to include constituency object
    return {
        ...candidate,
        image_url: signedImageUrl || candidate.image_url || '',
        party_logo_url: signedPartyLogoUrl || candidate.party_logo_url || '',
        constituency: {
            is_closed: candidate.is_closed,
            province: candidate.province,
            district_number: candidate.district_number,
        }
    };
};

export const getCandidatesByConstituencyId = async (constituencyId: number) => {
    const result = await prisma.$queryRaw<any[]>`
        SELECT c.id, c.title, c.first_name, c.last_name, c.number, c.image_url,
               c.party_id, c.constituency_id, c.created_at,
               p.name as party_name, p.logo_url as party_logo_url,
               con.province, con.district_number, con.is_closed
        FROM "Candidate" c
        JOIN "Party" p ON c.party_id = p.id
        JOIN "Constituency" con ON c.constituency_id = con.id
        WHERE c.constituency_id = ${constituencyId}
        ORDER BY c.number ASC
    `;
    
    // Convert image URLs to signed URLs for all candidates
    return Promise.all(result.map(async (candidate) => ({
        ...candidate,
        image_url: (await getFullS3Url(candidate.image_url)) || candidate.image_url || '',
        party_logo_url: (await getFullS3Url(candidate.party_logo_url)) || candidate.party_logo_url || '',
        constituency: {
            is_closed: candidate.is_closed,
            province: candidate.province,
            district_number: candidate.district_number,
        }
    })));
};

