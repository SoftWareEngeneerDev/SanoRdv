import express from 'express';
import {
  getStatistiquesHebdomadaires,
  exportCsv,
  exportPdf
} from '../controllers/statistiques.controller.js';

const router = express.Router();

router.get('/rendezvous/hebdomadaire', getStatistiquesHebdomadaires);
router.get('/rendezvous/hebdomadaire/csv', exportCsv);
router.get('/rendezvous/hebdomadaire/pdf', exportPdf);

export default router;
