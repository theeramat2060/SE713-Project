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

export const updateUserRole = async (Id: number, newRole: string): Promise<void> => {
    await prisma.$queryRaw`
        UPDATE "User"
        SET role = ${newRole}
        WHERE national_id = ${Id}
    `;
  
  //NOTE: rold are not in user table anymore 
    // await prisma.user.update({
    //     where: { national_id: String(Id) },
    //     data: { role: newRole }
    // });
}


export const addConstituency = async (data:any): Promise<any> => {
    // const result = await prisma.$queryRaw<any[]>`
    //     INSERT INTO "Constituency" (province, district_number, is_closed)
    //     VALUES (${data.province}, ${data.district_number}, ${data.is_closed}) RETURNING *
    // `;
    // return result[0]?? null;
    const result = await prisma.constituency.create({
        data: {
            province: data.province,
            district_number: data.district_number,
            is_closed: data.is_closed
        }
    });
    return result;
};

export const removeConstituency = async (province: string, district_number: number): Promise<void> => {
    // await prisma.$queryRaw`
    //     DELETE FROM "Constituency"
    //     WHERE province = ${province} AND district_number = ${district_number}
    // `;
    await prisma.constituency.deleteMany({
        where: {
            province,
            district_number
        }
    });
};

export const createNewUser = async (data: any): Promise<any> => {
    // const result = await prisma.$queryRaw<any[]>`
    //     INSERT INTO "User" (password, national_id, title , first_name, last_name, address, constituency_id)
    //     VALUES (${data.password}, ${data.national_id}, ${data.title}, ${data.first_name}, ${data.last_name}, ${data.address}, ${data.constituency_id}) RETURNING *
    // `;
    // return result[0]?? null;
    const result = await prisma.user.create({
        data: {
            password: data.password,
            national_id: data.national_id,
            title: data.title,
            first_name: data.first_name,
            last_name: data.last_name,
            address: data.address,
            constituency_id: data.constituency_id
        }
    });
    return result;
};
