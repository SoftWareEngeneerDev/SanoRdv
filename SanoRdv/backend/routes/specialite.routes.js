import express from 'express';
import {
  ajouterSpecialite,
  listerSpecialites,
  modifierSpecialite,
  desactiverSpecialite,
  supprimerSpecialite
} from '../controllers/specialite.controller.js';
import { authentifier, estAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/specialites
 * @desc    Ajouter une nouvelle spécialité
 * @access  Admin uniquement
 */
router.post('/', authentifier, estAdmin, ajouterSpecialite);

/**
 * @route   GET /api/specialites
 * @desc    Lister toutes les spécialités (avec ?actif=true/false)
 * @access  Public
 */
router.get('/', listerSpecialites);

/**
 * @route   PUT /api/specialites/:id
 * @desc    Modifier une spécialité
 * @access  Admin uniquement
 */
router.put('/:id', authentifier, estAdmin, modifierSpecialite);

/**
 * @route   PATCH /api/specialites/:id/desactiver
 * @desc    Désactiver une spécialité
 * @access  Admin uniquement
 */
router.patch('/:id/desactiver', authentifier, estAdmin, desactiverSpecialite);


/**
 * @route   DELETE /api/specialites/:id
 * @desc    Supprimer une spécialité
 * @access  Admin uniquement
 */
router.delete('/:id', authentifier, estAdmin, supprimerSpecialite);

export default router;
