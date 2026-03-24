/**
 * Constituency Model
 * Represents an electoral constituency/district
 * 
 * Fields:
 * - id: Unique constituency identifier
 * - province: Which province the constituency is in
 * - district_number: District number within the province
 * - is_closed: Whether voting is closed in this constituency
 */
export class ConstituencyModel {
    id: number;
    province: string;
    district_number: number;
    is_closed: boolean;

    constructor(data: ConstituencyModel) {
        this.id = data.id;
        this.province = data.province;
        this.district_number = data.district_number;
        this.is_closed = data.is_closed;
    }

    /**
     * Check if constituency record is valid
     */
    isValid(): boolean {
        return !!(this.id > 0 && 
                this.province && 
                this.province.length > 0 &&
                this.district_number > 0);
    }

    /**
     * Get constituency display name
     */
    getDisplayName(): string {
        return `${this.province} ${this.district_number}`;
    }

    /**
     * Check if voting is still open in this constituency
     */
    isVotingOpen(): boolean {
        return !this.is_closed;
    }

    /**
     * Check if voting is closed in this constituency
     */
    isVotingClosed(): boolean {
        return this.is_closed;
    }

    /**
     * Get voting status
     */
    getVotingStatus(): 'OPEN' | 'CLOSED' {
        return this.is_closed ? 'CLOSED' : 'OPEN';
    }

    /**
     * Convert to plain object
     */
    toPlainObject() {
        return {
            id: this.id,
            province: this.province,
            district_number: this.district_number,
            name: this.getDisplayName(),
            status: this.getVotingStatus(),
            is_closed: this.is_closed,
        };
    }
}
