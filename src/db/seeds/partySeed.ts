export interface PartySeedRecord {
    name: string;
    policy: string;
    logo_url: string;
    created_at: Date;
}

export const partySeedData: PartySeedRecord[] = [
    {
        name: 'Pheu Thai Party',
        policy: 'Focus on education and healthcare reforms',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Pheu_Thai_Party_logo.png/220px-Pheu_Thai_Party_logo.png',
        created_at: new Date('2025-06-01T09:00:00Z'),
    },
    {
        name: 'Bhumjaithai Party',
        policy: 'Economic development and infrastructure investment',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Bhumjaithai_Party_logo.png/220px-Bhumjaithai_Party_logo.png',
        created_at: new Date('2025-06-15T10:00:00Z'),
    },
    {
        name: 'Thai Rak Thai Party',
        policy: 'Community-driven policies and transparency initiatives',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/Thai_Rak_Thai_party.png/220px-Thai_Rak_Thai_party.png',
        created_at: new Date('2025-07-01T11:00:00Z'),
    },
    {
        name: 'Thai Sang Thai Party',
        policy: 'Environmental sustainability and climate action',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/Thai_Sang_Thai_party_logo.png/220px-Thai_Sang_Thai_party_logo.png',
        created_at: new Date('2025-07-20T14:00:00Z'),
    },
    {
        name: 'Palang Pracharath Party',
        policy: 'National stability and unity initiatives',
        logo_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Palang_Pracharath_logo.png/220px-Palang_Pracharath_logo.png',
        created_at: new Date('2025-08-05T15:30:00Z'),
    },
];
