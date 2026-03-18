import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import * as admin from '../dto/adminDTO';

const router = express.Router();

//Admin  Change role of user to EC Staff,
router.post ('/change-role', async (req: Request, res: Response) => {
    console.log('Received change role request:', req.body);
    const data : admin.ChangeUserRoleRequest = req.body;
    const result = await adminService.ChangeUserRoleService.changeUserRole(data.userId, data.newRole);
    res.status(200).json({
        success: true,
        message: `User role changed successfully to ${data.newRole}`,
    });
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