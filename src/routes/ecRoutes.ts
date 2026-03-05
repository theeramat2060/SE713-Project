import { Router,Request,Response } from "express";
import * as ecService from '../services/ecService';
import * as publicService from '../services/publicService';
import { CloseVotingRequest } from '../dto/ecDTO';

// - POST /api/ec/close-voting/:id - Close voting
// - GET /api/ec/open-constituencies - List open constituencies
// - POST /api/ec/declare-results/:id - Declare results
// - GET /api/ec/reports - Generate reports

const router = Router();

router.post('/declare-results', async (req: Request, res: Response) => {
    const data = await ecService.DeclareResultsService.declareResults();
    if (data.success) {
        return res.status(200).json({
            success: true,
            message: data.message,
            data: data.data,
        });
    } else {
        return res.status(500).json({
            success: false,
            error: 'Failed to declare results',
        });
    }
});

router.get('/open-constituencies', async (req: Request, res: Response) => {
    const result = await ecService.GetOpenConstituenciesService.getOpenConstituencies();

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error || 'Failed to fetch open constituencies',
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
    }); 

});

// POST /api/ec/close-voting - Close voting
router.post('/close-voting',  async (req: Request, res: Response) => {
    const data: CloseVotingRequest = req.body;
    console.log('Received close voting request:', data);
    const result = await ecService.CloseVotingService.closeVoting(data.isClosed);
        if (result.success&&data.isClosed) {
            return res.status(200).json({
        success: true,
        message: 'Voting closed successfully',
    });
    }else if(result.success&&!data.isClosed){
        return res.status(200).json({
            success: true,
            message: 'Voting opened successfully',
        });
    }   
    res.status(500).json({
                success: false,
                error: 'Failed to close voting',
            }); 
});




export default router;
    

