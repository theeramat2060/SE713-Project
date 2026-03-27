import { Router, Request, Response } from 'express';
import { VoteService } from '../services/voteService';

interface AppError extends Error {
    message: string;
}

const router = Router();
const voteService = new VoteService();

// POST /api/election/vote
router.post('/vote', async (req: Request, res: Response) => {
  try {
    const { userId, candidateId, constituencyId } = req.body || {};

    // Validate required fields
    if (!userId || !candidateId || !constituencyId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, candidateId, constituencyId',
      });
    }

    const result = await voteService.createVote(userId, candidateId, constituencyId);

    if (!result.success) {
      return res.status(result.error?.code || 400).json({
        success: false,
        error: result.error?.message || 'Failed to record vote',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Vote recorded successfully',
      data: result.data,
    });
  } catch (error) {
    const appError = error as AppError;
    res.status(500).json({
      success: false,
      error: appError.message || 'Internal server error',
    });
  }
});

// GET /api/election/candidates/:userId - Get all candidates in user's constituency
router.get('/candidates/:userId', async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.userId);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format',
      });
    }

    const result = await voteService.getCandidate(userId);

    if (!result.success) {
      return res.status(result.error?.code || 400).json({
        success: false,
        error: result.error?.message || 'Failed to retrieve candidates',
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    const appError = error as AppError;
    res.status(500).json({
      success: false,
      error: appError.message || 'Internal server error',
    });
  }
});

export default router;
