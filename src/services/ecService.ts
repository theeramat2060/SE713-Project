import { Request, Response } from 'express';
import * as EC from '../repositories/ecRepository';
import { Admin } from '../models';
import * as ecRepo from '../dto/ecDTO';
import * as publicService from './publicService';


const logECStaffEvent = (event: string, data: Record<string, any>) => {
    console.log(`[ECStaff] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

//close and open voting for a constituency
export class CloseVotingService {
    static async closeVoting(isClosed: boolean): Promise<{ success: boolean }> {
    logECStaffEvent('POST_CLOSE_VOTE', {});
    const result = await publicService.getAllConstituencies();
    if (result && result.length > 0) {
        for (let i = 0; i < result.length; i++) {
            await EC.closeVotingForConstituency(result[i].id, isClosed);
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
                image_url: winner.image_url,
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

export class GetPartyBasicInfoService {
    static async getPartyBasicInfo(page: number = 1, pageSize: number = 10): Promise<{ success: boolean; data?: any[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number }; error?: string }> {
        try {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Max 100 per page
            
            const parties: any[] = await EC.getAllPartiesBasic(page, pageSize);
            const total = await EC.getPartiesCount();
            const totalPages = Math.ceil(total / pageSize);

            return {
                success: true,
                data: parties,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                },
            };
        } catch (error) {
            console.error('Error fetching basic party info:', error);
            return {
                success: false,
                error: 'Failed to fetch basic party info',
            };
        }
    }    
};

export class DeletePartyService {
    static async deleteParty(id: number): Promise<{ success: boolean; message: string }> {
        try {
            // delete candidates associated with the party first to maintain referential integrity
           for (let i = 0; i < 100; i++) { // arbitrary limit to prevent infinite loop in case of unexpected issues
                const candidates = await EC.getCandidatesByPartyId(id);
                if (candidates.length === 0) {
                    break; // no more candidates to delete
                }
                for (const candidate of candidates) {
                    await EC.deleteCandidate(candidate.id);
                }
            }
            // then delete the party itself
            await EC.deleteParty(id);
            return {
                success: true,
                message: 'Party deleted successfully',
            };
        } catch (error) {
            console.error('Error deleting party:', error);
            return {
                success: false,
                message: 'Failed to delete party',
            };
        }
    }
}

export class CreatePartyService {
    static async createParty(name: string, logo_url: string, policy: string): Promise<{ success: boolean; message: string }> {
        try {
            await EC.CreateParty(name, logo_url, policy);
            return {
                success: true,
                message: 'Party created successfully',
            };
        } catch (error) {
            console.error('Error creating party:', error);
            return {
                success: false,
                message: 'Failed to create party',
            };
        }
    }
}   

export class GetAllCandidatesService {
    static async getAllCandidates(page: number = 1, pageSize: number = 10, search?: string, partyId?: number, constituencyId?: number): Promise<{ success: boolean; data?: any[]; pagination?: { page: number; pageSize: number; total: number; totalPages: number }; error?: string }> {
        try {
            // Validate pagination parameters
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            if (pageSize > 100) pageSize = 100; // Max 100 per page

            const candidates = await EC.getAllCandidates(page, pageSize, search, partyId, constituencyId);
            const total = await EC.getCandidatesCount(search, partyId, constituencyId);
            const totalPages = Math.ceil(total / pageSize);

            return {
                success: true,
                data: candidates,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                },
            };
        } catch (error) {
            console.error('Error fetching candidates:', error);
            return {
                success: false,
                error: 'Failed to fetch candidates',
            };
        }   
    }
}

export class DeleteCandidateService {
    static async deleteCandidate(id: number): Promise<{ success: boolean; message: string }> {
        try {
            await EC.deleteCandidate(id);
            return {
                success: true,
                message: 'Candidate deleted successfully',
            };
        } catch (error) {
            console.error('Error deleting candidate:', error);
            return {
                success: false,
                message: 'Failed to delete candidate',
            };
        }
    }
}

export class GetCandidateForEditService {
    static async getCandidateForEdit(name: string): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const candidate = await EC.getCandidateForEdit(name);
            if (candidate) {
                return {
                    success: true,
                    data: candidate,
                };
            } else {
                return {
                    success: false,
                    error: 'Candidate not found',
                };
            }
        } catch (error) {
            console.error('Error fetching candidate for edit:', error);
            return {
                success: false,
                error: 'Failed to fetch candidate for edit',
            };
        }
    }
}

export class UpdateCandidateService {
    static async updateCandidate(candidateId: number, updatedData: any): Promise<{ success: boolean; message: string; data?: any }> {
        try {
            const updatedCandidate = await EC.updateCandidate(candidateId, updatedData);
            console.log('Updated candidate:', updatedCandidate);
            return {
                success: true,
                message: 'Candidate updated successfully',
                data: updatedCandidate,
            };
        } catch (error) {
            console.error('Error updating candidate:', error);
            return {
                success: false,
                message: 'Failed to update candidate',
            };
        }
    }
}

export class AddCandidateService {
    static async addCandidate(candidateData: any): Promise<{ success: boolean; message: string; data?: any }> {
        // get user data by user id and check if the user exists and is not already a candidate
        // if user exists and is not already a candidate, then add candidate by inserting into candidate table with user id and constituency id and party id
        try {
            const addedCandidate = await EC.addCandidate(candidateData);
            console.log('Added candidate:', addedCandidate);
            return {
                success: true,
                message: 'Candidate added successfully',
                data: addedCandidate,
            };
        } catch (error) {
            console.error('Error adding candidate:', error);
            return {
                success: false,
                message: 'Failed to add candidate',
            };
        }
    }
}

export class GetElectionStatsService {
    static async getStats(): Promise<{ success: boolean; data?: any; error?: string }> {
        try {
            const stats = await EC.getElectionStats();
            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            console.error('Error fetching election stats:', error);
            return {
                success: false,
                error: 'Failed to fetch election stats',
            };
        }
    }
}