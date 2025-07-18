import mongoose from 'mongoose';
import Agenda from '../models/agenda.model.js';
import Creneau from '../models/creneau.model.js';
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
      let nouvelAgenda = null;
        if (existingAgenda) {
          nouvelAgenda = existingAgenda;
          // console.log("L'agenda trouvé:",existingAgenda);
          //   return res.status(200).json({ 
          //       success: true,
          //       data: existingAgenda.populate('medecin')
          //                           .populate({
          //                               path: 'creneaux',
          //                               select: 'date timeSlots' // Seulement les champs nécessaires
          //                             }),
          //       message: "Agenda trouvé pour ce médecin" 
          //   });
          
        }
if (!existingAgenda) {
        // 3. Créer le nouvel agenda (sans creneaux pour l'instant)
            nouvelAgenda = new Agenda({
            date: new Date(date),
            medecin: medecinId,
            statut: 'Actif'
        });

        // 4. Sauvegarder l'agenda pour obtenir son ID
        await nouvelAgenda.save();
      }
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



export async function obtenirAgenda(req, res) {
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
      let nouvelAgenda = null;
        if (existingAgenda) {
          nouvelAgenda = existingAgenda;          
        }
        if (!existingAgenda) {
        // 3. Créer le nouvel agenda (sans creneaux pour l'instant)
            nouvelAgenda = new Agenda({
            date: new Date(date),
            medecin: medecinId,
            statut: 'Actif'
        });

        // 4. Sauvegarder l'agenda pour obtenir son ID
        await nouvelAgenda.save();
      }
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
