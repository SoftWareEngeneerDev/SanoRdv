import express from 'express';
import {
  creerAgenda,
  obtenirAgenda
} from '../controllers/agenda.controller.js';

const router = express.Router();

// Créer un agenda pour un jour donné
router.post('/', creerAgenda);

// Ajouter un créneau à un agenda existant

// Obtenir l’agenda d’un jour (ou par ID)
router.get('/:agendaId', obtenirAgenda);

// Réserver un créneau (lié à un rendez-vous)
// router.post('/:agendaId/creneaux/:creneauId/reserver', reserverCreneau);

export default router;
