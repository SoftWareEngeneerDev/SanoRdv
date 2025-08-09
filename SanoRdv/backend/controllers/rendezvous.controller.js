// controllers/rendezvous.controller.js
import {
  notifPatientConfirmation,
  notifPatientAnnulation,
  notifMedecinConfirmation,
  notifMedecinAnnulation
} from './notification.controller.js';
import Creneau from '../models/creneau.model.js';
import Patient from '../models/patient.model.js';

function ajouterDateHeureISO(creneau) {
  const creneauWithISO = { ...creneau.toObject() };

  creneauWithISO.timeSlots = creneau.timeSlots.map(slot => {
    try {
      // Extraire la date sans l'heure
      const dateStr = new Date(creneau.date).toISOString().split('T')[0];
      
      // Vérifie que slot.time est défini et au format HH:mm ou HH:mm:ss
      if (!slot.time || !/^\d{2}:\d{2}(:\d{2})?$/.test(slot.time)) {
        throw new Error(`Time format invalide pour slot.time: ${slot.time}`);
      }
      
      // Construire une chaîne ISO complète : "YYYY-MM-DDTHH:mm:ssZ"
      // Si slot.time ne contient pas les secondes, ajoute ":00"
      const timeWithSeconds = slot.time.length === 5 ? `${slot.time}:00` : slot.time;
      
      // Construire l'objet Date en UTC
      const dateHeure = new Date(`${dateStr}T${timeWithSeconds}Z`);

      if (isNaN(dateHeure.getTime())) {
        throw new Error('Date invalide construite');
      }

      return {
        ...slot.toObject(),
        dateHeureISO: dateHeure.toISOString()
      };

    } catch (err) {
      console.error('Erreur dans ajouterDateHeureISO pour un slot:', err.message);
      // En cas d'erreur, retourne slot sans dateHeureISO
      return {
        ...slot.toObject(),
        dateHeureISO: null
      };
    }
  });

  return creneauWithISO;
}


