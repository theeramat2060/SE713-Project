import {Router} from 'express';
import * as publicController from '../controllers/publicController';

const router = Router();


router.get('/constituencies', publicController.getConstituencies);
router.get('/constituencies/:id/results', publicController.getConstituencyResults);
router.get('/parties', publicController.getParties);
router.get('/parties/:id', publicController.getPartyDetails);
router.get('/party-overview', publicController.getPartyOverview);

export default router;
