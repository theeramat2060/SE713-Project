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
