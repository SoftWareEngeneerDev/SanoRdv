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

  try {
    if (!creneauId || !timeSlotId || !patientId || !motifRendezVous) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient introuvable" });
    }

    const updatedCreneau = await Creneau.findOneAndUpdate(
      {
        _id: creneauId,
        'timeSlots._id': timeSlotId,
        'timeSlots.status': 'disponible'
      },
      {
        $set: {
          'timeSlots.$.status': 'reserve',
          'timeSlots.$.patientId': patientId,
          'timeSlots.$.dateReservation': new Date(),
          'timeSlots.$.motifRendezVous': motifRendezVous
        }
      },
      { new: true }
    );

    if (!updatedCreneau) {
      return res.status(400).json({ message: 'Ce créneau est déjà réservé ou indisponible' });
    }

    // Extraire le timeSlot mis à jour
    const timeSlot = updatedCreneau.timeSlots.find(slot => slot._id.toString() === timeSlotId);
    if (!timeSlot) {
      return res.status(500).json({ message: 'Erreur interne : timeSlot introuvable après mise à jour' });
    }

    // Envoi de notifications
    try {
      await notifPatientConfirmation(creneauId, timeSlotId);
      await notifMedecinConfirmation(creneauId, timeSlotId);
    } catch (notifError) {
      console.error('Erreur lors de l’envoi des notifications :', notifError);
      // pas de retour ici, pour ne pas bloquer la réservation
    }

    // Calculer la date/heure ISO complète du rendez-vous
    const dateISO = new Date(
      new Date(updatedCreneau.date).toISOString().split('T')[0] + 'T' + 
      (timeSlot.time.length === 5 ? `${timeSlot.time}:00` : timeSlot.time) + 'Z'
    ).toISOString();

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
  const { creneauId, timeSlotId, userId, userType, motifAnnulation } = req.body;

  try {
    const creneau = await Creneau.findById(creneauId).populate('agenda.medecin');
    if (!creneau) {
      return res.status(404).json({ message: 'Créneau introuvable' });
    }

    const timeSlot = creneau.timeSlots.id(timeSlotId);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Plage horaire introuvable' });
    }

    if (timeSlot.status !== 'reserve') {
      return res.status(400).json({ message: 'Ce créneau n’est pas réservé' });
    }

    if (userType === 'patient' && timeSlot.patientId?.toString() !== userId) {
      return res.status(403).json({ message: 'Non autorisé à annuler ce rendez-vous' });
    }

    // Mise à jour
    timeSlot.status = 'disponible';
    timeSlot.patientId = null;
    timeSlot.dateAnnulation = new Date();
    timeSlot.motifAnnulation = motifAnnulation || 'Non précisé';
    timeSlot.annulePar = {
        id: userId,
        type: userType === 'patient' ? 'Patient' : 'Medecin' 
};


    await creneau.save();

    try {
      await notifPatientAnnulation(creneauId, timeSlotId);
      await notifMedecinAnnulation(creneauId, timeSlotId);
    } catch (e) {
      console.warn("Erreur envoi notifications : ", e.message);
    }

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
      const { date, agenda, timeSlots } = creneau;

      for (const ts of timeSlots) {
        if (ts.patientId && ts.patientId._id.toString() === patientId) {
          rendezVousPatient.push({
            id: ts._id,
            date: new Date(`${date.toISOString().split('T')[0]}T${ts.time}:00`),
            time: ts.time,
            medecin: {
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


// Récupérer les rendez-vous à venir
export const getRendezVousAVenir = async (req, res) => {
  try {
    const { utilisateurId, typeUtilisateur } = req.query;
    const maintenant = new Date();

    // Filtres de base pour les rendez-vous futurs
    let filtreBase = {
      date: { $gte: maintenant }
    };

    // Construction de la requête
    let query = Creneau.find(filtreBase)
      .populate({
        path: 'agenda',
        populate: {
          path: 'medecin',
          select: 'nom prenom email telephone specialite cabinet'
        }
      })
      .populate({
        path: 'timeSlots.patientId',
        select: 'nom prenom email telephone dateNaissance'
      })
      .sort({ date: 1, 'timeSlots.time': 1 }); // Tri croissant pour les futurs

    const creneaux = await query;

    // Filtrage et formatage
    let creneauxFiltres = creneaux;

    // Filtre par médecin si spécifié
    if (utilisateurId && typeUtilisateur === 'medecin') {
      creneauxFiltres = creneaux.filter(creneau => 
        creneau.agenda && 
        creneau.agenda.medecin && 
        creneau.agenda.medecin._id.toString() === utilisateurId
      );
    }

    // Filtre par patient si spécifié
    if (utilisateurId && typeUtilisateur === 'patient') {
      creneauxFiltres = creneaux.filter(creneau =>
        creneau.timeSlots.some(ts => 
          ts.patientId && ts.patientId._id.toString() === utilisateurId
        )
      );
    }

    // Formatage final avec ISO et filtrage des timeSlots réservés
    const result = creneauxFiltres.map(creneau => {
      const creneauWithISO = ajouterDateHeureISO(creneau);
      
      // Ne garder que les timeSlots réservés
      creneauWithISO.timeSlots = creneauWithISO.timeSlots.filter(ts => {
        let garde = ts.status === 'reserve';
        
        // Filtre supplémentaire par patient
        if (utilisateurId && typeUtilisateur === 'patient') {
          garde = garde && ts.patientId && ts.patientId._id.toString() === utilisateurId;
        }
        
        return garde;
      });

      return creneauWithISO;
    }).filter(creneau => creneau.timeSlots.length > 0);

    res.status(200).json({
      success: true,
      message: 'Rendez-vous à venir récupérés avec succès',
      data: result,
      total: result.length
    });

  } catch (error) {
    console.error("💥 Erreur dans getRendezVousAVenir :", error.message, error.stack);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des rendez-vous à venir",
      error: error.message 
    });
  }
};

// Récupérer les rendez-vous passés
export const getRendezVousPasses = async (req, res) => {
  try {
    const { utilisateurId, typeUtilisateur } = req.query;
    const maintenant = new Date();

    // Filtres de base pour les rendez-vous passés
    let filtreBase = {
      date: { $lt: maintenant }
    };

    // Construction de la requête
    let query = Creneau.find(filtreBase)
      .populate({
        path: 'agenda',
        populate: {
          path: 'medecin',
          select: 'nom prenom email telephone specialite cabinet'
        }
      })
      .populate({
        path: 'timeSlots.patientId',
        select: 'nom prenom email telephone dateNaissance'
      })
      .sort({ date: -1, 'timeSlots.time': -1 }); // Tri décroissant pour les passés

    const creneaux = await query;

    // Filtrage
    let creneauxFiltres = creneaux;

    // Filtre par médecin si spécifié
    if (utilisateurId && typeUtilisateur === 'medecin') {
      creneauxFiltres = creneaux.filter(creneau => 
        creneau.agenda && 
        creneau.agenda.medecin && 
        creneau.agenda.medecin._id.toString() === utilisateurId
      );
    }

    // Filtre par patient si spécifié
    if (utilisateurId && typeUtilisateur === 'patient') {
      creneauxFiltres = creneaux.filter(creneau =>
        creneau.timeSlots.some(ts => 
          ts.patientId && ts.patientId._id.toString() === utilisateurId
        )
      );
    }

    // Formatage final
    const result = creneauxFiltres.map(creneau => {
      const creneauWithISO = ajouterDateHeureISO(creneau);
      
      // Garder tous les timeSlots qui ont été réservés (même annulés)
      creneauWithISO.timeSlots = creneauWithISO.timeSlots.filter(ts => {
        let garde = ts.status === 'reserve' || (ts.status === 'disponible' && ts.patientId === null && ts.annulePar);
        
        // Filtre supplémentaire par patient
        if (utilisateurId && typeUtilisateur === 'patient') {
          garde = garde && (
            (ts.patientId && ts.patientId._id.toString() === utilisateurId) ||
            (ts.annulePar && ts.annulePar.id === utilisateurId && ts.annulePar.type === 'patient')
          );
        }
        
        return garde;
      });

      return creneauWithISO;
    }).filter(creneau => creneau.timeSlots.length > 0);

    res.status(200).json({
      success: true,
      message: 'Rendez-vous passés récupérés avec succès',
      data: result,
      total: result.length
    });

  } catch (error) {
    console.error("💥 Erreur dans getRendezVousPasses :", error.message, error.stack);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des rendez-vous passés",
      error: error.message 
    });
  }
};

// Fonction combinée pour récupérer à la fois futurs et passés
export const getTousLesRendezVous = async (req, res) => {
  try {
    const { utilisateurId, typeUtilisateur } = req.query;

    // Appeler les deux fonctions en parallèle
    const [rendezVousAVenir, rendezVousPasses] = await Promise.all([
      getRendezVousAVenirData(utilisateurId, typeUtilisateur),
      getRendezVousPassesData(utilisateurId, typeUtilisateur)
    ]);

    res.status(200).json({
      success: true,
      message: 'Tous les rendez-vous récupérés avec succès',
      data: {
        aVenir: rendezVousAVenir,
        passes: rendezVousPasses
      },
      total: {
        aVenir: rendezVousAVenir.length,
        passes: rendezVousPasses.length,
        total: rendezVousAVenir.length + rendezVousPasses.length
      }
    });

  } catch (error) {
    console.error("💥 Erreur dans getTousLesRendezVous :", error.message);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération de tous les rendez-vous",
      error: error.message 
    });
  }
};

