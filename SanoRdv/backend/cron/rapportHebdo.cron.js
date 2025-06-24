import cron from 'node-cron';
import { sendWeeklyReportEmail } from '../services/email.service.js';

export const initRapportHebdoJob = () => {
  cron.schedule('0 8 * * 1', async () => {
    console.log('Génération et envoi automatique du rapport hebdo...');
    await sendWeeklyReportEmail();
  });
};
