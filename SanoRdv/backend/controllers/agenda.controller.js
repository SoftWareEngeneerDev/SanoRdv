// import mongoose from 'mongoose';
// import Agenda from '../models/agenda.model.js';
// import Medecin from '../models/medecin.model.js';
// import { genererEtEnregistrerCreneau } from '../controllers/creneau.controller.js';
// import { getHeuresIndisponibles } from '../utils/CreneauIndisponible.creneau.js';

// async function creerAgenda(req, res) {
//     // Validation des entrées
//     const { date, idMedecin } = req.body;
//     const heuresIndisponibles = getHeuresIndisponibles();

//     if (!date || !idMedecin) {
//         return res.status(400).json({
//             success: false,
//             message: "Champs requis manquants",
//             requiredFields: {
//                 date: "string (format YYYY-MM-DD)",
//                 idMedecin: "ObjectId"
//             }
//         });
//     }

//     try {
//         // Validation de l'ObjectId
//         if (!mongoose.Types.ObjectId.isValid(idMedecin)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Format d'ID médecin invalide",
//                 received: idMedecin
//             });
//         }

//         // Vérification de l'existence du médecin
//         const medecinExists = await Medecin.exists({ _id: idMedecin });
//         if (!medecinExists) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Médecin non trouvé",
//                 medecinId: idMedecin
//             });
//         }

//         // Validation de la date
//         const parsedDate = new Date(date);
//         if (isNaN(parsedDate.getTime())) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Format de date invalide",
//                 expectedFormat: "YYYY-MM-DD",
//                 received: date
//             });
//         }

//         // Création de l'agenda avec le BON NOM DE CHAMP (idMedecin)
//         const nouvelAgenda = new Agenda({
//             date: parsedDate,
//             idMedecin: idMedecin, // Correction ici - doit correspondre au schéma
//             statut: 'Actif',
//             heuresIndisponibles: heuresIndisponibles
//         });

//         // Sauvegarde de l'agenda
//         const agendaSauvegarde = await nouvelAgenda.save();

//         // Génération des créneaux
//         const { data: creneaux, error: creneauError } = await genererEtEnregistrerCreneau(
//             agendaSauvegarde._id,
//             date,
//             heuresIndisponibles
//         );

//         if (creneauError) {
//             await Agenda.deleteOne({ _id: agendaSauvegarde._id });
//             throw new Error(creneauError);
//         }

//         // Mise à jour de l'agenda avec les créneaux
//         agendaSauvegarde.creneaux = creneaux.map(c => c._id);
//         const agendaFinal = await agendaSauvegarde.save();

//         return res.status(201).json({
//             success: true,
//             message: "Agenda créé avec succès",
//             data: {
//                 agenda: agendaFinal,
//                 creneauxGeneres: creneaux.length,
//                 heuresIndisponibles: heuresIndisponibles
//             }
//         });

//     } catch (error) {
//         console.error("[ERREUR] creerAgenda:", error);

//         // Gestion des erreurs spécifiques
//         if (error.name === 'ValidationError') {
//             const errors = {};
//             Object.keys(error.errors).forEach(key => {
//                 errors[key] = error.errors[key].message;
//             });
//             return res.status(400).json({
//                 success: false,
//                 message: "Erreur de validation",
//                 errors
//             });
//         }

//         if (error.code === 11000) {
//             return res.status(409).json({
//                 success: false,
//                 message: "Un agenda existe déjà pour cette date et ce médecin"
//             });
//         }

//         return res.status(500).json({
//             success: false,
//             message: "Erreur serveur",
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// }

// export { creerAgenda };


import mongoose from 'mongoose';
import Agenda from '../models/agenda.model.js';
import { getHeuresIndisponibles } from '../utils/CreneauIndisponible.creneau.js';
import { genererEtEnregistrerCreneau } from '../controllers/creneau.controller.js';


export async function creerAgenda(req, res) {
    try {
        const { date, medecinId } = req.body;
        const heuresIndisponibles = getHeuresIndisponibles();

        // 1. Validation des données
        if (!date || !medecinId) {
            return res.status(400).json({ 
                success: false,
                message: "Les champs 'date' et 'medecinId' sont obligatoires" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(medecinId)) {
            return res.status(400).json({ 
                success: false,
                message: "Identifiant médecin invalide" 
            });
        }

        // 2. Vérifier si un agenda existe déjà pour cette date et ce médecin
        const existingAgenda = await Agenda.findOne({ 
            date: new Date(date),
            medecin: medecinId
        });

        if (existingAgenda) {
            return res.status(409).json({ 
                success: false,
                message: "Un agenda existe déjà pour cette date et ce médecin" 
            });
        }

        // 3. Créer le nouvel agenda (sans creneaux pour l'instant)
        const nouvelAgenda = new Agenda({
            date: new Date(date),
            medecin: medecinId,
            statut: 'Actif'
        });

        // 4. Sauvegarder l'agenda pour obtenir son ID
        await nouvelAgenda.save();

        // 5. Générer et enregistrer les créneaux dans la collection Creneau
        const { data: creneauGenere } = await genererEtEnregistrerCreneau(
            nouvelAgenda._id, 
            date,
            heuresIndisponibles
        );

        // 6. Lier le créneau à l'agenda
        nouvelAgenda.creneaux.push(creneauGenere._id);
        await nouvelAgenda.save();

        // 7. Récupérer l'agenda complet avec les données peuplées
        const agendaComplet = await Agenda.findById(nouvelAgenda._id)
            .populate('medecin')
            .populate({
                path: 'creneaux',
                select: 'date timeSlots' // Seulement les champs nécessaires
            });

        return res.status(201).json({ 
            success: true,
            message: "Agenda créé avec succès",
            data: agendaComplet
        });

    } catch (error) {
        console.error("Erreur lors de la création de l'agenda:", error);
        return res.status(500).json({ 
            success: false,
            message: "Erreur serveur lors de la création de l'agenda",
            error: error.message 
        });
    }
}
