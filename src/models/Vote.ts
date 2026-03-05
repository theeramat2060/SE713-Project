/**
 * Vote Model
 * Represents a vote cast by a user for a candidate
 * 
 * Fields:
 * - id: Unique vote identifier
 * - user_id: Who voted (user ID)
 * - candidate_id: Who they voted for (candidate ID)
 * - created_at: When the vote was cast
 * - updated_at: When the vote was last updated
 */
export class Vote {
    id: string;
    user_id: string;
    candidate_id: number;
    created_at: Date;
    updated_at: Date;

    constructor(data: Vote) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.candidate_id = data.candidate_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Check if vote record is valid
     */
    isValid(): boolean {
        return !!(this.id && 
                  this.id.length > 0 &&
                  this.user_id && 
                  this.user_id.length > 0 &&
                  this.candidate_id > 0);
    }

    /**
     * Check if vote is recent (cast within last 24 hours)
     */
    isRecent(): boolean {
        const voteDate = new Date(this.created_at);
        const now = new Date();
        const hoursSinceVote = (now.getTime() - voteDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceVote < 24;
    }

    /**
     * Get time since vote was cast (in hours)
     */
    getTimeSinceCast(): number {
        const voteDate = new Date(this.created_at);
        const now = new Date();
        return (now.getTime() - voteDate.getTime()) / (1000 * 60 * 60);
    }

    /**
     * Check if vote has been modified
     */
    hasBeenModified(): boolean {
        return new Date(this.created_at).getTime() !== new Date(this.updated_at).getTime();
    }

    /**
     * Convert to plain object
     */
    toPlainObject() {
        return {
            id: this.id,
            user_id: this.user_id,
            candidate_id: this.candidate_id,
            created_at: this.created_at,
            updated_at: this.updated_at,
        };
    }
}

/**
 * VoteWithCandidate Model
 * Vote with detailed candidate information
 */
export class VoteWithCandidateModel extends Vote {
    candidate_title: string = '';
    candidate_first_name: string = '';
    candidate_last_name: string = '';
    candidate_number: number = 0;
    party_id: number = 0;
    party_name: string = '';
    party_logo_url: string = '';

    constructor(
        data: Vote,
        candidateTitle: string = '',
        candidateFirstName: string = '',
        candidateLastName: string = '',
        candidateNumber: number = 0,
        partyId: number = 0,
        partyName: string = '',
        partyLogoUrl: string = ''
    ) {
        super(data);
        this.candidate_title = candidateTitle;
        this.candidate_first_name = candidateFirstName;
        this.candidate_last_name = candidateLastName;
        this.candidate_number = candidateNumber;
        this.party_id = partyId;
        this.party_name = partyName;
        this.party_logo_url = partyLogoUrl;
    }

    /**
     * Get candidate's full name
     */
    getCandidateFullName(): string {
        return `${this.candidate_title} ${this.candidate_first_name} ${this.candidate_last_name}`;
    }

    /**
     * Get candidate's short name
     */
    getCandidateShortName(): string {
        return `${this.candidate_first_name} ${this.candidate_last_name}`;
    }

    /**
     * Get ballot number as string
     */
    getBallotNumber(): string {
        return this.candidate_number.toString().padStart(3, '0');
    }

    /**
     * Convert to plain object with candidate details
     */
    toPlainObject() {
        return {
            ...super.toPlainObject(),
            candidate_title: this.candidate_title,
            candidate_first_name: this.candidate_first_name,
            candidate_last_name: this.candidate_last_name,
            candidate_full_name: this.getCandidateFullName(),
            candidate_number: this.candidate_number,
            party_id: this.party_id,
            party_name: this.party_name,
            party_logo_url: this.party_logo_url,
        };
    }
}