//  Prise de rendez-vous
export const prendreRendezVous = async (req, res) => {
  const { creneauId, timeSlotId, patientId, motifRendezVous } = req.body;

  console.log('Requête prise de RDV reçue avec:', { creneauId, timeSlotId, patientId, motifRendezVous });

  try {
    if (!creneauId || !timeSlotId || !patientId || !motifRendezVous) {
      console.warn('Champs requis manquants dans la requête');
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const patient = await Patient.findById(patientId);
    console.log('Patient trouvé:', patient);
    if (!patient) {
      console.warn('Patient introuvable pour id:', patientId);
      return res.status(404).json({ message: "Patient introuvable" });
    }

    // Récupérer le créneau complet
    const creneau = await Creneau.findById(creneauId);
    console.log('Créneau récupéré:', creneau);
    if (!creneau) {
      console.warn('Créneau introuvable pour id:', creneauId);
      return res.status(404).json({ message: "Créneau introuvable" });
    }

    // Chercher le timeSlot dans ce créneau
    const timeSlot = creneau.timeSlots.id(timeSlotId);
    console.log('TimeSlot récupéré:', timeSlot);
    if (!timeSlot) {
      console.warn('TimeSlot non trouvé dans ce créneau, timeSlotId:', timeSlotId);
      return res.status(404).json({ message: 'TimeSlot non trouvé dans ce créneau' });
    }

    // Vérifier que le timeSlot est disponible
    if (timeSlot.status !== 'disponible') {
      console.warn('TimeSlot déjà réservé ou indisponible:', timeSlot.status);
      return res.status(400).json({ message: 'Ce timeSlot est déjà réservé ou indisponible' });
    }

    // Mettre à jour uniquement ce timeSlot dans le document en mémoire
    timeSlot.status = 'reserve';
    timeSlot.patientId = patientId;
    timeSlot.dateReservation = new Date();
    timeSlot.motifRendezVous = motifRendezVous;

    console.log('TimeSlot modifié:', timeSlot);

    // Sauvegarder la modification (update whole document)
    await creneau.save();
    console.log('Créneau sauvegardé avec le timeSlot modifié');

    // Envoi notifications
    try {
      await notifPatientConfirmation(creneauId, timeSlotId);
      await notifMedecinConfirmation(creneauId, timeSlotId);
      console.log('Notifications envoyées avec succès');
    } catch (notifError) {
      console.error('Erreur lors de l’envoi des notifications :', notifError);
    }

    // Calculer dateHeureISO
    let dateISO = null;
    try {
      const datePart = new Date(creneau.date).toISOString().split('T')[0];
      console.log('Date partie extraite:', datePart);

      const rawHour = timeSlot.time.padStart(5, '0');
      console.log('Heure brute:', rawHour);

      const finalTime = rawHour.length === 5 ? `${rawHour}:00` : rawHour;
      console.log('Heure finale avec secondes:', finalTime);

      const fullDateStr = `${datePart}T${finalTime}Z`;
      console.log('Chaîne complète date+heure ISO:', fullDateStr);

      const fullDate = new Date(fullDateStr);
      if (isNaN(fullDate.getTime())) {
        throw new Error('Date finale invalide : ' + fullDateStr);
      }
      dateISO = fullDate.toISOString();
      console.log('Date ISO finale:', dateISO);
    } catch (e) {
      console.error('⛔ Erreur de construction de date ISO :', e.message);
      return res.status(500).json({ message: 'Erreur de date du créneau', error: e.message });
    }

    return res.status(200).json({
      message: 'Rendez-vous pris avec succès',
      data: {
        ...timeSlot.toObject(),
        dateHeureISO: dateISO
      }
    });

  } catch (err) {
    console.error("Erreur lors de la prise de rendez-vous :", err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};




//   Annulation de rendez-vous
export const annulerRendezVous = async (req, res) => {
  
  const timeSlotId = req.params.id;
  const { creneauId, userId, userType, motifAnnulation } = req.body;
  
console.log('🚩 annulerRendezVous appelé');
  console.log('Param ID (timeSlotId):', req.params.id);
  console.log('Body:', req.body);
  try {
    const creneau = await Creneau.findById(creneauId).populate('agenda.medecin');
    if (!creneau) {
      console.log('Créneau introuvable avec ID:', creneauId);
      return res.status(404).json({ message: 'Créneau introuvable' });
    }

    const timeSlot = creneau.timeSlots.id(timeSlotId);
    if (!timeSlot) {
      console.log('TimeSlot introuvable avec ID:', timeSlotId, 'dans ce créneau');
      return res.status(404).json({ message: 'Plage horaire introuvable' });
    }
    console.log('TimeSlot trouvé:', timeSlot);
    if (timeSlot.status !== 'reserve') {
      return res.status(400).json({ message: 'Ce créneau n’est pas réservé' });
    }

    if (userType === 'patient' && timeSlot.patientId?.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé à annuler ce rendez-vous' });
    }

    // 🔒 Sauvegarder patientId AVANT de l'effacer
    const ancienPatientId = timeSlot.patientId;

    try {
      await notifPatientAnnulation(creneauId, timeSlotId, ancienPatientId); // 👈 envoie patientId manuellement
      await notifMedecinAnnulation(creneauId, timeSlotId);
    } catch (e) {
      console.warn("Erreur envoi notifications : ", e.message);
    }

    // Mise à jour du timeSlot
    timeSlot.status = 'disponible';
    timeSlot.patientId = null;
    timeSlot.dateAnnulation = new Date();
    timeSlot.motifAnnulation = motifAnnulation || 'Non précisé';
    timeSlot.annulePar = {
      id: userId,
      type: userType === 'patient' ? 'Patient' : 'Medecin'
    };

    await creneau.save();


    return res.status(200).json({
      message: 'Rendez-vous annulé avec succès',
      data: timeSlot
    });

  } catch (err) {
    console.error('Erreur lors de l\'annulation :', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};


export const getRendezVousParMedecin = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { filtre } = req.query;
    const now = new Date();

    if (!medecinId) {
      return res.status(400).json({ message: "ID du médecin manquant" });
    }

    const matchDate = {};
    if (filtre === 'passe') {
      matchDate.date = { $lt: now };
    } else if (filtre === 'futur') {
      matchDate.date = { $gte: now };
    }

    const creneaux = await Creneau.find({ ...matchDate })
      .populate({
        path: 'agenda',
        match: { medecin: medecinId },
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

    // On aplatit les timeSlots réservés
    const rendezVous = [];

    for (const creneau of creneaux) {
      if (!creneau.agenda || !creneau.agenda.medecin) continue;

      const dateStr = creneau.date.toISOString().split('T')[0];

      for (const ts of creneau.timeSlots) {
        if (!ts.patientId || ts.status !== 'reserve') continue;

        rendezVous.push({
          _id: ts._id,
          date: new Date(`${dateStr}T${ts.time}:00`),
          time: ts.time,
          statut: ts.status,
          motif: ts.motif || '',
          patient: ts.patientId,
          creneau: {
            _id: creneau._id,
            date: creneau.date
          }
        });
      }
    }

    res.status(200).json(rendezVous);
  } catch (error) {
    console.error("💥 Erreur dans getRendezVousParMedecin :", error.message, error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const getStatistiquesParMedecin = async (req, res) => {
  const { medecinId } = req.params;

  try {
    // Étape 1 : récupérer les agendas du médecin
    const agendas = await Agenda.find({ medecin: medecinId }).select('_id');
    const agendaIds = agendas.map(a => a._id);

    // Étape 2 : récupérer les créneaux liés à ces agendas
    const creneaux = await Creneau.find({ agenda: { $in: agendaIds } });

    // Statistiques
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

    if (!patientId) {
      return res.status(400).json({ message: "ID patient manquant" });
    }

    // Construction du filtre de date
    const dateFilter = {};
    if (filtre === 'passe') {
      dateFilter.date = { $lt: now };
    } else if (filtre === 'futur') {
      dateFilter.date = { $gte: now };
    }

    // Récupération des créneaux contenant le patientId
    const creneaux = await Creneau.find({
      ...dateFilter,
      'timeSlots.patientId': patientId
    })
      .populate({
        path: 'agenda',
        populate: {
          path: 'medecin',
          select: 'nom prenom email specialite'
        }
      })
      .populate('timeSlots.patientId', 'nom prenom email')
      .sort({ date: -1 });

    // On extrait uniquement les timeSlots appartenant au patient
    const rendezVousPatient = [];

    for (const creneau of creneaux) {
      const { _id: creneauId, date, agenda, timeSlots } = creneau;

      for (const ts of timeSlots) {
        if (ts.patientId && ts.patientId._id.toString() === patientId) {
          rendezVousPatient.push({
            id: ts._id,
            creneauId: creneauId.toString(),
            date: new Date(`${date.toISOString().split('T')[0]}T${ts.time}:00`),
            time: ts.time,
            medecin: {
              _id: agenda?.medecin?._id?.toString() || '',
              nom: agenda?.medecin?.nom || '',
              prenom: agenda?.medecin?.prenom || '',
              email: agenda?.medecin?.email || '',
              specialite: agenda?.medecin?.specialite || ''
            },
            status: ts.status,
            motifAnnulation: ts.motifAnnulation || null
          });
        }
      }
    }

    res.status(200).json(rendezVousPatient);
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

    if (!creneau || !creneau.agenda || !creneau.agenda.medecin) {
      return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }

    const hasPatient = creneau.timeSlots.some(ts => ts.patientId != null);

    if (!hasPatient) {
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

    console.log("Filtre demandé:", filtre);

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

      console.log("Nombre de créneaux récupérés:", creneaux.length);


    // Filtrer uniquement ceux qui ont au moins un timeSlot réservé
    const creneauxReserves = creneaux.filter(creneau =>
      creneau.timeSlots.some(ts => ts.status === 'reserve')
    );

    console.log("Créneaux avec réservation:", creneauxReserves.length);

    res.status(200).json(creneauxReserves);
  } catch (error) {
    console.error("Erreur récupération RDV admin :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
