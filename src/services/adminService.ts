import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as adminRepo from '../repositories/adminRepository';


export class ChangeUserRoleService {
    static async changeUserRole(userId: string, newRole: string): Promise<{ success: boolean }> {
        const validRoles = ['VOTER', 'EC'];
        if (!validRoles.includes(newRole)) {
            throw new Error(`Invalid role: ${newRole}. Valid roles are: ${validRoles.join(', ')}`);
        }
        const user = await adminRepo.updateUserRole(parseInt(userId), newRole);
        
        return {
            success: true,
        };
    }
}

export class AddConstituencyService {
    static async addConstituency(data: any): Promise<{ success: boolean; message: string; data: any }> {
    const result = await adminRepo.addConstituency(data);
        console.log(`Adding constituency: ${data.province} ${data.district_number}`);
        if (result) {
            return {
                success: true,
                message: `Constituency ${data.district_number} of ${data.province} added successfully`,
                data: result,
            };
        } else {
            throw new Error('Failed to add constituency');
        }
    }
}

export class RemoveConstituencyService {
    static async removeConstituency(province: string, district_number: number): Promise<{ success: boolean; message: string ; data: any}> {
        const result = await adminRepo.removeConstituency(province,district_number);
        console.log(`Removing constituency with ID: ${district_number} in province: ${province}`);
        return {
            success: true,
            message: `Constituency ${district_number} of ${province} removed successfully (placeholder)`,
            data: result,
        };
    }
}