// EC (Election Commission) Request DTOs
export interface CastVoteRequest {
    userId: string;
    candidateId: number;
}

// EC Response DTOs
export interface VoteResponse {
    success: boolean;
    voteId?: number;
    message: string;
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

export interface CloseVotingRequest {
    isClosed: boolean;
}

export interface PartiesInfoResponse {
    id: number;
    name: string;
    logo_url: string;
    policy?: string;
    created_at?: Date;
}

export interface PartyInfoResponse extends PartiesInfoResponse {
    candidates: {
        id: number;
        title: string;
        first_name: string;
        last_name: string;
        number: number;
        image_url?: string;
        province: string;
        district_number: number;
    }[];
}

export interface CreatePartyRequest {
    name: string;
    logo_url?: string;
    policy?: string;
}

export interface DeletePartyRequest {
    id: number;
}

export interface GetCandidateForEditRequest {
    name: string;
    constituencyId?: number;
}

export interface AddCandidateData {
    title: string;
    first_name: string;
    last_name: string;
    number: number;
    image_url?: string;
    party_id: number;
    constituency_id: number;
}

export interface DeleteCandidateRequest {
    id: number;
}
