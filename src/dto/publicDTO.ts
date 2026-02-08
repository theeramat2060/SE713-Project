// Public API Response DTOs
export interface ConstituencyResponse {
    id: number;
    province: string;
    district_number: number;
    is_closed: boolean;
}

export interface CandidateResponse {
    id: number;
    title: string;
    first_name: string;
    last_name: string;
    number: number;
    image_url: string;
    party_id: number;
    party_name: string;
    party_logo_url: string;
    vote_count: number;
}

export interface ConstituencyResultsResponse {
    constituency: ConstituencyResponse;
    candidates: CandidateResponse[];
}

export interface PartyResponse {
    id: number;
    name: string;
    logo_url: string;
}

export interface PartyDetailsResponse {
    id: number;
    name: string;
    logo_url: string;
    policy: string;
    created_at: Date;
    candidates: {
        id: number;
        title: string;
        first_name: string;
        last_name: string;
        number: number;
        image_url: string;
        province: string;
        district_number: number;
    }[];
}

export interface PartyOverviewResponse {
    totalSeats: number;
    closedConstituencies: number;
    parties: {
        id: number;
        name: string;
        logoUrl: string;
        seats: number;
    }[];
}

// Generic Service Result
export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code: number;
    };
}
