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
        console.log(`Adding constituency: ${data.name}`);
        return {
            success: true,
            message: `Constituency ${data.name} added successfully`,
            data: result,
        };
    }
}

export class RemoveConstituencyService {
    static async removeConstituency(id: number): Promise<{ success: boolean; message: string ; data: any}> {
        const result = await adminRepo.removeConstituency(id);
        console.log(`Removing constituency with ID: ${id}`);
        return {
            success: true,
            message: `Constituency ${id} removed successfully (placeholder)`,
            data: result,
        };
    }
}