import nodemailer from 'nodemailer';
import { generatePdf } from './pdf.service.js';
import dotenv from 'dotenv';

dotenv.config(); // Charge les variables d’environnement depuis .env

export const sendWeeklyReportEmail = async () => {
  try {
    const pdf = await generatePdf({}); // Assure-toi que cette fonction retourne bien un buffer

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // ex. : tonmail@gmail.com
        pass: process.env.EMAIL_PASS  // ton mot de passe ou app password Gmail
      }
    });

    await transporter.sendMail({
      from: `"Docteur RDV" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      subject: 'Rapport hebdomadaire des rendez-vous',
      text: 'Veuillez trouver ci-joint le rapport PDF.',
      attachments: [
        {
          filename: 'rapport.pdf',
          content: pdf
        }
      ]
    });

    console.log('✔ Rapport envoyé avec succès à l’admin.');
  } catch (err) {
    console.error('❌ Échec de l’envoi du rapport hebdomadaire :', err.message);
  }
};
