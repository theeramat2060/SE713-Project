/**
 * Party Seed Data
 * Political parties (พรรคการเมือง)
 */

export interface PartySeedRecord {
    name: string;
    policy: string;
    logo_url: string;
    created_at: Date;
}

export const partySeedData: PartySeedRecord[] = [
    {
        name: 'Democratic Party',
        policy: 'Focus on education and healthcare reforms',
        logo_url: 'https://via.placeholder.com/150?text=Democratic',
        created_at: new Date('2025-06-01T09:00:00Z'),
    },
    {
        name: 'Progressive Alliance',
        policy: 'Economic development and infrastructure investment',
        logo_url: 'https://via.placeholder.com/150?text=Progressive',
        created_at: new Date('2025-06-15T10:00:00Z'),
    },
    {
        name: 'People First',
        policy: 'Community-driven policies and transparency initiatives',
        logo_url: 'https://via.placeholder.com/150?text=PeopleFirst',
        created_at: new Date('2025-07-01T11:00:00Z'),
    },
    {
        name: 'Green Future',
        policy: 'Environmental sustainability and climate action',
        logo_url: 'https://via.placeholder.com/150?text=GreenFuture',
        created_at: new Date('2025-07-20T14:00:00Z'),
    },
    {
        name: 'Unity Party',
        policy: 'National stability and unity initiatives',
        logo_url: 'https://via.placeholder.com/150?text=Unity',
        created_at: new Date('2025-08-05T15:30:00Z'),
    },
];
