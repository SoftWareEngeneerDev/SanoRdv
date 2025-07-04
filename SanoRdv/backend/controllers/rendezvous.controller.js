// rendezvous.controller.js
import RendezVous from '../models/rendezvous.model.js';
import { sendINEEmail } from '../utils/mail.util.js';
export const prendreRendezVous = async (req, res) => {
  try {
    const { patientId, medecinId, date, time, prenom, nom } = req.body;
    if (!patientId || !medecinId || !date || !time) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
    const existe = await RendezVous.findOne({ medecin: medecinId, date, time, status: { $ne: 'cancelled' } });
    if (existe) {
      return res.status(400).json({ message: 'Créneau déjà réservé' });
    }
    const nouveauRDV = new RendezVous({
      patient: patientId,
      medecin: medecinId,
      date,
      time,
      status: 'confirmed',
    });
    await nouveauRDV.save();
    const ine = nouveauRDV._id.toString();
    // Remplacer 'patient@example.com' par l'email réel du patient si possible
    await sendINEEmail('patient@example.com', ine, prenom || 'Patient', nom || '');
    res.status(201).json({
      message: 'Rendez-vous confirmé',
      rendezVous: nouveauRDV,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
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
