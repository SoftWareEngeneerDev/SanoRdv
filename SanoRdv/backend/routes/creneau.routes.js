import express from 'express';
import CreneauController from '../controllers/creneau.controller.js';

const router = express.Router();
const controller = CreneauController; // Correction: utilisation cohérente du contrôleur

// Middleware de validation pour les routes POST/PUT
router.use(express.json());

// Route pour générer et Enregistrer les créneaux horaires
router.post('/genererEtEnregistrer', async (req, res) => {
    const { agendaId, date, heuresIndisponibles } = req.body;

    try {
        const result = await controller.genererEtEnregistrerCreneau(agendaId, date, heuresIndisponibles || []);
        return res.status(200).json({
            success: true,
            message: result.operation === 'create' 
                ? "Créneau généré et enregistré" 
                : "Créneau existant mis à jour",
            data: result.data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

//---------------------------------------------------------------

router.delete('/supprimer', async (req, res) => {
  const { agendaId, date } = req.body;

  try {
    const result = await CreneauController.supprimerCreneau(agendaId, date);
    res.status(200).json({
      success: true,
      message: 'Créneau supprimé avec succès',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


//-------------------Ajouter une route pour appeler--------------
router.get('/parDate/:agendaId/:date', async (req, res) => {
  const { agendaId, date } = req.params;

  try {
    const creneau = await CreneauController.getCreneauxParDate(agendaId, date);
    res.status(200).json({
      success: true,
      message: 'Créneau récupéré avec succès',
      data: creneau
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});
//---------------------------------------------------------------

// --------------------------Route pour appeler cette fonction--------
router.get('/filtrer/:agendaId/:date/:statut', async (req, res) => {
  const { agendaId, date, statut } = req.params;

  try {
    const resultat = await CreneauController.filtrerCreneauxParStatut(agendaId, date, statut);
    res.status(200).json({
      success: true,
      message: `Créneaux avec statut "${statut}"`,
      data: resultat
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

//---------------------------------------------------------------------------

export default router;