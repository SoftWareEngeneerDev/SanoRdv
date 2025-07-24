// controllers/rendezvous.controller.js
import Notification from '../models/notification.model.js';
import {
  notifPatientConfirmation,
  notifPatientAnnulation,
  notifMedecinConfirmation,
  notifMedecinAnnulation
} from './notification.controller.js';
import RendezVous from '../models/rendezvous.model.js';
import Creneau from '../models/creneau.model.js';



export const prendreRendezVous = async (req, res) => {
  try {
    const { patientId, medecinId, creneauId, time, motif } = req.body;

    const creneau = await Creneau.findById(creneauId);
    if (!creneau) {
      return res.status(404).json({ message: 'Créneau introuvable' });
    }

    const slot = creneau.timeSlots.find(s => s.time === time);
    if (!slot) {
      return res.status(400).json({ message: 'Heure non trouvée dans ce créneau' });
    }

    if (slot.status !== 'disponible') {
      return res.status(400).json({ message: 'Ce créneau horaire est indisponible.' });
    }

    const existingRdv = await RendezVous.findOne({ creneau: creneauId, time });
    if (existingRdv) {
      return res.status(400).json({ message: 'Ce créneau est déjà pris.' });
    }

    // Création du RDV
    const rdv = await RendezVous.create({
      patient: patientId,
      medecin: medecinId,
      creneau: creneauId,
      date: creneau.date,
      time,
      motif,
      statut: 'confirmé'
    });

    // Mise à jour du créneau
    slot.status = 'indisponible';
    slot.patientId = patientId;
    await creneau.save();

    // Envoi de notification
    await notifPatientConfirmation(rdv._id);
    await notifMedecinConfirmation(rdv._id);


    return res.status(201).json({ message: 'Rendez-vous confirmé', rendezVous: rdv, Notification });
  } catch (error) {
    console.error('Erreur prise de rendez-vous:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};



export const annulerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    const rdv = await RendezVous.findById(id);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable." });

    const estPatient = rdv.patient.toString() === userId;
    const estMedecin = rdv.medecin.toString() === userId;

    if (userRole !== 'admin' && !estPatient && !estMedecin) {
      return res.status(403).json({ message: "Non autorisé à annuler ce rendez-vous." });
    }

    // Mise à jour du rendez-vous
    rdv.statut = 'annulé';
    rdv.annulePar = userId;
    rdv.motifAnnulation = motif || '';
    rdv.dateAnnulation = new Date();
    await rdv.save();

    // Mise à jour du créneau
    const creneau = await Creneau.findById(rdv.creneau);
    if (creneau) {
      const slot = creneau.timeSlots.find(s => s.time === rdv.time);
      if (slot) {
        slot.status = 'disponible';
        slot.patientId = null;
      }
      await creneau.save();
    }

    // Notification d’annulation
    await notifPatientAnnulation(rdv._id);
    await notifMedecinAnnulation(rdv._id);


    res.status(200).json({ message: 'Rendez-vous annulé avec succès.', rdv, Notification });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};




export const modifierRendezVous = async (req, res) => {
  try {
    const { rendezVousId, userId, newTime, newMotif } = req.body;
    const rdv = await RendezVous.findById(rendezVousId);
    if (!rdv) return res.status(404).json({ message: "Rendez-vous introuvable" });
    if (
      userId !== rdv.patient.toString() &&
      userId !== rdv.medecin.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: "Non autorisé à modifier ce rendez-vous" });
    }
    const creneau = await Creneau.findById(rdv.creneau);
    if (!creneau) return res.status(404).json({ message: "Créneau introuvable" });
    const oldSlot = creneau.timeSlots.find(s => s.time === rdv.time);
    if (oldSlot) oldSlot.status = 'disponible';
    const newSlot = creneau.timeSlots.find(s => s.time === newTime);
    if (!newSlot || newSlot.status === 'indisponible') {
      return res.status(400).json({ message: "Nouvelle heure indisponible" });
    }
    newSlot.status = 'indisponible';
    rdv.time = newTime;
    if (newMotif) rdv.motif = newMotif;
    await rdv.save();
    await creneau.save();
    res.status(200).json({ message: "Rendez-vous modifié", rendezVous: rdv });
  } catch (error) {
    console.error("Erreur modification RDV :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const getRendezVousParMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { filtre } = req.query;
    const now = new Date();

    const match = { medecin: medecinId };

    if (filtre === 'passe') {
      match.date = { $lt: now };
    } else if (filtre === 'futur') {
      match.date = { $gte: now };
    }

    const rendezVous = await RendezVous.find(match)
    .populate('patient', 'prenom nom email telephone')
    .populate('creneau', 'date')
    .sort({ date: -1, time: -1 });


    console.log("✅ Données rendez-vous envoyées :", rendezVous);

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("💥 Erreur dans getRendezVousParMedecin :", error.message, error.stack); // 🟢 trace complète
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getStatistiquesParMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;

    const total = await RendezVous.countDocuments({ medecin: medecinId });
    const confirmes = await RendezVous.countDocuments({ medecin: medecinId, statut: 'confirmé' });
    const annules = await RendezVous.countDocuments({ medecin: medecinId, statut: 'annulé' });

    return res.status(200).json({
      total,
      confirmes,
      annules
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des statistiques :", error);
    return res.status(500).json({ message: "Erreur serveur", error });
  }
};



export const getRendezVousParPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { filtre } = req.query;
    const now = new Date();

    const match = { patient: patientId };

    if (filtre === 'passe') {
      match.date = { $lt: now };
    } else if (filtre === 'futur') {
      match.date = { $gte: now };
    }

    const rendezVous = await RendezVous.find(match)
      .populate('medecin', 'nom prenom email')
      .populate('creneau', 'date')
      .sort({ date: -1, time: -1 });


      console.log("✅ Données rendez-vous envoyées :", rendezVous);
      

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("Erreur récupération des RDV patient :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getRendezVousParId = async (req, res) => {
  try {
    const { id } = req.params;
    const rdv = await RendezVous.findById(id)
      .populate('patient')
      .populate('medecin')
      .populate('creneau');

    if (!rdv) return res.status(404).json({ message: 'Rendez-vous introuvable' });
    res.status(200).json(rdv);
  } catch (error) {
    console.error('Erreur chargement RDV par ID :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


export const getTousLesRendezVousPourAdmin = async (req, res) => {
  try {
    const { filtre } = req.query;
    const now = new Date();

    const match = {};

    if (filtre === 'passe') {
      match.date = { $lt: now };
    } else if (filtre === 'futur') {
      match.date = { $gte: now };
    }

    let rendezVous = await RendezVous.find(match)
      .populate('patient', 'nom prenom email telephone dateNaissance')
      .populate('medecin', 'nom prenom email specialite')
      .populate('creneau', 'date')
      .sort({ date: -1, time: -1 });

    // ⚠️ Filtrage sécurisé pour éviter les erreurs
    rendezVous = rendezVous.filter((rdv) => {
      if (!rdv.creneau || !rdv.creneau.date || !rdv.time) return false;

      const rdvDate = new Date(rdv.creneau.date);
      const [heure, minute] = rdv.time.split(':');
      rdvDate.setHours(parseInt(heure), parseInt(minute), 0, 0);

      if (filtre === 'passe') {
        return rdvDate < now;
      } else if (filtre === 'futur') {
        return rdvDate >= now;
      }

      return true;
    });

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("Erreur récupération RDV admin :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
