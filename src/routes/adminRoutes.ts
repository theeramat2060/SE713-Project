import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as admin from '../dto/adminDTO';
import ecStaffService from '../services/ecStaffService';
import { getErrorMessage } from '../utils/errorHandler';

interface AppError extends Error {
    message: string;
}

interface ServiceResult<T> {
    success: boolean;
    error?: {
        code: number;
        message: string;
    };
    data?: T;
}

const router = express.Router();

// Create EC Staff - Admin only
router.post('/ec-staff', async (req: Request, res: Response) => {
    try {
        const { admin_id, national_id, password, title, first_name, last_name, email, constituency_id } = req.body;

        // Validate required fields
        if (!admin_id || !national_id || !password || !title || !first_name || !last_name || !constituency_id) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: admin_id, national_id, password, title, first_name, last_name, constituency_id',
            });
        }

        const result = await ecStaffService.createECStaff(admin_id, {
            national_id,
            password,
            title,
            first_name,
            last_name,
            email,
            constituency_id,
        });

        if (!result.success) {
            return res.status(result.error?.code || 400).json({
                success: false,
                error: result.error?.message || 'Failed to create EC Staff',
            });
        }

        res.status(201).json({
            success: true,
            message: 'EC Staff created successfully',
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error),
        });
    }
});

// Get all EC Staff - Admin only (optional: filter by constituency)
router.get('/ec-staff', async (req: Request, res: Response) => {
    try {
        const { constituency_id, admin_id } = req.query;

        let result: ServiceResult<any>;

        if (constituency_id) {
            result = await ecStaffService.getECStaffByConstituency(Number(constituency_id));
        } else if (admin_id) {
            result = await ecStaffService.getECStaffByAdmin(Number(admin_id));
        } else {
            result = await ecStaffService.getAllECStaff();
        }

        if (!result.success) {
            return res.status(result.error?.code || 400).json({
                success: false,
                error: result.error?.message || 'Failed to fetch EC Staff',
            });
        }

        res.status(200).json({
            success: true,
            data: result.data,
            count: result.data?.length || 0,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error),
        });
    }
});

// Get single EC Staff - Admin only
router.get('/ec-staff/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const result = await ecStaffService.getECStaffById(id);

        if (!result.success) {
            return res.status(result.error?.code || 400).json({
                success: false,
                error: result.error?.message || 'EC Staff not found',
            });
        }

        res.status(200).json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error),
        });
    }
});


// GET /api/admin/users - List all users (voters, EC staff, admins)
router.get('/users', async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const role = req.query.role ? String(req.query.role) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;

        const result = await adminService.ListUsersService.getAllUsers(page, pageSize, role, search);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch users',
        });
    }
});

// POST /api/admin/users - Create new user with role
router.post('/users', async (req: Request, res: Response) => {
    try {
        const { nationalId, password, title, firstName, lastName, address, role, constituencyId } = req.body;

        if (!nationalId || !password || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: nationalId, password, firstName, lastName, role',
            });
        }

        if (!['VOTER', 'EC', 'ADMIN'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be VOTER, EC, or ADMIN',
            });
        }

        const result = await adminService.CreateUserService.createUser({
            nationalId,
            password,
            title,
            firstName,
            lastName,
            address,
            role,
            constituencyId,
        });

        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create user',
        });
    }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);

        const result = await adminService.GetUserService.getUser(id);

        if (!result.success) {
            return res.status(result.error?.code || 404).json({
                success: false,
                error: result.error?.message || 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            data: result.data,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch user',
        });
    }
});

// Update EC Staff - Admin only
router.post('/ec-staff/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { admin_id, ec_status, ...updateData } = req.body;

        if (!admin_id) {
            return res.status(400).json({
                success: false,
                error: 'admin_id is required',
            });
        }

        // Map ec_status to status for database
        if (ec_status) {
            updateData.status = ec_status;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update',
            });
        }

        const result = await ecStaffService.updateECStaff(id, admin_id, updateData);

        if (!result.success) {
            return res.status(result.error?.code || 400).json({
                success: false,
                error: result.error?.message || 'Failed to update EC Staff',
            });
        }

        res.status(200).json({
            success: true,
            message: 'EC Staff updated successfully',
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error),
        });
    }
});

// Delete EC Staff - Admin only
router.delete('/ec-staff/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { admin_id } = req.body;

        if (!admin_id) {
            return res.status(400).json({
                success: false,
                error: 'admin_id is required in request body',
            });
        }

        const result = await ecStaffService.deleteECStaff(id, admin_id);

        if (!result.success) {
            return res.status(result.error?.code || 400).json({
                success: false,
                error: result.error?.message || 'Failed to delete EC Staff',
            });
        }

        res.status(200).json({
            success: true,
            message: 'EC Staff deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error),
        });
    }
});


