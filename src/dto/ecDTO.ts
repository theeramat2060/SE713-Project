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
