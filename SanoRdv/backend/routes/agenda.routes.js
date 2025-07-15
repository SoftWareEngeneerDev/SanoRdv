import express from 'express';
import { creerAgenda } from '../controllers/agenda.controller.js';

const router = express.Router();

// Route pour créer un agenda
router.post('/creer', creerAgenda);

export default router;
