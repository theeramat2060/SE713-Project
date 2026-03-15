import express, { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { CloseVotingRequest } from '../dto/ecDTO';

const router = express.Router();

//Admin  Change role of user to EC Staff, \
//Totest
router.post ('/change-role', async (req: Request, res: Response) => {
    const { userId, newRole } = req.body;
    const result = await adminService.ChangeUserRoleService.changeUserRole(userId, newRole);
    res.status(200).json({
        success: true,
        message: 'User role changed successfully (placeholder)',
    });
});


//Add Constituency
//Totest
router.post('/add-constituency', async (req: Request, res: Response) => {
const { name } = req.body;
const result = await adminService.AddConstituencyService.addConstituency(name);
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