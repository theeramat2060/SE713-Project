/**
 * Party Model
 * Represents a political party
 * 
 * Fields:
 * - id: Unique party identifier
 * - name: Party name
 * - logo_url: URL to party logo/symbol
 * - policy: Party policy/description
 * - created_at: When party was registered
 */
export class Party {
    id: number;
    name: string;
    logo_url: string;
    policy: string;
    created_at: Date;

    constructor(data: Party) {
        this.id = data.id;
        this.name = data.name;
        this.logo_url = data.logo_url;
        this.policy = data.policy;
        this.created_at = data.created_at;
    }

    /**
     * Check if party record is valid
     */
    isValid(): boolean {
        return !!(this.id > 0 && 
                  this.name && 
                  this.name.length > 0 &&
                  this.logo_url && 
                  this.logo_url.length > 0);
    }

    /**
     * Get party display name
     */
    getDisplayName(): string {
        return this.name;
    }

    /**
     * Check if party has valid logo URL
     */
    hasValidLogo(): boolean {
        return !!(this.logo_url && 
                  this.logo_url.length > 0 &&
                  (this.logo_url.startsWith('http') || this.logo_url.startsWith('/')));
    }

    /**
     * Get logo URL with fallback
     */
    getLogoUrl(fallback: string = '/default-logo.png'): string {
        return this.hasValidLogo() ? this.logo_url : fallback;
    }

    /**
     * Check if party is active
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
            name: this.name,
            logoUrl: this.logo_url,
            policy: this.policy,
            created_at: this.created_at,
        };
    }
}

/**
 * PartyWithCandidates Model
 * Party with its candidates
 */
export class PartyWithCandidatesModel extends Party {
    candidates: any[] = [];

    constructor(data: Party, candidates: any[] = []) {
        super(data);
        this.candidates = candidates;
    }

    /**
     * Get number of candidates
     */
    getCandidateCount(): number {
        return this.candidates.length;
    }

    /**
     * Check if party has any candidates
     */
    hasCandidates(): boolean {
        return this.candidates.length > 0;
    }

    /**
     * Convert to plain object with candidates
     */
    toPlainObject() {
        return {
            ...super.toPlainObject(),
            candidates: this.candidates,
            candidateCount: this.getCandidateCount(),
        };
    }
}
