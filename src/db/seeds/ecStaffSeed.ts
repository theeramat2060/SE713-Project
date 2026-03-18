export interface ECStaffSeedRecord {
    national_id: string;
    password: string;
    title: string;
    first_name: string;
    last_name: string;
    email?: string;
    constituency_id: number;
    status: 'ACTIVE' | 'INACTIVE';
    admin_id: number;
    created_at: Date;
}

export const ecStaffSeedData: ECStaffSeedRecord[] = [
    {
        national_id: '9999999999901',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Somchai',
        last_name: 'EC1',
        email: 'somchai@election-commission.th',
        constituency_id: 1,
        status: 'ACTIVE',
        admin_id: 1,
        created_at: new Date('2025-12-01T09:00:00Z'),
    },
    {
        national_id: '9999999999902',
        password: 'voter123',
        title: 'Ms.',
        first_name: 'Niran',
        last_name: 'EC2',
        email: 'niran@election-commission.th',
        constituency_id: 4,
        status: 'ACTIVE',
        admin_id: 1,
        created_at: new Date('2025-12-01T10:00:00Z'),
    },
];
