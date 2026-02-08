// Vote Request DTOs
export interface CreateVoteRequest {
    userId: string;
    candidateId: number;
}

// Vote Response DTOs
export interface VoteResponse {
    id: number;
    userId: string;
    candidateId: number;
    createdAt: Date;
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
