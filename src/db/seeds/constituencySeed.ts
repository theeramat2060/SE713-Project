/**
 * Constituency Seed Data
 * Electoral constituencies (เขตเลือกตั้ง)
 */

export interface ConstituencySeedRecord {
    province: string;
    district_number: number;
    is_closed: boolean;
}

export const constituencySeedData: ConstituencySeedRecord[] = [
    {
        province: 'Bangkok',
        district_number: 1,
        is_closed: false,
    },
    {
        province: 'Bangkok',
        district_number: 2,
        is_closed: false,
    },
    {
        province: 'Bangkok',
        district_number: 3,
        is_closed: true, // Voting closed, results announced
    },
    {
        province: 'Chiang Mai',
        district_number: 1,
        is_closed: false,
    },
    {
        province: 'Chiang Mai',
        district_number: 2,
        is_closed: true, // Voting closed, results announced
    },
    {
        province: 'Phuket',
        district_number: 1,
        is_closed: false,
    },
];
