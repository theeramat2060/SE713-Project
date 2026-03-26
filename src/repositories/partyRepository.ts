import prisma from '../config/prisma';

export const findPartyById = async (id: number) => {
  return await prisma.party.findUnique({
    where: { id },
    include: {
      Candidate: {
        include: {
          Constituency: true
        }
      }
    }
  });
};

export const findAllParties = async () => {
  return await prisma.party.findMany({
    orderBy: { name: "asc" },
  });
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