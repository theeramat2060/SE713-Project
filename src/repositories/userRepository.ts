import prisma from '../config/prisma';
import { User } from '../models';


export const createUser = async (
    nationalId: string,
    hashedPassword: string,
    title: string,
    firstName: string,
    lastName: string,
    address: string,
    constituencyId: number
): Promise<User> => {
    const userData = await prisma.user.create({
        data: {
            national_id: nationalId,
            password: hashedPassword,
            title,
            first_name: firstName,
            last_name: lastName,
            address: address,
            constituency_id: constituencyId,
        },
    });

        // @ts-ignore
    return new User(userData);
};

export const findUserByNationalId = async (nationalId: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: { national_id: nationalId },
    });

    if (!user) return null;

    // @ts-ignore
    return new User(user);
};

export const getUserById = async (id: string): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) return null;

    // @ts-ignore
    return new User(user);
};

export const getUserWithConstituency = async (id: string): Promise<{
    id: string;
    national_id: string;
    password: string;
    title: string;
    first_name: string;
    last_name: string;
    address: string;
    constituency_id: number | null;
    created_at: Date | null;
    province: any | null;
    district_number: any | null;
} | null> => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            national_id: true,
            password: true,
            title: true,
            first_name: true,
            last_name: true,
            address: true,
            constituency_id: true,
            created_at: true,
            Constituency: {
                select: {
                    province: true,
                    district_number: true,
                },
            },
        },
    });

    if (!user) return null;

    return {
        id: user.id,
        national_id: user.national_id,
        password: user.password,
        title: user.title,
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address,
        constituency_id: user.constituency_id ?? null,
        created_at: user.created_at ?? null,
        province: user.Constituency?.province ?? null,
        district_number: user.Constituency?.district_number ?? null,
    };
};
