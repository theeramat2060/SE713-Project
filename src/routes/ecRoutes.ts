import e, { Router,Request,Response } from "express";
import * as ecService from '../services/ecService';
import * as publicService from '../services/publicService';
import * as ecRepo from '../dto/ecDTO';
import { verifyAuthToken } from '../services/tokenService';
import * as EC from '../repositories/ecRepository';

import { upload } from '../middlewares/uploadMiddleware';
import { uploadFile } from '../services/UploadFileService';

// **Note:** `uploadMiddleware` and `uploadToSupabase()` utility already exist in `/src/middlewares/uploadMiddleware.ts` and `/src/utils/uploadUtils.ts`

const router = Router();

router.post('/upload', upload.single('file'), async (req: any, res: any) => {
    try {
        // This will check where the file is coming from and will keep the file on seperate folders in the bucket for candidates and parties
        const file = req.file;
        
        if (!file) {
            console.warn('⚠️  No file in request');
            return res.status(400).json({
                success: false,
                error: 'No file uploaded.'
            });
        }
        const bucket = 'election-bucket';
        const filePath = `candidates`;
        if(req.body.type === 'party'){
            filePath = `parties`;
        }
        console.log('Received file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            bufferExists: !!file.buffer
        });
        console.log('Starting upload to S3 with bucket:', bucket, 'and filePath:', filePath);
        const fileKey = await uploadFile(bucket, filePath, file);
        res.status(200).send(fileKey);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Error uploading file.'
        });
    }
});

router.get('/presignedUrl', async (req: Request, res: Response) => {
    try {
        const { key } = req.query;
        if (!key || typeof key !== 'string') {
            return res.status(400).send('File key is required.');
        }
        const bucket = 'images';
        const { getPresignedUrl } = await import('../services/UploadFileService');
        const presignedUrl = await getPresignedUrl(bucket, key, 3600);
                res.status(200).json({ url: presignedUrl });
} catch (error) {
        console.error('Error generating presigned URL:', error);
        res.status(500).send('Error generating presigned URL.');
    }
});


router.post('/AddCandidates', async (req: Request, res: Response) => {
   const candidateData : ecRepo.AddCandidateData = req.body; //expecting user data and constituency id and party id
    const result = await ecService.AddCandidateService.addCandidate(candidateData);
    if (result.success) {
    res.status(201).json({
        success: true,
        message: 'Candidate created successfully ',
    });
} else {
    res.status(500).json({
        success: false,
        error: result.message || 'Failed to create candidate',
    });
}
});

router.post('/declare-results', async (req: Request, res: Response) => {
    try {
        // Verify authentication - allow any authenticated role (Admin, EC Staff, Voter)
        const authHeader = req.headers.authorization ?? '';
        const tokenResult = verifyAuthToken(authHeader);

        if (!tokenResult.success || !tokenResult.data) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please provide a valid token.',
            });
        }

        // Check if ANY constituency has voting closed
        const closedConstituencies = await EC.getClosedConstituencies();

        if (!closedConstituencies || closedConstituencies.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Voting is still open. Results can only be declared after voting is closed.',
            });
        }

        // User is authenticated and voting is closed - proceed with declaring results
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to declare results',
        });
    }
});

router.get('/open-constituencies', async (req: Request, res: Response) => {
    const result = await ecService.GetOpenConstituenciesService.getOpenConstituencies();//expecting no input

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
    const data: ecRepo.CloseVotingRequest = req.body; //expecting isClosed boolean
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
const data : ecRepo.CreatePartyRequest = req.body;//expecting name, logo_url, policy
if (!data.name || !data.logo_url || !data.policy) {
    return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, logo_url, policy',
    });
}
const result = await ecService.CreatePartyService.createParty(data.name, data.logo_url, data.policy);
    if (result.success) {
        return res.status(201).json({
            success: true,
            message: 'Party created successfully',
            data: {name: data.name, logo_url: data.logo_url, policy: data.policy},
        });
    } else {
        return res.status(500).json({
            success: false,
            error: result.message || 'Failed to create party',
        });
    }
});

router.delete('/delete-party/:id', async (req: Request, res: Response) => {
const party : ecRepo.DeletePartyRequest = req.body;//expecting party id
const result = await ecService.DeletePartyService.deleteParty(party.id);
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
    const candidate : ecRepo.DeleteCandidateRequest = req.body;
    const result = await ecService.DeleteCandidateService.deleteCandidate(candidate.id);
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
    const  data : ecRepo.GetCandidateForEditRequest = req.body;
    const result = await ecService.GetCandidateForEditService.getCandidateForEdit(data.name);
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
    

