import express from 'express';
import { getStatsHebdo } from '../controllers/statistiques.controller.js';

const router = express.Router();

router.get('/hebdomadaires', async (req, res) => {
  try {
    const stats = await Statistique.find({ type: 'hebdomadaire' }).sort({ date: -1 }).limit(10);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
