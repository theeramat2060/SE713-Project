import prisma from '../config/prisma';
import { User } from '../models';

type UserWithConstituency = User & { province?: string; district_number?: number };

export const createUser = async (
    nationalId: string,
    hashedPassword: string,
    title: string,
    firstName: string,
    lastName: string,
    address: string,
    role: 'VOTER' | 'EC',
    constituencyId: number
): Promise<User> => {
    const result = await prisma.$queryRaw<User[]>`
        INSERT INTO "User" (national_id, password, title, first_name, last_name, address, role, constituency_id)
        VALUES (${nationalId}, ${hashedPassword}, ${title}, ${firstName}, ${lastName}, ${address}, ${role}, ${constituencyId})
        RETURNING id, national_id, password, title, first_name, last_name, address, role, constituency_id, created_at
    `;

    return result[0]!;
};

export const findUserByNationalId = async (nationalId: string): Promise<User | null> => {
    const result = await prisma.$queryRaw<User[]>`
        SELECT id, national_id, password, title, first_name, last_name, address, role, constituency_id, created_at
        FROM "User"
        WHERE national_id = ${nationalId}
    `;

    return result[0] ?? null;
};

export const getUserById = async (id: string): Promise<User | null> => {
    const result = await prisma.$queryRaw<User[]>`
        SELECT id, national_id, password, title, first_name, last_name, address, role, constituency_id, created_at
        FROM "User"
        WHERE id = ${id}
    `;

    return result[0] ?? null;
};

export const getUserWithConstituency = async (id: string): Promise<UserWithConstituency | null> => {
    const result = await prisma.$queryRaw<UserWithConstituency[]>`
        SELECT u.id, u.national_id, u.password, u.title, u.first_name, u.last_name, u.address, u.role, u.constituency_id, u.created_at,
               c.province, c.district_number, c.is_closed
        FROM "User" u
        JOIN "Constituency" c ON u.constituency_id = c.id
        WHERE u.id = ${id}
    `;

    return result[0] ?? null;
};
