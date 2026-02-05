import pool from '../config/db';
import type {Party} from '../types/models';

export const getPartyById = async (id: number): Promise<Party | null> => {
    const query = `
        SELECT id, name, logo_url, policy, created_at
        FROM "Party"
        WHERE id = $1
    `;

    const result = await pool.query<Party>(query, [id]);
    return result.rows[0] ?? null;
};

export const getPartiesBasic = async (): Promise<any[]> => {
    const query = `
        SELECT id, name, logo_url
        FROM "Party"
        ORDER BY name ASC
    `;

    const result = await pool.query(query);
    return result.rows;
};

export const getPartyWithCandidates = async (id: number): Promise<any | null> => {
    const partyQuery = `
        SELECT id, name, logo_url, policy, created_at
        FROM "Party"
        WHERE id = $1
    `;

    const partyResult = await pool.query<Party>(partyQuery, [id]);
    if (!partyResult.rows[0]) return null;

    const candidatesQuery = `
        SELECT c.id,
               c.title,
               c.first_name,
               c.last_name,
               c.number,
               c.image_url,
               con.province,
               con.district_number
        FROM "Candidate" c
                 JOIN "Constituency" con ON c.constituency_id = con.id
        WHERE c.party_id = $1
        ORDER BY con.province, con.district_number
    `;

    const candidatesResult = await pool.query(candidatesQuery, [id]);

    return {
        ...partyResult.rows[0],
        candidates: candidatesResult.rows,
    };
};

export const getPartyByName = async (name: string): Promise<Party | null> => {
    const query = `
        SELECT id, name, logo_url, policy, created_at
        FROM "Party"
        WHERE name = $1
    `;

    const result = await pool.query<Party>(query, [name]);
    return result.rows[0] ?? null;
};
