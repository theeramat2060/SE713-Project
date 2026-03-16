import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { CloseVotingRequest } from '../dto/ecDTO';

const router = express.Router();

//Admin  Change role of user to EC Staff,
router.post ('/change-role', async (req: Request, res: Response) => {
    console.log('Received change role request:', req.body);
    const { userId, newRole } = req.body;
    const result = await adminService.ChangeUserRoleService.changeUserRole(userId, newRole);
    res.status(200).json({
        success: true,
        message: `User role changed successfully to ${newRole}`,
    });
});


//Add Constituency
router.post('/add-constituency', async (req: Request, res: Response) => {
const {province,district_number,is_closed } = req.body;
const data = {  province, district_number, is_closed};
const result = await adminService.AddConstituencyService.addConstituency(data);
    res.status(201).json({
        success: true,
        message: `Constituency ${district_number} of ${province} added successfully`,
    });
});

//Remove Constituency
router.delete('/remove-constituency', async (req: Request, res: Response) => {
    const { province,district_number } = req.body;
    const result = await adminService.RemoveConstituencyService.removeConstituency(province,district_number);
    res.status(200).json({
        success: true,
        message: `Constituency ${district_number} of ${province} removed successfully`,
    });
});



export default router;