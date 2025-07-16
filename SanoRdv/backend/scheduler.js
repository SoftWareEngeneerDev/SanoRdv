import cron from 'node-cron';
import { genererStatHebdo } from './services/statistiques.service.js';

// Lancer chaque lundi à 00:00
cron.schedule('0 0 * * 1', async () => {
  try {
    console.log("Début génération stats hebdo...");
    await genererStatHebdo(new Date());
    console.log("Stats hebdo générées avec succès.");
  } catch (error) {
    console.error("Erreur génération stats hebdo :", error);
  }
});
