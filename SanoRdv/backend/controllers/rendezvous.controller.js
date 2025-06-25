import RendezVous from '../models/rendezvous.model.js';
import Creneau from '../models/creneau.model.js';
// import { notifierRendezVous } from '../utils/notification.util.js';
/**
 * Prendre un rendez-vous (avec réservation de créneau)
 */
export const prendreRendezVous = async (req, res) => {
  try {
    const { patientId, medecinId, date, time, creneauId, prenom, nom, email } = req.body;

    if (!patientId || !medecinId || !date || !time || !creneauId) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const dateObj = new Date(date);

    // Vérifie que le créneau existe et est libre
    const creneau = await Creneau.findById(creneauId);
    if (!creneau || creneau.statut !== 'libre') {
      return res.status(400).json({ message: 'Ce créneau n\'est plus disponible.' });
    }

    // Vérifie qu'il n'y a pas déjà un rendez-vous pour ce médecin à ce moment
    const doublon = await RendezVous.findOne({
      medecin: medecinId,
      date: dateObj,
      time
    });
    if (doublon) {
      return res.status(409).json({ message: 'Un rendez-vous existe déjà à cette date et heure pour ce médecin.' });
    }

    // Crée le rendez-vous
    const nouveauRDV = new RendezVous({
      patient: patientId,
      medecin: medecinId,
      date: dateObj,
      time,
      status: 'confirmé',
    });

    try {
      await nouveauRDV.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          message: 'Ce rendez-vous existe déjà (conflit de doublon).'
        });
      }
      throw err;
    }

    // Marque le créneau comme réservé
    creneau.statut = 'réservé';
    creneau.rendezVous = nouveauRDV._id;
    await creneau.save();

    // Notification (optionnelle)
    // await notifierRendezVous('confirmation', {
    //   email: email || 'patient@example.com',
    //   ine: nouveauRDV._id.toString(),
    //   prenom,
    //   nom
    // });

    res.status(201).json({
      message: 'Rendez-vous confirmé avec succès.',
      rendezVous: nouveauRDV,
      creneauReserve: creneau
    });
  } catch (err) {
    console.error('[Prendre RDV]', err);
    res.status(500).json({ message: 'Erreur serveur lors de la prise de rendez-vous.' });
  }
};
/**
 * Annuler un rendez-vous et libérer le créneau associé
 */
export const annulerRendezVous = async (req, res) => {
  try {
    const { id } = req.params;
    const rdv = await RendezVous.findById(id);
    if (!rdv) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    rdv.status = 'annulé';
    await rdv.save();
    const creneau = await Creneau.findOne({ rendezVousId: rdv._id });
    if (creneau) {
      creneau.statut = 'libre';
      creneau.rendezVousId = null;
      await creneau.save();
    }
    // await notifierRendezVous('annulation', {
    //   email: 'patient@example.com',
    //   ine: rdv._id.toString(),
    //   prenom: 'Patient',
    //   nom: ''
    // });
    res.status(200).json({
      message: 'Rendez-vous annulé et créneau libéré',
      rendezVous: rdv,
      creneauLibere: creneau || null
    });
  } catch (err) {
    console.error('[Annuler RDV]', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
