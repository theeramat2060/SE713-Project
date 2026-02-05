export interface Admin {
    id: number;
    username: string;
    password: string;
    created_at: Date;
}

export interface User {
    id: string;
    national_id: string;
    password: string;
    title: string;
    first_name: string;
    last_name: string;
    address: string;
    role: 'VOTER' | 'EC';
    constituency_id: number;
    created_at: Date;
}

export interface UserWithConstituency extends User {
    province: string;
    district_number: number;
    is_closed: boolean;
}

export interface Constituency {
    id: number;
    province: string;
    district_number: number;
    is_closed: boolean;
}

export interface Party {
    id: number;
    name: string;
    logo_url: string;
    policy: string;
    created_at: Date;
}

export interface PartyWithCandidates extends Party {
    candidates: CandidateWithConstituency[];
}

export interface Candidate {
    id: number;
    title: string;
    first_name: string;
    last_name: string;
    number: number;
    image_url: string;
    party_id: number;
    constituency_id: number;
    created_at: Date;
}

export interface CandidateWithConstituency extends Candidate {
    province: string;
    district_number: number;
    is_closed: boolean;
}

export interface CandidateWithPartyAndVotes extends Candidate {
    party_name: string;
    party_logo_url: string;
    vote_count: number;
}

export interface Vote {
    id: string;
    user_id: string;
    candidate_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface VoteWithCandidate extends Vote {
    candidate_title: string;
    candidate_first_name: string;
    candidate_last_name: string;
    candidate_number: number;
    party_id: number;
    party_name: string;
    party_logo_url: string;
}
