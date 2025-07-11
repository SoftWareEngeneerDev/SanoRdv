import Rendezvous from '../models/rendezvous.model.js';

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export const getStatsHebdo = async (req, res) => {
  try {
    const today = new Date();
    const monday = getMonday(today);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const stats = await Rendezvous.aggregate([
      // Récupère les RDV confirmés
      {
        $match: { statut: 'confirmé' }
      },
      // Jointure avec la collection creneaux
      {
        $lookup: {
          from: 'creneaus', // attention au nom de la collection dans MongoDB
          localField: 'creneau',
          foreignField: '_id',
          as: 'creneauDetails'
        }
      },
      // Déstructure le tableau
      { $unwind: "$creneauDetails" },
      // Filtrer par date de creneau
      {
        $match: {
          "creneauDetails.date": { $gte: monday, $lte: sunday }
        }
      },
      // Grouper par date (formatée)
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$creneauDetails.date" } },
          count: { $sum: 1 }
        }
      }
    ]);

    // Générer les 7 jours de la semaine
    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      const dayStr = day.toISOString().slice(0, 10);
      const dayStat = stats.find(s => s._id === dayStr);
      result.push({
        date: dayStr,
        count: dayStat ? dayStat.count : 0
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