// Fonctions utilitaires pour récupérer les données sans réponse HTTP
async function getRendezVousAVenirData(utilisateurId, typeUtilisateur) {
  const maintenant = new Date();
  
  let query = Creneau.find({ date: { $gte: maintenant } })
    .populate({
      path: 'agenda',
      populate: {
        path: 'medecin',
        select: 'nom prenom email telephone specialite'
      }
    })
    .populate({
      path: 'timeSlots.patientId',
      select: 'nom prenom email telephone'
    })
    .sort({ date: 1, 'timeSlots.time': 1 });

  const creneaux = await query;
  
  return filtrerEtFormaterRendezVous(creneaux, utilisateurId, typeUtilisateur, 'futur');
}

async function getRendezVousPassesData(utilisateurId, typeUtilisateur) {
  const maintenant = new Date();
  
  let query = Creneau.find({ date: { $lt: maintenant } })
    .populate({
      path: 'agenda',
      populate: {
        path: 'medecin',
        select: 'nom prenom email telephone specialite'
      }
    })
    .populate({
      path: 'timeSlots.patientId',
      select: 'nom prenom email telephone'
    })
    .sort({ date: -1, 'timeSlots.time': -1 });

  const creneaux = await query;
  
  return filtrerEtFormaterRendezVous(creneaux, utilisateurId, typeUtilisateur, 'passe');
}

