import prisma from '../config/prisma';
import { getFullS3Url } from './ecRepository';

export const findPartyById = async (id: number) => {
  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      Candidate: {
        include: {
          Constituency: true
        }
      }
    }
  });

  if (!party) return null;

  // Convert logo URL to signed URL if it's a file key
  const signedLogoUrl = (await getFullS3Url(party.logo_url)) || party.logo_url || '';

  // Convert candidate images to signed URLs
  const candidatesWithSignedUrls = await Promise.all(
    party.Candidate.map(async (c) => ({
      ...c,
      image_url: (await getFullS3Url(c.image_url)) || c.image_url || ''
    }))
  );

  return {
    ...party,
    logo_url: signedLogoUrl,
    Candidate: candidatesWithSignedUrls
  };
};

export const findAllParties = async () => {
  const parties = await prisma.party.findMany({
    orderBy: { name: "asc" },
  });

  // Convert logo URLs to signed URLs for all parties
  return Promise.all(
    parties.map(async (p) => ({
      ...p,
      logo_url: (await getFullS3Url(p.logo_url)) || p.logo_url || ''
    }))
  );
};


export const findPartyByName = async (name: string)=> {
    return await prisma.party.findFirst({
        where: {
            name: {
                contains: name,
                mode: 'insensitive'
            }
        }
    });
};