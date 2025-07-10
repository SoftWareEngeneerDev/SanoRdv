import express from 'express';
import CreneauController from '../controllers/creneau.controller.js';

const router = express.Router();
const controller = CreneauController; // Correction: utilisation cohérente du contrôleur

// Middleware de validation pour les routes POST/PUT
router.use(express.json());

// Route pour générer les créneaux horaires
router.post('/generer', (req, res) => {
    // Validation du corps de la requête
    if (!req.body?.dateChoisie) {
        return res.status(400).json({ 
            success: false,
            message: "Le champ 'dateChoisie' est requis dans le corps de la requête" 
        });
    }

    const { dateChoisie } = req.body;

    try {
        const timeSlots = controller.genererCreneauxParDate(dateChoisie);
        res.status(200).json({ 
            success: true,
            message: 'Créneaux générés avec succès', 
            data: timeSlots 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Route pour modifier le statut
router.put('/modifierStatut', (req, res) => {
    // Validation des champs requis
    if (!req.body?.timeSlots || !req.body?.time || !req.body?.newStatus) {
        return res.status(400).json({
            success: false,
            message: "Les champs 'timeSlots', 'time' et 'newStatus' sont requis"
        });
    }

    const { timeSlots, time, newStatus } = req.body;

    try {
        const updatedTimeSlots = controller.mettreAJourStatutCreneau(timeSlots, time, newStatus);
        res.status(200).json({ 
            success: true,
            message: 'Statut mis à jour', 
            data: updatedTimeSlots 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
});

// Route pour enregistrer les créneaux
router.post('/', async (req, res) => {
    // Validation des champs requis
    if (!req.body?.dateChoisie || !req.body?.agendaId || !req.body?.timeSlots) {
        return res.status(400).json({
            success: false,
            message: "Les champs 'dateChoisie', 'agendaId' et 'timeSlots' sont requis"
        });
    }

    const { dateChoisie, agendaId, timeSlots } = req.body;

    try {
        const savedCreneau = await controller.saveCreneaux(dateChoisie, agendaId, timeSlots);
        res.status(201).json({  // 201 pour création réussie
            success: true,
            message: 'Créneaux enregistrés', 
            data: savedCreneau 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: `Erreur serveur: ${error.message}` 
        });
    }
});

// Route pour l'insertion en masse
router.post('/enregistrerBulk', async (req, res) => {
    // Validation des champs requis
    if (!req.body?.dateChoisie || !req.body?.agendaId || !req.body?.timeSlots) {
        return res.status(400).json({
            success: false,
            message: "Les champs 'dateChoisie', 'agendaId' et 'timeSlots' sont requis"
        });
    }

    const { dateChoisie, agendaId, timeSlots } = req.body;

    try {
        const result = await controller.saveCreneauxBulk(dateChoisie, agendaId, timeSlots);
        res.status(201).json({ 
            success: true,
            message: 'Créneaux enregistrés en masse', 
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: `Erreur serveur: ${error.message}` 
        });
    }
});

export default router;