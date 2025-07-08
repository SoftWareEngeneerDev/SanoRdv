// controllers/rendezvous.controller.js
import RendezVous from '../models/rendezvous.model.js';
import Creneau from '../models/creneau.model.js';
const moisFrancais = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];
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
    // Vérifie si un rendez-vous existe déjà
    const existingRdv = await RendezVous.findOne({ creneau: creneauId, time });
    if (existingRdv) {
      return res.status(400).json({ message: 'Ce créneau est déjà pris.' });
    }
    // Créer le rendez-vous
    const rdv = await RendezVous.create({
      patient: patientId,
      medecin: medecinId,
      creneau: creneauId,
      time,
      motif,
      statut: 'confirmé'
    });
    // Mettre à jour le statut du créneau à 'indisponible'
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
      userId !== rendezVous.medecin.toString()
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
export const getRendezVousParMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const rendezVous = await RendezVous.find({
      medecin: medecinId,
      statut: { $ne: 'annulé' }
    })
    .populate('patient', 'nom prenom email')
    .populate('creneau', 'date')
    .sort({ createdAt: -1 });
    // Grouper par mois de la date du créneau
    const grouped = {};
    rendezVous.forEach(rdv => {
      const dateCreneau = rdv.creneau?.date;
      if (!dateCreneau) return;
      const dateObj = new Date(dateCreneau);
      const mois = moisFrancais[dateObj.getMonth()]; // de 0 à 11
      if (!grouped[mois]) {
        grouped[mois] = [];
      }
      grouped[mois].push(rdv);
    });
    res.status(200).json(grouped);
  } catch (error) {
    console.error("Erreur récupération des RDV médecin :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};