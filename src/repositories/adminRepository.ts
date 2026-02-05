import pool from '../config/db';
import type {Admin} from '../types/models';

export const createAdmin = async (username: string, hashedPassword: string): Promise<Admin> => {
    const query = `
        INSERT INTO "Admin" (username, password)
        VALUES ($1, $2) RETURNING id, username, password, created_at
    `;

    const result = await pool.query<Admin>(query, [username, hashedPassword]);

    return result.rows[0]!;
};

export const findAdminByUsername = async (username: string): Promise<Admin | null> => {
    const query = `
        SELECT id, username, password, created_at
        FROM "Admin"
        WHERE username = $1
    `;

    const result = await pool.query<Admin>(query, [username]);

    return result.rows[0] ?? null;
};

export const getAdminById = async (id: number): Promise<Admin | null> => {
    const query = `
        SELECT id, username, password, created_at
        FROM "Admin"
        WHERE id = $1
    `;

    const result = await pool.query<Admin>(query, [id]);

    return result.rows[0] ?? null;
};
