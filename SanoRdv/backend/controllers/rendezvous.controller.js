// controllers/rendezvous.controller.js
import {
  notifPatientConfirmation,
  notifPatientAnnulation,
  notifMedecinConfirmation,
  notifMedecinAnnulation
} from './notification.controller.js';
import Creneau from '../models/creneau.model.js';



function ajouterDateHeureISO(creneau) {
  const creneauWithISO = { ...creneau.toObject() };

  creneauWithISO.timeSlots = creneau.timeSlots.map(slot => {
    const dateHeure = new Date(
      new Date(creneau.date).toISOString().split('T')[0] + 'T' + slot.time
    );
    return {
      ...slot.toObject(),
      dateHeureISO: dateHeure.toISOString()
    };
  });

  return creneauWithISO;
}


//  Prise de rendez-vous
export const prendreRendezVous = async (req, res) => {
  const { creneauId, timeSlotId, patientId, motifRendezVous } = req.body;

  try {
    const creneau = await Creneau.findById(creneauId);
    if (!creneau) return res.status(404).json({ message: 'Créneau introuvable' });

    const timeSlot = creneau.timeSlots.id(timeSlotId);
    if (!timeSlot) return res.status(404).json({ message: 'Plage horaire introuvable' });

    if (timeSlot.status !== 'disponible') {
      return res.status(400).json({ message: 'Ce créneau est déjà réservé ou indisponible' });
    }

    // Réservation
    Object.assign(timeSlot, {
      status: 'reserve',
      patientId,
      dateReservation: new Date(),
      motifRendezVous
    });

    await creneau.save();

    // Notifications
    await Promise.all([
      notifPatientConfirmation(creneauId, timeSlotId),
      notifMedecinConfirmation(creneauId, timeSlotId)
    ]);

    // Réponse
    return res.status(200).json({
      message: 'Rendez-vous pris avec succès',
      data: ajouterDateHeureISO(creneau)
    });

  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


//   Annulation de rendez-vous
export const annulerRendezVous = async (req, res) => {
  const { creneauId, timeSlotId, userId, userType, motifAnnulation } = req.body;

  try {
    const creneau = await Creneau.findById(creneauId).populate('agenda.medecin');
    if (!creneau) return res.status(404).json({ message: 'Créneau introuvable' });

    const timeSlot = creneau.timeSlots.id(timeSlotId);
    if (!timeSlot) return res.status(404).json({ message: 'Plage horaire introuvable' });

    if (timeSlot.status !== 'reserve') {
      return res.status(400).json({ message: 'Ce créneau n’est pas réservé' });
    }

    // Vérification de permission
    if (userType === 'patient' && timeSlot.patientId.toString() !== userId) {
      return res.status(403).json({ message: "Non autorisé à annuler ce rendez-vous" });
    }

    // Mise à jour
    timeSlot.status = 'disponible';
    timeSlot.patientId = null;
    timeSlot.dateAnnulation = new Date();
    timeSlot.motifAnnulation = motifAnnulation || 'Non précisé';
    timeSlot.annulePar = {
      id: userId,
      type: userType
    };

    await creneau.save();

    // Notifications automatiques
    await notifPatientAnnulation(creneauId, timeSlotId);
    await notifMedecinAnnulation(creneauId, timeSlotId);

    // Notification stockée en base
    await Notification.create({
      contenu: `Le rendez-vous du ${creneau.date.toLocaleDateString()} à ${timeSlot.time} a été annulé. Motif : ${motifAnnulation}`,
      canal: 'Système',
      destinataire: userType === 'patient' ? userId : creneau.agenda.medecin?._id,
      rendezVous: creneau._id,
      statut: 'Envoyé',
      type: 'Annulation',
      destinataireModel: userType
    });

    return res.status(200).json({ message: 'Rendez-vous annulé avec succès' });

  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


export const getRendezVousParMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { filtre } = req.query;
    const now = new Date();

    // Construction de la date limite
    const matchDate = {};
    if (filtre === 'passe') {
      matchDate.date = { $lt: now };
    } else if (filtre === 'futur') {
      matchDate.date = { $gte: now };
    }

    // Rechercher tous les créneaux du médecin avec timeSlots réservés
    const creneaux = await Creneau.find({
      ...matchDate,
    })
      .populate({
        path: 'agenda',
        match: { medecin: medecinId }, // Ne garder que les agendas du médecin
        populate: {
          path: 'medecin',
          select: 'prenom nom email telephone',
        },
      })
      .populate({
        path: 'timeSlots.patientId',
        select: 'prenom nom email telephone',
      })
      .sort({ date: -1 });

    // Filtrer les créneaux qui ont un agenda valide (lié au médecin)
       const creneauxFiltres = creneaux
  .filter(c => c.agenda !== null)
  .map(c => {
    const cWithISO = ajouterDateHeureISO(c);
    cWithISO.timeSlots = cWithISO.timeSlots.filter(ts => ts.patientId);
    return cWithISO;
  })
  .filter(c => c.timeSlots.length > 0);

   res.status(200).json(creneauxFiltres);

  } catch (error) {
    console.error("💥 Erreur dans getRendezVousParMedecin :", error.message, error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const getStatistiquesParMedecin = async (req, res) => {
  const { medecinId } = req.params;

  try {
    const creneaux = await Creneau.find({ agenda: medecinId });

    let total = 0;
    let confirmes = 0;
    let annules = 0;

    creneaux.forEach(cr => {
      cr.timeSlots.forEach(ts => {
        if (ts.status === 'reserve') {
          total++;
          confirmes++;
        } else if (ts.status === 'disponible' && ts.patientId === null && ts.annulePar) {
          annules++;
        }
      });
    });

    return res.status(200).json({ total, confirmes, annules });
  } catch (error) {
    console.error("❌ Erreur dans getStatistiquesParMedecin :", error.message);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getRendezVousParPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { filtre } = req.query;
    const now = new Date();

    // Construire les conditions de filtrage des créneaux
    const dateFilter = {};

    if (filtre === 'passe') {
      dateFilter.date = { $lt: now };
    } else if (filtre === 'futur') {
      dateFilter.date = { $gte: now };
    }

    // Chercher les créneaux contenant ce patient
    const creneaux = await Creneau.find({
      ...dateFilter,
      'timeSlots.patientId': patientId
    })
      .populate({
        path: 'agenda',
        populate: {
          path: 'medecin',
          select: 'nom prenom email'
        }
      })
      .populate('timeSlots.patientId', 'nom prenom email')
      .sort({ date: -1 });

    console.log("✅ Données rendez-vous patient :", creneaux);

    res.status(200).json(creneaux);
  } catch (error) {
    console.error("💥 Erreur dans getRendezVousParPatient :", error.message, error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};



export const getRendezVousParId = async (req, res) => {
  try {
    const { id } = req.params;

    const creneau = await Creneau.findById(id)
  .populate({
    path: 'agenda',
    populate: { path: 'medecin', select: 'nom prenom email telephone' }
  })
  .populate('timeSlots.patientId', 'nom prenom email telephone');


    if (!creneau || !creneau.patient || !creneau.medecin) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    res.status(200).json(creneau);
  } catch (error) {
    console.error('Erreur chargement RDV par ID :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


export const getTousLesRendezVousPourAdmin = async (req, res) => {
  try {
    const { filtre } = req.query;
    const now = new Date();

    // Construction du filtre de date
    const dateFilter = {};
    if (filtre === 'passe') {
      dateFilter.date = { $lt: now };
    } else if (filtre === 'futur') {
      dateFilter.date = { $gte: now };
    }

    // Recherche des créneaux avec filtre date
    const creneaux = await Creneau.find(dateFilter)
      .populate({
        path: 'agenda',
        populate: {
          path: 'medecin',
          select: 'nom prenom email specialite'
        }
      })
      .populate({
        path: 'timeSlots.patientId',
        select: 'nom prenom email telephone dateNaissance'
      })
      .sort({ date: -1 });

    // Filtrer uniquement ceux qui ont au moins un timeSlot réservé
    const creneauxReserves = creneaux.filter(creneau =>
      creneau.timeSlots.some(ts => ts.status === 'reserve')
    );

    res.status(200).json(creneauxReserves);
  } catch (error) {
    console.error("Erreur récupération RDV admin :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
