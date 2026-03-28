import express, { Request, Response } from 'express';
import * as adminRepo from '../repositories/adminRepository';

interface ServiceResult<T> {
    success: boolean;
    error?: {
        code: number;
        message: string;
    };
    data?: T;
}

export class ChangeUserRoleService {
    static async changeUserRole(userId: string, newRole: string): Promise<{ success: boolean }> {
        const validRoles = ['VOTER', 'EC'];
        if (!validRoles.includes(newRole)) {
            throw new Error(`Invalid role: ${newRole}. Valid roles are: ${validRoles.join(', ')}`);
        }
        await adminRepo.updateUserRole(userId, newRole);
        
        return {
            success: true,
        };
    }
}

export class ListDistrictsService {
    static async getDistricts(
        page: number,
        pageSize: number,
        search?: string
    ): Promise<ServiceResult<any>> {
        try {
            const result = await adminRepo.getDistricts(page, pageSize, search);
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to fetch districts',
                    code: 400,
                },
            };
        }
    }
}

export class GetDistrictService {
    static async getDistrict(id: number): Promise<ServiceResult<any>> {
        try {
            const result = await adminRepo.getDistrictById(id);
            if (!result) {
                return {
                    success: false,
                    error: {
                        message: 'District not found',
                        code: 404,
                    },
                };
            }
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Failed to fetch district',
                    code: 400,
                },
            };
        }
    }
}

export class AddConstituencyService {
    static async addConstituency(data: any): Promise<{ success: boolean; message: string; data: any }> {
        try {
            const result = await adminRepo.addConstituency(data);
            console.log(`Adding constituency: ${data.province} ${data.district_number}`);
            if (result) {
                return {
                    success: true,
                    message: `เขต ${data.district_number} ของจังหวัด ${data.province} เพิ่มเติมเรียบร้อยแล้ว`,
                    data: result,
                };
            } else {
                throw new Error('ไม่สามารถเพิ่มเขตได้');
            }
        } catch (error) {
            throw error;
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

export class CreateNewUserService {
    static async createAdmin(data: any): Promise<{ success: boolean; message: string; data: any }> {
        const result = await adminRepo.createNewUser(data);
        if (result) {
            return {
                success: true,
                message: 'Admin user created successfully',
                data: result,
            };
        } else {
            throw new Error('Failed to create admin user');
        }
    }
}
export class ListUsersService {
    static async getAllUsers(
        page: number = 1,
        pageSize: number = 10,
        role?: string,
        search?: string
    ): Promise<any> {
        try {
            const result = await adminRepo.getAllUsers(page, pageSize, role, search);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export class GetUserService {
    static async getUser(id: string): Promise<{ success: boolean; error?: { code: number; message: string }; data?: any }> {
        try {
            const result = await adminRepo.getUserById(id);
            if (!result) {
                return {
                    success: false,
                    error: {
                        code: 404,
                        message: 'User not found',
                    },
                };
            }
            return {
                success: true,
                data: result,
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 500,
                    message: error instanceof Error ? error.message : 'Failed to fetch user',
                },
            };
        }
    }
}

export class CreateUserService {
    static async createUser(data: any): Promise<any> {
        try {
            const result = await adminRepo.createUserWithRole(data);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

export class UpdateUserDetailsService {
    static async updateUser(
        userId: string,
        data: {
            firstName?: string;
            lastName?: string;
            address?: string;
        }
    ): Promise<any> {
        try {
            const result = await adminRepo.updateUserDetails(userId, data);
            return result;
        } catch (error) {
            throw error;
        }
    }
}