// Fonction utilitaire pour filtrer et formater
function filtrerEtFormaterRendezVous(creneaux, utilisateurId, typeUtilisateur, type) {
  let creneauxFiltres = creneaux;

  // Filtre par médecin
  if (utilisateurId && typeUtilisateur === 'medecin') {
    creneauxFiltres = creneaux.filter(creneau => 
      creneau.agenda && 
      creneau.agenda.medecin && 
      creneau.agenda.medecin._id.toString() === utilisateurId
    );
  }

  // Filtre par patient
  if (utilisateurId && typeUtilisateur === 'patient') {
    creneauxFiltres = creneaux.filter(creneau =>
      creneau.timeSlots.some(ts => 
        (ts.patientId && ts.patientId._id.toString() === utilisateurId) ||
        (ts.annulePar && ts.annulePar.id === utilisateurId && ts.annulePar.type === 'patient')
      )
    );
  }

  // Formatage final
  return creneauxFiltres.map(creneau => {
    const creneauWithISO = ajouterDateHeureISO(creneau);
    
    creneauWithISO.timeSlots = creneauWithISO.timeSlots.filter(ts => {
      let garde = false;
      
      if (type === 'futur') {
        garde = ts.status === 'reserve';
      } else if (type === 'passe') {
        garde = ts.status === 'reserve' || (ts.status === 'disponible' && ts.annulePar);
      }
      
      // Filtre supplémentaire par patient
      if (utilisateurId && typeUtilisateur === 'patient') {
        garde = garde && (
          (ts.patientId && ts.patientId._id.toString() === utilisateurId) ||
          (ts.annulePar && ts.annulePar.id === utilisateurId && ts.annulePar.type === 'patient')
        );
      }
      
      return garde;
    });

    return creneauWithISO;
  }).filter(creneau => creneau.timeSlots.length > 0);
}