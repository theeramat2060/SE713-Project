import { Vote as vote } from "../models";
import * as candidateRepository from "../repositories/candidateRepository";
import * as voteRepository from "../repositories/voteRepository";
import * as userRepository from "../repositories/userRepository";

export class VoteService {
  async createVote(
    userId: string,
    candidateId: number,
    constituencyId: number,
  ) {
    const candidate = await candidateRepository.getCandidateById(candidateId);
    if (!candidate) {
      return {
        success: false,
        error: {
          message: "Candidate not found",
          code: 404,
        },
      };
    }
    if (candidate.constituency_id !== constituencyId) {
      return {
        success: false,
        error: {
          message: "Candidate does not belong to the specified constituency",
          code: 400,
        },
      };
    }
    if (candidate.constituency.is_closed) {
      return {
        success: false,
        error: {
          message: "Voting is closed for this constituency",
          code: 400,
        },
      };
    }
    const vote = await voteRepository.addVote(
      userId,
      candidateId,
      constituencyId,
    );

    return {
      success: true,
      data: {
        userId: vote.user_id,
        candidateId: vote.candidate_id,
        timestamp: vote.updated_at || vote.created_at,
        message: 'Vote recorded/updated successfully',
      },
    };
  }
  async getCandidate(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      return {
        success: false,
        error: {
          message: "User not found",
          code: 404,
        },
      };
    }
    // Get all candidates in the user's constituency
    const candidates = await candidateRepository.getCandidatesByConstituencyId(user.constituency_id);
    if (!candidates || candidates.length === 0) {
      return {
        success: false,
        error: {
          message: "No candidates found in your constituency",
          code: 404, 
        },
      };
    }
    return {
      success: true,
      data: candidates,
    };
  }
}
