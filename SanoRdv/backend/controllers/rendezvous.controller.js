// controllers/rendezvous.controller.js
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
    if (slot.status === 'indisponible') {
      return res.status(400).json({ message: 'Ce créneau horaire est déjà réservé.' });
    }
    const existingRdv = await RendezVous.findOne({ creneau: creneauId, time });
    if (existingRdv) {
      return res.status(400).json({ message: 'Ce créneau est déjà pris.' });
    }
    const rdv = await RendezVous.create({
      patient: patientId,
      medecin: medecinId,
      creneau: creneauId,
      date: creneau.date,
      time,
      motif,
      statut: 'confirmé'
    });
    slot.status = 'indisponible';
    await creneau.save();
    return res.status(201).json({ message: 'Rendez-vous confirmé', rendezVous: rdv });
  } catch (error) {
    console.error('Erreur prise de rendez-vous:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const annulerRendezVous = async (req, res) => {
  try {
    const { rendezVousId, userId } = req.body;
    const rendezVous = await RendezVous.findById(rendezVousId);
    if (!rendezVous) return res.status(404).json({ message: "Rendez-vous introuvable" });
    if (
      userId !== rendezVous.patient.toString() &&
      userId !== rendezVous.medecin.toString() &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: "Non autorisé à annuler ce rendez-vous" });
    }
    const creneau = await Creneau.findById(rendezVous.creneau);
    if (!creneau) return res.status(404).json({ message: "Créneau introuvable" });
    const rdvDateTime = new Date(creneau.date);
    const [hours, minutes] = rendezVous.time.split(':');
    rdvDateTime.setHours(parseInt(hours), parseInt(minutes));
    const now = new Date();
    const diffMs = rdvDateTime - now;
    const diffHeures = diffMs / (1000 * 60 * 60);
    if (diffHeures < 1) {
      return res.status(400).json({ message: "Impossible d’annuler moins d’1h avant le rendez-vous." });
    }
    rendezVous.statut = 'annulé';
    await rendezVous.save();
    const slot = creneau.timeSlots.find(slot => slot.time === rendezVous.time);
    if (slot) {
      slot.status = 'disponible';
      await creneau.save();
    }
    return res.status(200).json({ message: "Rendez-vous annulé avec succès" });
  } catch (error) {
    console.error("Erreur annulation :", error);
    res.status(500).json({ message: "Erreur serveur" });
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
      .populate('patient', 'nom prenom email')
      .populate('creneau', 'date')
      .sort({ date: -1, time: -1 });

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("Erreur récupération des RDV médecin :", error);
    res.status(500).json({ message: "Erreur serveur" });
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

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("Erreur récupération des RDV patient :", error);
    res.status(500).json({ message: "Erreur serveur" });
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

    const rendezVous = await RendezVous.find(match)
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom email')
      .populate('creneau', 'date')
      .sort({ date: -1, time: -1 });

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("Erreur récupération RDV admin :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
