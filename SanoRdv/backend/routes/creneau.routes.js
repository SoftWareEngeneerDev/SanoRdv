import express from 'express'; 

// Import des contrôleurs
import { AjouterCreneau,ModifierCreneau, SupprimerCreneau, AfficheCreneau} from '../controllers/creneau.controller.js';  // Assure-toi d'utiliser l'extension .js

// Créer un router express
const router = express.Router();

// Route pour ajouter un créneau
router.post('/creneau', AjouterCreneau);

// Route pour modifier un créneau existant
router.put('/creneau/:idCreneau', ModifierCreneau);

// Route pour supprimer un créneau
router.delete('/creneau/:idCreneau', SupprimerCreneau);

// Route pour afficher un créneau
router.get('/creneau/:idCreneau', AfficheCreneau);


export default router;  // Exporter le router
