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
        UPDATE "User"
        SET role = ${newRole}
        WHERE national_id = ${adminId}
    `;
}


export const addConstituency = async (data:any): Promise<any> => {
    const result = await prisma.$queryRaw<any[]>`
        INSERT INTO "Constituency" (province, district_number, is_closed)
        VALUES (${data.province}, ${data.district_number}, ${data.is_closed}) RETURNING *
    `;
    return result[0]?? null;
};

export const removeConstituency = async (province: string, district_number: number): Promise<void> => {
    await prisma.$queryRaw`
        DELETE FROM "Constituency"
        WHERE province = ${province} AND district_number = ${district_number}
    `;
};
