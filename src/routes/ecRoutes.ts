import e, { Router, Request, Response } from "express";
import * as ecService from '../services/ecService';
import * as publicService from '../services/publicService';
import * as ecRepo from '../dto/ecDTO';
import { verifyAuthToken } from '../services/tokenService';
import * as EC from '../repositories/ecRepository';
import { getErrorMessage } from '../utils/errorHandler';

import { upload } from '../middlewares/uploadMiddleware';
import { uploadFile } from '../services/UploadFileService';


const router = Router();

const resolveUploadFolder = (typeValue: unknown, fallback: 'candidates' | 'parties' = 'candidates'): 'candidates' | 'parties' => {
    if (typeof typeValue !== 'string') {
        return fallback;
    }

    const normalized = typeValue.trim().toLowerCase();
    if (normalized === 'party' || normalized === 'parties') {
        return 'parties';
    }

    if (normalized === 'candidate' || normalized === 'candidates') {
        return 'candidates';
    }

    return fallback;
};

const uploadImageIfProvided = async (
    req: Request,
    fallbackFolder: 'candidates' | 'parties' = 'candidates'
): Promise<string | undefined> => {
    const file = (req as any).file;
    if (!file) {
        return undefined;
    }

    const bucket = 'election-bucket';
    const filePath = resolveUploadFolder((req as any).body?.type, fallbackFolder);
    console.log('Starting upload to S3 with bucket:', bucket, 'and filePath:', filePath);
    const fileKey = await uploadFile(bucket, filePath, file);
    return fileKey;
};

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        const file = (req as any).file;
        if (!file) {
            console.warn('⚠️  No file in request');
            return res.status(400).json({
                success: false,
                error: 'No file uploaded.'
            });
        }
        const bucket = 'election-bucket';
        const filePath = resolveUploadFolder((req as any).body?.type, 'candidates');
        console.log('Received file:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            bufferExists: !!file.buffer
        });
        console.log('Starting upload to S3 with bucket:', bucket, 'and filePath:', filePath);
        const fileKey = await uploadFile(bucket, filePath, file);
        res.status(200).send(fileKey);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error)
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


router.post('/AddCandidates', upload.single('file'), async (req: any, res: Response) => {
    const uploadedImageKey = await uploadImageIfProvided(req, 'candidates');
   const candidateData : ecRepo.AddCandidateData = {
        ...req.body,
        number: Number(req.body.number),
        party_id: Number(req.body.party_id),
        constituency_id: Number(req.body.constituency_id),
        image_url: uploadedImageKey ?? req.body.image_url,
   }; 

   if (!candidateData.image_url) {
        return res.status(400).json({
            success: false,
            error: 'image_url or file is required',
        });
   }

    const result = await ecService.AddCandidateService.addCandidate(candidateData);
    if (result.success) {
    res.status(201).json({
        success: true,
        message: 'Candidate created successfully',
        data: result.data,
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
    } catch (error) {
        res.status(500).json({
            success: false,
            error: getErrorMessage(error),
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

router.get('/election-stats', async (req: Request, res: Response) => {
    const result = await ecService.GetElectionStatsService.getStats();
    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error || 'Failed to fetch election stats',
        });
    }
    res.status(200).json({
        success: true,
        data: result.data,
    });
});

// POST /api/ec/update-voting - Update voting status
router.post('/update-voting',  async (req: Request, res: Response) => {
    const data = req.body; // expecting { action: 'close' | 'open', closedBy?, closedAt? } OR { isClosed: boolean }
    console.log('Received update voting request:', data);
    
    // Support both new format (action) and old format (isClosed)
    const isClosed = data.action === 'close' ? true : (data.action === 'open' ? false : data.isClosed);
    
    const result = await ecService.CloseVotingService.closeVoting(isClosed);
    if (result.success && isClosed) {
        return res.status(200).json({
            success: true,
            message: 'Voting closed successfully',
        });
    } else if (result.success && !isClosed) {
        return res.status(200).json({
            success: true,
            message: 'Voting opened successfully',
        });
    }   
    res.status(500).json({
        success: false,
        error: 'Failed to update voting status',
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

router.post('/create-party', upload.single('logo'), async (req: any, res: Response) => {
const uploadedLogoKey = await uploadImageIfProvided(req, 'parties');
const data : ecRepo.CreatePartyRequest = {
    ...req.body,
    logo_url: uploadedLogoKey ?? req.body.logo_url,
};
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
    const id = parseInt(req.params.id as string) || req.body.id;
    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Party ID is required',
        });
    }
    const result = await ecService.DeletePartyService.deleteParty(id);
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
    const search = req.query.search as string | undefined;
    const partyId = req.query.partyId ? parseInt(req.query.partyId as string) : undefined;
    const constituencyId = req.query.constituencyId ? parseInt(req.query.constituencyId as string) : undefined;
    
    const result = await ecService.GetAllCandidatesService.getAllCandidates(page, pageSize, search, partyId, constituencyId);
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

// get-candidate
router.post('/get-candidate', async (req: Request, res: Response) => {
    const  data : ecRepo.GetCandidateForEditRequest = req.body;
    const result = await ecService.GetCandidateForEditService.getCandidateForEdit(data.name);
    res.status(200).json({
        success: true,
        message: `Candidate retrieved successfully ${result.data.name}`,
        data: result
    });
});


//Totest
router.post('/update-candidate/:id', upload.single('file'), async (req: any, res: Response) => {
console.log('📦 Candidate update request body:', JSON.stringify(req.body, null, 2));
const candidateId = Number(req.params.id);
if (!Number.isFinite(candidateId)) {
    return res.status(400).json({
        success: false,
        error: 'Invalid candidate id',
    });
}

const uploadedImageKey = await uploadImageIfProvided(req, 'candidates');
const { title, first_name, last_name, number, image_url, party_id, constituency_id } = req.body;

const parsedNumber = Number(number);
const parsedPartyId = Number(party_id);
const parsedConstituencyId = Number(constituency_id);

if (isNaN(parsedPartyId) || parsedPartyId <= 0) {
    return res.status(400).json({
        success: false,
        error: 'Invalid party_id provided',
    });
}

if (isNaN(parsedConstituencyId) || parsedConstituencyId <= 0) {
    return res.status(400).json({
        success: false,
        error: 'Invalid constituency_id provided',
    });
}

const updateData = {
    title,
    first_name,
    last_name,
    number: parsedNumber,
    image_url: uploadedImageKey ?? image_url,
    party_id: parsedPartyId,
    constituency_id: parsedConstituencyId
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
    

