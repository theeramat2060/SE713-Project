import prisma from '../config/prisma';
import { Admin } from '../models';

export const createAdmin = async (username: string, hashedPassword: string): Promise<Admin> => {
    const result = await prisma.$queryRaw<Admin[]>`
        INSERT INTO "Admin" (username, password)
        VALUES (${username}, ${hashedPassword}) RETURNING id, username, password, created_at
    `;

    return result[0]!;
};

export const findAdminByUsername = async (username: string): Promise<Admin | null> => {
    const result = await prisma.$queryRaw<Admin[]>`
        SELECT id, username, password, created_at
        FROM "Admin"
        WHERE username = ${username}
    `;

    return result[0] ?? null;
};

export const getAdminById = async (id: number): Promise<Admin | null> => {
    const result = await prisma.$queryRaw<Admin[]>`
        SELECT id, username, password, created_at
        FROM "Admin"
        WHERE id = ${id}
    `;

    return result[0] ?? null;
};

export const updateUserRole = async (adminId: number, newRole: string): Promise<void> => {
    await prisma.$queryRaw`
        UPDATE "Admin"
        SET role = ${newRole}
        WHERE id = ${adminId}
    `;
};

export const addConstituency = async (name: string): Promise<void> => {
    await prisma.$queryRaw`
        INSERT INTO "Constituency" (name)
        VALUES (${name})
    `;
};

export const removeConstituency = async (id: number): Promise<void> => {
    await prisma.$queryRaw`
        DELETE FROM "Constituency"
        WHERE id = ${id}
    `;
};
