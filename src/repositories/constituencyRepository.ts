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

