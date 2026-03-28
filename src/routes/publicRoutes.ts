import { Router, Request, Response } from 'express';
import * as publicService from '../services/publicService';
import {getAllConstituencies, getParties} from "../services/publicService";

const router = Router();

const parseId = (id: string | string[]): number | null => {
    const idStr = Array.isArray(id) ? id[0] : id;
    const parsed = parseInt(idStr, 10);
    return isNaN(parsed) ? null : parsed;
};

// Get candidate by ID
router.get('/candidates/:id', async (req: Request, res: Response) => {
    const candidateId = parseId(req.params.id);

    if (candidateId === null) {
        return res.status(400).json({
            success: false,
            error: 'Invalid candidate ID',
        });
    }

    const result = await publicService.getCandidateById(candidateId);

    if (!result.success) {
        const statusCode = result.error?.code || 500;
        return res.status(statusCode).json({
            success: false,
            error: result.error?.message || 'Internal server error',
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
    });
});

// Get all constituencies
router.get('/constituencies', async (req: Request, res: Response) => {
    const result = await publicService.getAllConstituencies();
    if (!result) {
        return res.status(500).json({
            code: 500,
            error:  'Internal server error',
        });
    }
    res.status(200).json({
        code: 200,
        data: result,
    });
});

// Get all parties
router.get('/parties', async (req: Request, res: Response) => {
    const result = await publicService.getAllParties();

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error?.message || 'Internal server error',
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
    });
});

// Get party details
router.get('/parties/:id', async (req: Request, res: Response) => {
    const partyId = parseId(req.params.id);

    if (partyId === null) {
        return res.status(400).json({
            success: false,
            error: 'Invalid party ID',
        });
    }

    const result = await publicService.getParties(partyId);

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error:  'Internal server error',
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
    });
});

// Get party overview
router.get('/party-overview', async (req: Request, res: Response) => {
    const result = await publicService.getPartyOverview();

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error?.message || 'Internal server error',
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
    });
});

// Get all constituencies with candidates (vote count hidden for open ballots)
router.get('/constituencies-with-candidates', async (req: Request, res: Response) => {
    const result = await publicService.getPublicConstituenciesWithCandidates();
    
    if (!result.success) {
        return res.status(result.error?.code || 500).json({
            success: false,
            error: result.error?.message || 'Internal server error',
        });
    }
    
    res.status(200).json({
        success: true,
        data: result.data,
    });
});

// Get election results (public version of declare-results)
router.get('/results', async (req: Request, res: Response) => {
    const result = await publicService.getElectionResults();

    if (!result.success) {
        return res.status(result.error?.code || 500).json({
            success: false,
            error: result.error?.message || 'Internal server error',
        });
    }

    res.status(200).json({
        success: true,
        data: result.data,
    });
});

export default router;
