import { Request, Response } from 'express';
import * as EC from '../repositories/ecRepository';
import { Admin } from '../models';
import {
    CloseVotingRequest,ServiceResult
} from '../dto/ecDTO';
import * as publicService from './publicService';


const logECStaffEvent = (event: string, data: Record<string, any>) => {
    console.log(`[ECStaff] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

//close and open voting for a constituency
export class CloseVotingService {
    static async closeVoting(isClosed: boolean): Promise<{ success: boolean }> {
     logECStaffEvent('POST_CLOSE_VOTE', {});
    const result = await publicService.getConstituencies();
    if (result.data) {
        for (let i = 0; i < result.data.length; i++) {
            await EC.closeVotingForConstituency(result.data[i].id, isClosed);
        }
        return {
            success: true,
        };

    }else {
        throw new Error('Failed to retrieve constituencies');
    }
}
};


export class GetOpenConstituenciesService {
    static async getOpenConstituencies(): Promise<{ success: boolean; data?: any[]; error?: string }> {
        try {
            const constituencies = await EC.getOpenConstituencies();
            return {
                success: true,
                data: constituencies,
            };
        } catch (error) {
            console.error('Error fetching open constituencies:', error);
            return {
                success: false,
                error: 'Failed to fetch open constituencies',
            };
        }
    }
};

export class DeclareResultsService {
    static async declareResults(): Promise<{ success: boolean; message: string; data?: any[] }> {
    const constituencies = await EC.getClosedConstituencies();
    
    const results = [];
    
    //calculate the winner for each constituency and update the database accordingly
    for(let i = 0; i < constituencies.length; i++){
        const constituency = constituencies[i];
        const candidates = constituency.candidates;
        
        // Find winner with highest vote count
        let winner = candidates[0];
        for(let j = 1; j < candidates.length; j++){
            if(candidates[j].vote_count > winner.vote_count){
                winner = candidates[j];
            }
        }
        
        //update the database with the winner for the constituency
        await EC.updateConstituencyWinner(constituency.id, winner.id);
        
        // Add to results with all relevant information
        results.push({
            id: constituency.id,
            province: constituency.province,
            district_number: constituency.district_number,
            total_votes: constituency.total_votes,
            winner: {
                id: winner.id,
                title: winner.title,
                first_name: winner.first_name,
                last_name: winner.last_name,
                number: winner.number,
                party_name: winner.party_name,
                party_logo_url: winner.party_logo_url,
                vote_count: winner.vote_count,
            }
        });
    }
    console.log('Declared results for all constituencies:', results);
    return {
        success: true,
        data: results,
        message: 'Results declared successfully',
    };
}
};

