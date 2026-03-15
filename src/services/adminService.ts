import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as adminRepo from '../repositories/adminRepository';


export class ChangeUserRoleService {
    static async changeUserRole(userId: string, newRole: string): Promise<{ success: boolean }> {
        const validRoles = ['voter', 'ec_staff', 'admin'];
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
    static async addConstituency(name: string): Promise<{ success: boolean; message: string; data: any }> {
    const result = await adminRepo.addConstituency(name);
        console.log(`Adding constituency: ${name}`);
        return {
            success: true,
            message: `Constituency ${name} added successfully`,
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