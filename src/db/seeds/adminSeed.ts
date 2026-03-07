export interface AdminSeedRecord {
    username: string;
    password: string;
    created_at: Date;
}

export const adminSeedData: AdminSeedRecord[] = [
    {
        username: 'admin_main',
        password: '$2a$10$YBC.GRDVdXFKUNL67YoHJeKVKLZSFRLzvGE5Pxmxvvx5TxKr4X0/m', // bcrypt(password123)
        created_at: new Date('2026-01-01T08:00:00Z'),
    },
    {
        username: 'admin_backup',
        password: '$2a$10$YBC.GRDVdXFKUNL67YoHJeKVKLZSFRLzvGE5Pxmxvvx5TxKr4X0/m', // bcrypt(password123)
        created_at: new Date('2026-01-05T10:30:00Z'),
    },
];
