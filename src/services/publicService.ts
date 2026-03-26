import * as constituencyRepository from '../repositories/constituencyRepository';
import * as partyRepository from '../repositories/partyRepository';
import {
    ConstituencyResponse,
    ConstituencyResultsResponse,
    PartyResponse,
    PartyDetailsResponse,
    PartyOverviewResponse,
    ServiceResult
} from '../dto/publicDTO';
import {findAllConstituencies} from "../repositories/constituencyRepository";
import {findAllParties, findPartyById} from "../repositories/partyRepository";

const logPublicEvent = (event: string, data: Record<string, any>) => {
    console.log(`[PUBLIC] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

export const getAllConstituencies = async () => {
    logPublicEvent('GET_ALL_CONSTITUENCIES', {});
    return await constituencyRepository.findAllConstituencies();
};

export const getAllParties = async (): Promise<ServiceResult<PartyResponse[]>> => {
    logPublicEvent('GET_ALL_PARTIES', {});
    const parties = await partyRepository.findAllParties();
    return {
        success: true,
        data: parties,
    };
};
export const getParties = async (id: number): Promise<ServiceResult<PartyDetailsResponse>> => {
    logPublicEvent('GET_PARTY_DETAILS', { id });
    const party = await partyRepository.findPartyById(id);
    
    if (!party) {
        return {
            success: false,
            error: {
                message: 'Party not found',
                code: 404,
            },
        };
    }

    const response: PartyDetailsResponse = {
        id: party.id,
        name: party.name,
        logo_url: party.logo_url,
        policy: party.policy,
        created_at: party.created_at || new Date(),
        candidates: (party as any).Candidate.map((c: any) => ({
            id: c.id,
            title: c.title,
            first_name: c.first_name,
            last_name: c.last_name,
            number: c.number,
            image_url: c.image_url,
            province: c.Constituency.province,
            district_number: c.Constituency.district_number,
        })),
    };

    return {
        success: true,
        data: response,
    };
};

export const getPartyOverview = async (): Promise<ServiceResult<PartyOverviewResponse>> => {
    const closedConstituencies = await constituencyRepository.getClosedConstituencies();
    const parties: any[] = [];

    for (let i = 0; i < closedConstituencies.length; i++) {
        const constituency = closedConstituencies[i];
        if (!constituency.candidates || !constituency.candidates.length) continue;

        let winner = null;
        for (let j = 0; j < constituency.candidates.length; j++) {
            const candidate = constituency.candidates[j];
            if (!winner || (candidate.vote_count || 0) > (winner.vote_count || 0)) {
                winner = candidate;
            }
        }

        if (!winner || winner.vote_count <= 0) continue;

        let partyEntry = null;
        for (let k = 0; k < parties.length; k++) {
            if (parties[k].id === winner.party_id) {
                partyEntry = parties[k];
                break;
            }
        }

        if (!partyEntry) {
            partyEntry = {
                id: winner.party_id,
                name: winner.party_name,
                logoUrl: winner.party_logo_url,
                seats: 0,
            };
            parties.push(partyEntry);
        }

        partyEntry.seats++;
    }

    for (let i = 0; i < parties.length; i++) {
        for (let j = i + 1; j < parties.length; j++) {
            if (parties[j].seats > parties[i].seats) {
                const temp: any = parties[i];
                parties[i] = parties[j];
                parties[j] = temp;
            }
        }
    }

    let totalSeats = 0;
    for (let i = 0; i < parties.length; i++) {
        totalSeats += parties[i].seats;
    }

    logPublicEvent('GET_PARTY_OVERVIEW', {
        totalSeats,
        closedConstituencies: closedConstituencies.length,
    });

    return {
        success: true,
        data: {
            totalSeats,
            closedConstituencies: closedConstituencies.length,
            parties,
        },
    };
};
