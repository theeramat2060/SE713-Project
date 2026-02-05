import pool from '../config/db';
import type {User, UserWithConstituency} from '../types/models';

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
    const query = `
        INSERT INTO "User" (national_id, password, title, first_name, last_name, address, role, constituency_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7,
                $8) RETURNING id, national_id, password, title, first_name, last_name, address, role, constituency_id, created_at
    `;

    const result = await pool.query<User>(query, [
        nationalId,
        hashedPassword,
        title,
        firstName,
        lastName,
        address,
        role,
        constituencyId,
    ]);

    return result.rows[0]!;
};

export const findUserByNationalId = async (nationalId: string): Promise<User | null> => {
    const query = `
        SELECT id,
               national_id,
               password,
               title,
               first_name,
               last_name,
               address,
               role,
               constituency_id,
               created_at
        FROM "User"
        WHERE national_id = $1
    `;

    const result = await pool.query<User>(query, [nationalId]);

    return result.rows[0] ?? null;
};

export const getUserById = async (id: string): Promise<User | null> => {
    const query = `
        SELECT id,
               national_id,
               password,
               title,
               first_name,
               last_name,
               address,
               role,
               constituency_id,
               created_at
        FROM "User"
        WHERE id = $1
    `;

    const result = await pool.query<User>(query, [id]);

    return result.rows[0] ?? null;
};

export const getUserWithConstituency = async (id: string): Promise<UserWithConstituency | null> => {
    const query = `
        SELECT u.id,
               u.national_id,
               u.password,
               u.title,
               u.first_name,
               u.last_name,
               u.address,
               u.role,
               u.constituency_id,
               u.created_at,
               c.province,
               c.district_number,
               c.is_closed
        FROM "User" u
                 JOIN "Constituency" c ON u.constituency_id = c.id
        WHERE u.id = $1
    `;

    const result = await pool.query<UserWithConstituency>(query, [id]);

    return result.rows[0] ?? null;
};
