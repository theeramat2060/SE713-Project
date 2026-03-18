export interface UserSeedRecord {
    national_id: string;
    password: string;
    title: string;
    first_name: string;
    last_name: string;
    address: string;
    constituency_id: number;
    created_at: Date;
}

export const userSeedData: UserSeedRecord[] = [
    // Bangkok Constituency 1 Voters
    {
        national_id: '1234567890001',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'VANNN',
        last_name: 'Voter1',
        address: '123 Sukhumvit Rd, Bangkok 10110',
        constituency_id: 1,
        created_at: new Date('2026-01-10T10:00:00Z'),
    },
    {
        national_id: '1234567890002',
        password: 'voter123',
        title: 'Ms.',
        first_name: 'Jane',
        last_name: 'Voter2',
        address: '456 Sukhumvit Rd, Bangkok 10110',
        constituency_id: 1,
        created_at: new Date('2026-01-10T10:15:00Z'),
    },
    {
        national_id: '1234567890003',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Bob',
        last_name: 'Voter3',
        address: '789 Sukhumvit Rd, Bangkok 10110',
        constituency_id: 1,
        created_at: new Date('2026-01-10T10:30:00Z'),
    },

    // Bangkok Constituency 2 Voters
    {
        national_id: '1234567890004',
        password: 'voter123',
        title: 'Ms.',
        first_name: 'Alice',
        last_name: 'Voter4',
        address: '111 Rama IV Rd, Bangkok 10100',
        constituency_id: 2,
        created_at: new Date('2026-01-10T11:00:00Z'),
    },
    {
        national_id: '1234567890005',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Charlie',
        last_name: 'Voter5',
        address: '222 Rama IV Rd, Bangkok 10100',
        constituency_id: 2,
        created_at: new Date('2026-01-10T11:15:00Z'),
    },

    // Bangkok Constituency 3 Voters (CLOSED)
    {
        national_id: '1234567890006',
        password: 'voter123',
        title: 'Ms.',
        first_name: 'Diana',
        last_name: 'Voter6',
        address: '333 Silom Rd, Bangkok 10500',
        constituency_id: 3,
        created_at: new Date('2026-01-10T12:00:00Z'),
    },
    {
        national_id: '1234567890007',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Edward',
        last_name: 'Voter7',
        address: '444 Silom Rd, Bangkok 10500',
        constituency_id: 3,
        created_at: new Date('2026-01-10T12:15:00Z'),
    },

    // Chiang Mai Constituency 1 Voters
    {
        national_id: '1234567890008',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Frank',
        last_name: 'Voter8',
        address: '555 Nimmanhaemin Rd, Chiang Mai 50200',
        constituency_id: 4,
        created_at: new Date('2026-01-11T09:00:00Z'),
    },
    {
        national_id: '1234567890009',
        password: 'voter123',
        title: 'Ms.',
        first_name: 'Grace',
        last_name: 'Voter9',
        address: '666 Nimmanhaemin Rd, Chiang Mai 50200',
        constituency_id: 4,
        created_at: new Date('2026-01-11T09:15:00Z'),
    },

    // Chiang Mai Constituency 2 Voters (CLOSED)
    {
        national_id: '1234567890010',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Henry',
        last_name: 'Voter10',
        address: '777 Huay Kaew Rd, Chiang Mai 50300',
        constituency_id: 5,
        created_at: new Date('2026-01-11T10:00:00Z'),
    },
    {
        national_id: '1234567890011',
        password: 'voter123',
        title: 'Ms.',
        first_name: 'Iris',
        last_name: 'Voter11',
        address: '888 Huay Kaew Rd, Chiang Mai 50300',
        constituency_id: 5,
        created_at: new Date('2026-01-11T10:15:00Z'),
    },

    // Phuket Constituency 1 Voters
    {
        national_id: '1234567890012',
        password: 'voter123',
        title: 'Mr.',
        first_name: 'Jack',
        last_name: 'Voter12',
        address: '999 Phuket Rd, Phuket 83000',
        constituency_id: 6,
        created_at: new Date('2026-01-12T08:00:00Z'),
    },
];
