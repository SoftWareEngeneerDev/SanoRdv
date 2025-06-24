import RendezVous from '../models/rendezvous.model.js';
import Creneau from '../models/creneau.model.js';
import { notifierRendezVous } from '../utils/notification.util.js';

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

    // Vérifier que le créneau est disponible
    const creneau = await Creneau.findById(creneauId);
    if (!creneau || creneau.statut !== 'libre') {
      return res.status(400).json({ message: 'Ce créneau n\'est plus disponible.' });
    }

    // Vérifier s’il n’y a pas de doublon de rendez-vous
    const existe = await RendezVous.findOne({
      medecin: medecinId,
      date: dateObj,
      time,
      status: { $ne: 'annulé' }
    });

    if (existe) {
      return res.status(400).json({ message: 'Ce créneau est déjà réservé.' });
    }

    // Créer le rendez-vous
    const nouveauRDV = new RendezVous({
      patient: patientId,
      medecin: medecinId,
      date: dateObj,
      time,
      status: 'confirmé',
    });

    await nouveauRDV.save();

    // Marquer le créneau comme réservé
    creneau.statut = 'réservé';
    creneau.rendezVousId = nouveauRDV._id;
    await creneau.save();

    // Notification centralisée (ex. : mail ou SMS)
    await notifierRendezVous('confirmation', {
      email: email || 'patient@example.com',
      ine: nouveauRDV._id.toString(),
      prenom,
      nom
    });

    res.status(201).json({
      message: 'Rendez-vous confirmé',
      rendezVous: nouveauRDV,
      creneauReserve: creneau
    });
  } catch (err) {
    console.error('[Prendre RDV]', err);
    res.status(500).json({ message: 'Erreur serveur' });
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

    await notifierRendezVous('annulation', {
      email: 'patient@example.com',
      ine: rdv._id.toString(),
      prenom: 'Patient',
      nom: ''
    });

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
