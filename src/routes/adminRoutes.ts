import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as admin from '../dto/adminDTO';
import ecStaffService from '../services/ecStaffService';

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create EC Staff',
        });
    }
});

// Get all EC Staff - Admin only (optional: filter by constituency)
router.get('/ec-staff', async (req: Request, res: Response) => {
    try {
        const { constituency_id, admin_id } = req.query;

        let result: any;

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch EC Staff',
        });
    }
});

// Get single EC Staff - Admin only
router.get('/ec-staff/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch EC Staff',
        });
    }
});

// Update EC Staff - Admin only
router.post('/ec-staff/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update EC Staff',
        });
    }
});

// Delete EC Staff - Admin only
router.delete('/ec-staff/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to delete EC Staff',
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

export default router;