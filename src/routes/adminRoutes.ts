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
const { name,province,district_number,is_closed } = req.body;
const data = { name, province, district_number, is_closed };
const result = await adminService.AddConstituencyService.addConstituency(data);
    res.status(201).json({
        success: true,
        message: `Constituency ${name} added successfully`,
    });
});

//Remove Constituency
//Totest
router.post('/remove-constituency', async (req: Request, res: Response) => {
    const { id } = req.body;
    const result = await adminService.RemoveConstituencyService.removeConstituency(id);
    res.status(200).json({
        success: true,
        message: `Constituency ${id} removed successfully (placeholder)`,
    });
});



export default router;