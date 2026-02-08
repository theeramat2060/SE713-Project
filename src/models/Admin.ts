/**
 * Admin Model
 * Represents an admin user in the system
 * 
 * Fields:
 * - id: Unique admin identifier
 * - username: Admin username (unique)
 * - password: Hashed password
 * - created_at: When the admin account was created
 */
export class Admin {
    id: number;
    username: string;
    password: string;
    created_at: Date;

    constructor(data: Admin) {
        this.id = data.id;
        this.username = data.username;
        this.password = data.password;
        this.created_at = data.created_at;
    }

    /**
     * Check if admin record is valid
     */
    isValid(): boolean {
        return !!(this.id > 0 && 
                  this.username && 
                  this.username.length >= 3 && 
                  this.password && 
                  this.password.length > 0);
    }

    /**
     * Get admin display name
     */
    getDisplayName(): string {
        return this.username;
    }

    /**
     * Check if admin account is active (not too old)
     */
    isActive(): boolean {
        const createdDate = new Date(this.created_at);
        const now = new Date();
        const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceCreation < 36500; // 100 years
    }

    /**
     * Convert to plain object (safe for responses)
     */
    toPlainObject() {
        return {
            id: this.id,
            username: this.username,
            created_at: this.created_at,
        };
    }
}
