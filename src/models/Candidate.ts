/**
 * Candidate Model
 * Represents a political candidate
 * 
 * Fields:
 * - id: Unique candidate identifier
 * - title: Mr, Mrs, Ms, etc.
 * - first_name: Candidate's first name
 * - last_name: Candidate's last name
 * - number: Candidate number (on ballot)
 * - image_url: URL to candidate photo
 * - party_id: Which party candidate belongs to
 * - constituency_id: Which constituency candidate is running in
 * - created_at: When candidate was registered
 */
export class Candidate {
    id: number;
    title: string;
    first_name: string;
    last_name: string;
    number: number;
    image_url: string;
    party_id: number;
    constituency_id: number;
    created_at: Date;

    constructor(data: Candidate) {
        this.id = data.id;
        this.title = data.title;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.number = data.number;
        this.image_url = data.image_url;
        this.party_id = data.party_id;
        this.constituency_id = data.constituency_id;
        this.created_at = data.created_at;
    }

    /**
     * Check if candidate record is valid
     */
    isValid(): boolean {
        return !!(this.id > 0 && 
                  this.first_name && 
                  this.first_name.length > 0 &&
                  this.last_name && 
                  this.last_name.length > 0 &&
                  this.number > 0 &&
                  this.party_id > 0 &&
                  this.constituency_id > 0);
    }

    /**
     * Get candidate's full name
     */
    getFullName(): string {
        return `${this.title} ${this.first_name} ${this.last_name}`;
    }

    /**
     * Get short name (first + last)
     */
    getShortName(): string {
        return `${this.first_name} ${this.last_name}`;
    }

    /**
     * Get ballot number as string
     */
    getBallotNumber(): string {
        return this.number.toString().padStart(3, '0');
    }

    /**
     * Check if candidate has valid image URL
     */
    hasValidImage(): boolean {
        return !!(this.image_url && 
                  this.image_url.length > 0 &&
                  (this.image_url.startsWith('http') || this.image_url.startsWith('/')));
    }

    /**
     * Get image URL with fallback
     */
    getImageUrl(fallback: string = '/default-candidate.png'): string {
        return this.hasValidImage() ? this.image_url : fallback;
    }

    /**
     * Check if candidate is active
     */
    isActive(): boolean {
        const createdDate = new Date(this.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation < 36500; // 100 years
    }

    /**
     * Convert to plain object
     */
    toPlainObject() {
        return {
            id: this.id,
            title: this.title,
            first_name: this.first_name,
            last_name: this.last_name,
            full_name: this.getFullName(),
            number: this.number,
            ballot_number: this.getBallotNumber(),
            image_url: this.image_url,
            party_id: this.party_id,
            constituency_id: this.constituency_id,
            created_at: this.created_at,
        };
    }
}

/**
 * CandidateWithPartyAndVotes Model
 * Candidate with party information and vote count
 */
export class CandidateWithVotesModel extends Candidate {
    party_name: string = '';
    party_logo_url: string = '';
    vote_count: number = 0;

    constructor(data: Candidate, partyName: string = '', partyLogoUrl: string = '', voteCount: number = 0) {
        super(data);
        this.party_name = partyName;
        this.party_logo_url = partyLogoUrl;
        this.vote_count = voteCount;
    }

    /**
     * Get vote percentage (requires total votes context)
     */
    getVotePercentage(totalVotes: number): number {
        if (totalVotes === 0) return 0;
        return (this.vote_count / totalVotes) * 100;
    }

    /**
     * Check if candidate is leading
     */
    isLeading(otherVotes: number[]): boolean {
        return this.vote_count > 0 && 
               otherVotes.every(votes => this.vote_count >= votes);
    }

    /**
     * Check if candidate has any votes
     */
    hasVotes(): boolean {
        return this.vote_count > 0;
    }

    /**
     * Convert to plain object with votes
     */
    toPlainObject() {
        return {
            ...super.toPlainObject(),
            party_name: this.party_name,
            party_logo_url: this.party_logo_url,
            vote_count: this.vote_count,
            votes: this.vote_count, // alias
        };
    }
}
