import { Router,Request,Response } from "express";
import * as ecService from '../services/ecService';
import * as publicService from '../services/publicService';
import { CloseVotingRequest ,PartyInfoResponse} from '../dto/ecDTO';


// **Note:** `uploadMiddleware` and `uploadToSupabase()` utility already exist in `/src/middlewares/uploadMiddleware.ts` and `/src/utils/uploadUtils.ts`

const router = Router();

router.post('/candidates', async (req: Request, res: Response) => {
    // Placeholder for candidate creation logic
    res.status(201).json({
        success: true,
        message: 'Candidate created successfully (placeholder)',
    });
});

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

// POST /api/ec/update-voting - Update voting status
router.post('/update-voting',  async (req: Request, res: Response) => {
    const data: CloseVotingRequest = req.body;
    console.log('Received update voting request:', data);
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

//pagination 10 parties per page 
router.get('/get-all-party', async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const result = await ecService.GetPartyBasicInfoService.getPartyBasicInfo(page, pageSize);
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error || 'Failed to fetch parties',
        });
    }
    
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});

router.post('/create-party', async (req: Request, res: Response) => {
    //required fields: name, logo_url?, policy?
    //use this to update party info, if field is not provided, keep the original value
const { name, logo_url, policy } = req.body;
const result = await ecService.CreatePartyService.createParty(name, logo_url, policy);
    if (result.success) {
        return res.status(201).json({
            success: true,
            message: 'Party created successfully',
            data: {name, logo_url, policy},
        });
    } else {
        return res.status(500).json({
            success: false,
            error: result.message || 'Failed to create party',
        });
    }
    
});

router.delete('/delete-party/:id', async (req: Request, res: Response) => {
const partyId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
const result = await ecService.DeletePartyService.deleteParty(partyId);
if (result.success) {
        return res.status(200).json({
            success: true,
            message: 'Party deleted successfully',
        });
    } else {
        return res.status(500).json({
            success: false,
            error: result.message || 'Failed to delete party',
        });
    }  
});


//pagination 10 candidates per page     
router.get('/get-all-candidates', async (req: Request, res: Response) => { 
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const result = await ecService.GetAllCandidatesService.getAllCandidates(page, pageSize);
    res.status(200).json({
        success: true,
        message: 'Candidates retrieved successfully',
        data: result.data,
        pagination: result.pagination,
    });
});

//Totest
router.delete('/delete-candidate/:id', async (req: Request, res: Response) => {
    const candidateId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
    const result = await ecService.DeleteCandidateService.deleteCandidate(candidateId);
    if (result.success) {
        return res.status(200).json({
            success: true,
            message: 'Candidate deleted successfully',
        });
    } else {
        return res.status(500).json({
            success: false,
            error: result.message || 'Failed to delete candidate',
        });
    }
});

//Get candidate to edit query for name like %kim% and constituency id = 1
router.post('/get-candidate', async (req: Request, res: Response) => {
    const { name, constituencyId } = req.body;
    const result = await ecService.GetCandidateForEditService.getCandidateForEdit(name);
    res.status(200).json({
        success: true,
        message: `Candidate retrieved successfully ${result.data.name}`,
        data: result
    });
});

//Update everything of candidate except id, including photo, name, number, party, constituency
//Totest
router.post('/update-candidate/:id', async (req: Request, res: Response) => {
const candidateId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
const { title, first_name, last_name, number, image_url, party_id, constituency_id } = req.body;
const updateData = {
    title,
    first_name,
    last_name,
    number,
    image_url,
    party_id,
    constituency_id
};
const result = await ecService.UpdateCandidateService.updateCandidate(candidateId, updateData);
    if (result.success) {
        return res.status(200).json({
            success: true,
            message: 'Candidate updated successfully',
        });
    } else {
        res.status(500).json({
            success: false,            
            error: result.message || 'Failed to update candidate',
        });
    }
});

export default router;
    

