import type {Request, Response} from 'express';
import * as publicService from '../services/publicService';

const parseId = (id: string | string[]): number | null => {
    const idStr = Array.isArray(id) ? id[0] : id;
    const parsed = parseInt(idStr, 10);
    return isNaN(parsed) ? null : parsed;
};

export const getConstituencies = async (req: Request, res: Response) => {
    const result = await publicService.getConstituencies();

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
};

export const getConstituencyResults = async (req: Request, res: Response) => {
    const id = req.params.id;
    const constituencyId = parseId(id);

    if (constituencyId === null) {
        return res.status(400).json({
            success: false,
            error: 'Invalid constituency ID',
        });
    }

    const result = await publicService.getConstituencyResults(constituencyId);

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
};

export const getParties = async (req: Request, res: Response) => {
    const result = await publicService.getParties();

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
};

export const getPartyDetails = async (req: Request, res: Response) => {
    const id = req.params.id;
    const partyId = parseId(id);

    if (partyId === null) {
        return res.status(400).json({
            success: false,
            error: 'Invalid party ID',
        });
    }

    const result = await publicService.getPartyDetails(partyId);

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
};

export const getPartyOverview = async (req: Request, res: Response) => {
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
};
