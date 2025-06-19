import Medecin from '../models/medecin.model.js';
import { sanitizeInput } from '../utils/helpers.js';

export const rechercherMedecins = async (req, res) => {
  try {
    // Récupérer et nettoyer le paramètre de recherche
    let { query, limit = 50, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        message: 'Le paramètre de recherche est requis.' 
      });
    }

    query = sanitizeInput(query.toString().trim());
    if (!query) {
      return res.status(400).json({ 
        message: 'Le paramètre de recherche ne peut pas être vide.' 
      });
    }

    // DÉTECTION AUTOMATIQUE DU TYPE DE RECHERCHE
    const filtres = [];
    const typesDetectes = [];

    // 1. Détection ID médecin (commence par des lettres puis chiffres, ou format spécifique)
    if (/^[A-Z]{1,3}\d+$/i.test(query) || /^\d{4,}$/.test(query)) {
      filtres.push({ IDmedecin: new RegExp(query, 'i') });
      typesDetectes.push('ID médecin');
    }

    // 2. Détection spécialité (mots clés médicaux courants)
    const specialitesMedicales = [
      'cardiologue', 'cardiologie', 'dermatologue', 'dermatologie',
      'pediatre', 'pédiatre', 'pediatrie', 'pédiatrie',
      'gyneco', 'gynéco', 'gynecologie', 'gynécologie',
      'chirurgien', 'chirurgie', 'anesthesiste', 'anesthésiste',
      'radiologue', 'radiologie', 'neurologue', 'neurologie',
      'psychiatre', 'psychiatrie', 'ophtalmologue', 'ophtalmologie',
      'dentiste', 'orthodontiste', 'endocrinologue', 'endocrinologie',
      'rhumatologue', 'rhumatologie', 'urologue', 'urologie',
      'pneumologue', 'pneumologie', 'gastro', 'gastroenterologie',
      'orl', 'oto-rhino', 'oncologue', 'oncologie',
      'generaliste', 'généraliste', 'medecin', 'médecin'
    ];
    
    const queryLower = query.toLowerCase();
    const isSpecialite = specialitesMedicales.some(spec => 
      queryLower.includes(spec) || spec.includes(queryLower)
    );
    
    if (isSpecialite) {
      filtres.push({ specialite: new RegExp(query, 'i') });
      typesDetectes.push('Spécialité');
    }

    // 3. Détection recherche par une seule lettre
    if (query.length === 1 && /[A-Za-z]/.test(query)) {
      filtres.push({ 
        $or: [
          { nom: new RegExp(`^${query}`, 'i') },
          { prenom: new RegExp(`^${query}`, 'i') }
        ]
      });
      typesDetectes.push('Première lettre');
    }
    
    // 4. Détection nom/prénom (2+ caractères, contient que des lettres, espaces, tirets)
    else if (/^[A-Za-zÀ-ÿ\s\-']{2,}$/.test(query)) {
      // Séparer les mots pour détecter prénom + nom
      const mots = query.split(/\s+/).filter(mot => mot.length > 0);
      
      if (mots.length >= 2) {
        // Recherche prénom + nom ou nom + prénom
        filtres.push({
          $or: [
            // Prénom puis nom
            {
              $and: [
                { prenom: new RegExp(mots[0], 'i') },
                { nom: new RegExp(mots[1], 'i') }
              ]
            },
            // Nom puis prénom
            {
              $and: [
                { nom: new RegExp(mots[0], 'i') },
                { prenom: new RegExp(mots[1], 'i') }
              ]
            }
          ]
        });
        typesDetectes.push('Prénom + Nom');
      } else {
        // Un seul mot - chercher dans nom ET prénom
        filtres.push({
          $or: [
            { nom: new RegExp(query, 'i') },
            { prenom: new RegExp(query, 'i') }
          ]
        });
        typesDetectes.push('Nom ou Prénom');
      }
    }

    // 5. Si aucun type spécifique détecté, recherche générale
    if (filtres.length === 0) {
      filtres.push({
        $or: [
          { nom: new RegExp(query, 'i') },
          { prenom: new RegExp(query, 'i') },
          { IDmedecin: new RegExp(query, 'i') },
          { specialite: new RegExp(query, 'i') }
        ]
      });
      typesDetectes.push('Recherche générale');
    }

    // Combiner les filtres avec OR si plusieurs types détectés
    const filtreGeneral = filtres.length === 1 ? filtres[0] : { $or: filtres };

    // Paramètres de pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    // Exécuter la recherche
    const [medecins, totalCount] = await Promise.all([
      Medecin.find(filtreGeneral)
        .limit(limitNum)
        .skip(skip)
        .sort({ nom: 1, prenom: 1 })
        .lean(),
      Medecin.countDocuments(filtreGeneral)
    ]);

    if (medecins.length === 0) {
      return res.status(404).json({ 
        message: 'Aucun médecin trouvé pour cette recherche.',
        recherche: query,
        types_detectes: typesDetectes,
        suggestions: [
          'Vérifiez l\'orthographe',
          'Essayez avec moins de caractères',
          'Utilisez juste le nom ou le prénom',
          'Essayez une spécialité (ex: cardiologue, dentiste)'
        ]
      });
    }

    // Calculs de pagination
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      message: `${medecins.length} médecin(s) trouvé(s) sur ${totalCount} total(s).`,
      recherche: query,
      types_detectes: typesDetectes,
      filtrage_automatique: true,
      pagination: {
        page_actuelle: pageNum,
        total_pages: totalPages,
        total_resultats: totalCount,
        resultats_par_page: limitNum,
        page_suivante: pageNum < totalPages,
        page_precedente: pageNum > 1
      },
      medecins: medecins.map(m => ({
        id: m._id,
        nom: m.nom,
        prenom: m.prenom,
        IDmedecin: m.IDmedecin,
        specialite: m.specialite,
        // Score de pertinence pour tri intelligent
        score_pertinence: calculerScorePertinence(m, query, typesDetectes)
      })).sort((a, b) => b.score_pertinence - a.score_pertinence) // Tri par pertinence
    });

  } catch (error) {
    console.error('Erreur recherche médecins:', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la recherche',
      erreur: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

// Fonction pour calculer un score de pertinence
const calculerScorePertinence = (medecin, query, typesDetectes) => {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Score basé sur les correspondances exactes
  if (medecin.nom?.toLowerCase().startsWith(queryLower)) score += 10;
  if (medecin.prenom?.toLowerCase().startsWith(queryLower)) score += 10;
  if (medecin.specialite?.toLowerCase().includes(queryLower)) score += 8;
  if (medecin.IDmedecin?.toLowerCase().includes(queryLower)) score += 15;
  
  // Score basé sur les correspondances partielles
  if (medecin.nom?.toLowerCase().includes(queryLower)) score += 5;
  if (medecin.prenom?.toLowerCase().includes(queryLower)) score += 5;
  
  // Bonus selon le type détecté
  if (typesDetectes.includes('ID médecin') && 
      medecin.IDmedecin?.toLowerCase().includes(queryLower)) score += 20;
  
  return score;
};

// Fonction utilitaire pour obtenir des suggestions de recherche
export const obtenirSuggestions = async (req, res) => {
  try {
    const suggestions = await Promise.all([
      // Top 10 spécialités
      Medecin.aggregate([
        { $group: { _id: '$specialite', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      // Premières lettres de noms populaires
      Medecin.aggregate([
        { $group: { _id: { $substr: ['$nom', 0, 1] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 26 }
      ])
    ]);

    return res.status(200).json({
      specialites_populaires: suggestions[0].map(s => s._id),
      lettres_populaires: suggestions[1].map(s => s._id).sort()
    });
  } catch (error) {
    console.error('Erreur suggestions:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};