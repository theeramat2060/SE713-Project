import {PrismaPg} from "@prisma/adapter-pg";
import {$UserPayload, Prisma__UserClient } from "../generated/prisma/models";
import {DefaultArgs, GetResult, PrismaClientOptions } from "@prisma/client/runtime/client";

/**
 * User Model
 * Represents a voter or election commission staff member
 * 
 * Fields:
 * - id: Unique user identifier
 * - national_id: National ID (unique)
 * - password: Hashed password
 * - title: Mr, Mrs, Ms, etc.
 * - first_name: User's first name
 * - last_name: User's last name
 * - address: Residential address
 * - role: VOTER or EC (election commission)
 * - constituency_id: Which constituency user belongs to
 * - created_at: When account was created
 */
export class User {
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

    constructor(data: User) {
        this.id = data.id;
        this.national_id = data.national_id;
        this.password = data.password;
        this.title = data.title;
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.address = data.address;
        this.role = data.role;
        this.constituency_id = data.constituency_id;
        this.created_at = data.created_at;
    }

    /**
     * Check if user record is valid
     */
    isValid(): boolean {
        return !!(this.id && 
                  this.id.length > 0 &&
                  this.national_id && 
                  this.national_id.length > 0 &&
                  this.first_name && 
                  this.first_name.length > 0 &&
                  this.last_name && 
                  this.last_name.length > 0 &&
                  (this.role === 'VOTER' || this.role === 'EC') &&
                  this.constituency_id > 0);
    }

    /**
     * Get user's full name
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
     * Check if user is a voter
     */
    isVoter(): boolean {
        return this.role === 'VOTER';
    }

    /**
     * Check if user is election commission staff
     */
    isEC(): boolean {
        return this.role === 'EC';
    }

    /**
     * Check if user account is active
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
            national_id: this.national_id,
            title: this.title,
            first_name: this.first_name,
            last_name: this.last_name,
            full_name: this.getFullName(),
            address: this.address,
            role: this.role,
            constituency_id: this.constituency_id,
            created_at: this.created_at,
        };
    }
}
