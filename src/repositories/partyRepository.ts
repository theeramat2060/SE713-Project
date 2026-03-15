import prisma from '../config/prisma';

export const findPartyById = async (id: number) => {
   return  await prisma.party.findUnique({
       select:{
            id: true,
            name: true,
            logo_url: true,
            policy: true,
            created_at: true,
       },
       where: { id }
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