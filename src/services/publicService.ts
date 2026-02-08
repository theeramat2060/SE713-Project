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

const logPublicEvent = (event: string, data: Record<string, any>) => {
    console.log(`[PUBLIC] ${event}:`, {timestamp: new Date().toISOString(), ...data});
};

export const getConstituencies = async (): Promise<ServiceResult<ConstituencyResponse[]>> => {
    logPublicEvent('GET_CONSTITUENCIES', {});
    const constituencies = await constituencyRepository.getAllConstituencies();
    return {
        success: true,
        data: constituencies,
    };
};

export const getConstituencyResults = async (constituencyId: number): Promise<ServiceResult<ConstituencyResultsResponse>> => {
    const constituency = await constituencyRepository.getConstituencyById(constituencyId);

    if (!constituency) {
        logPublicEvent('CONSTITUENCY_NOT_FOUND', {constituencyId});
        return {
            success: false,
            error: {
                message: 'Constituency not found',
                code: 404,
            },
        };
    }

    const candidates = await constituencyRepository.getCandidatesWithVotes(
        constituencyId,
        constituency.is_closed
    );

    logPublicEvent('GET_CONSTITUENCY_RESULTS', {constituencyId, candidateCount: candidates.length});
    return {
        success: true,
        data: {
            constituency,
            candidates,
        },
    };
};

export const getParties = async (): Promise<ServiceResult<PartyResponse[]>> => {
    logPublicEvent('GET_PARTIES', {});
    const parties = await partyRepository.getPartiesBasic();
    return {
        success: true,
        data: parties,
    };
};

export const getPartyDetails = async (partyId: number): Promise<ServiceResult<PartyDetailsResponse>> => {
    const party = await partyRepository.getPartyWithCandidates(partyId);

    if (!party) {
        logPublicEvent('PARTY_NOT_FOUND', {partyId});
        return {
            success: false,
            error: {
                message: 'Party not found',
                code: 404,
            },
        };
    }

    logPublicEvent('GET_PARTY_DETAILS', {partyId});
    return {
        success: true,
        data: party,
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