// ─────────────────────────────────────────────────────────────────────────
// DISTRICT MANAGEMENT (Standard RESTful endpoints)
// ─────────────────────────────────────────────────────────────────────────

// GET /api/admin/districts - List all districts with pagination and search
router.get('/districts', async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const search = req.query.search ? String(req.query.search) : '';

        const result = await adminService.ListDistrictsService.getDistricts(page, pageSize, search);

        if (!result.success) {
            return res.status(result.error?.code || 400).json({
                success: false,
                error: result.error?.message || 'Failed to fetch districts',
            });
        }

        res.status(200).json({
            success: true,
            data: result.data,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});

// GET /api/admin/districts/:id - Get specific district
router.get('/districts/:id', async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid district ID',
            });
        }

        const result = await adminService.GetDistrictService.getDistrict(id);

        if (!result.success) {
            return res.status(result.error?.code || 404).json({
                success: false,
                error: result.error?.message || 'District not found',
            });
        }

        res.status(200).json({
            success: true,
            data: result.data,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error',
        });
    }
});

// POST /api/admin/districts - Create new district
router.post('/districts', async (req: Request, res: Response) => {
    try {
        const { province, district_number } = req.body;

        if (!province || !district_number) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: province, district_number',
            });
        }

        const result = await adminService.AddConstituencyService.addConstituency({
            province,
            district_number: Number(district_number),
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create district',
        });
    }
});

// DELETE /api/admin/districts - Delete district
router.delete('/districts', async (req: Request, res: Response) => {
    try {
        const { province, district_number } = req.body;

        if (!province || !district_number) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: province, district_number',
            });
        }

        const result = await adminService.RemoveConstituencyService.removeConstituency(
            province,
            Number(district_number)
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to delete district',
        });
    }
});

// DELETE /api/admin/districts/:id - Delete district (alternative endpoint)
router.delete('/districts/:id', async (req: Request, res: Response) => {
    try {
        const { province, district_number } = req.body;

        if (!province || !district_number) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: province, district_number',
            });
        }

        const result = await adminService.RemoveConstituencyService.removeConstituency(
            province,
            Number(district_number)
        );

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to delete district',
        });
    }
});

//Add Constituency
router.post('/add-constituency', async (req: Request, res: Response) => {
const data : admin.AddConstituencyRequest = req.body;
const result = await adminService.AddConstituencyService.addConstituency(data);
    res.status(201).json({
        success: true,
        message: `Constituency ${data.district_number} of ${data.province} added successfully`,
    });
});

//Remove Constituency
router.delete('/remove-constituency', async (req: Request, res: Response) => {
    const data : admin.RemoveConstituencyRequest = req.body;
    const result = await adminService.RemoveConstituencyService.removeConstituency(data.province, data.district_number);
    res.status(200).json({
        success: true,
        message: `Constituency ${data.district_number} of ${data.province} removed successfully`,
    });
});

router.post('/new-user', async (req: Request, res: Response) => {
    const data : admin.CreateNewUserRequest = req.body;
    const result = await adminService.CreateNewUserService.createAdmin(data);
    res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        data: result,
    });
});

// PATCH /api/admin/users/:id/change-role - Change user role (VOTER -> EC)
router.patch('/users/:id/change-role', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const role = req.body?.role as string | string[] | undefined;

        if (!role) {
            return res.status(400).json({
                success: false,
                error: 'Role is required',
            });
        }

        // Ensure role is a string (not an array)
        let roleStr: string;
        if (typeof role === 'string') {
            roleStr = role;
        } else if (Array.isArray(role)) {
            roleStr = String(role[0]);
        } else {
            roleStr = String(role);
        }

        // @ts-ignore - TypeScript bug with role narrowing
        const result = await adminService.ChangeUserRoleService.changeUserRole(id, String(roleStr));

        res.status(200).json({
            success: true,
            message: `User role changed to ${roleStr} successfully`,
            data: result,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to change user role',
        });
    }
});

// PATCH /api/admin/users/:id - Update user details (name, address, etc.)
router.patch('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const firstName = req.body?.firstName as string | undefined;
        const lastName = req.body?.lastName as string | undefined;
        const address = req.body?.address as string | undefined;

        if (!firstName && !lastName && !address) {
            return res.status(400).json({
                success: false,
                error: 'At least one field (firstName, lastName, or address) is required',
            });
        }

        // @ts-ignore - TypeScript issue with req.params typing
        const result = await adminService.UpdateUserDetailsService.updateUser(id, {
            firstName,
            lastName,
            address,
        });

        res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            data: result,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update user details',
        });
    }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // @ts-ignore - TypeScript issue with req.params typing
        const result = await adminService.DeleteUserService.deleteUser(id);

        res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (err) {
        const error = err as AppError;
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to delete user',
        });
    }
});

export default router;