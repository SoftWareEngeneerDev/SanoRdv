import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Vérification des variables d'environnement nécessaires
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM_NAME',
  'MAIL_FROM_ADDRESS',
  'FRONTEND_URL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('SMTP Configuration:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('Secure:', process.env.SMTP_SECURE === 'true');
console.log('User:', process.env.SMTP_USER);

// Création du transporteur Nodemailer avec debug et logger activés
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Permet de ne pas vérifier les certificats (utile en développement)
  },
  debug: true,  // Active les logs pour afficher les échanges avec le serveur SMTP
  logger: true, // Active également le log des informations pour plus de visibilité
});

// Vérification de la connexion SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// Fonction pour envoyer l'email d'activation avec INE
export const sendINEEmail = async (to, ine, prenom, nom) => {
  try {
    console.log(`Tentative d'envoi de mail avec INE à : ${to}`);
    
    const loginUrl = `https://sanordv-wu78.onrender.com/auth/login`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue sur notre plateforme, ${prenom} ${nom} !</h2>
        <p>Votre inscription a bien été prise en compte.</p>
        <p>Voici votre Identifiant de connexion (ID) :</p>
        <p style="font-size: 1.5em; font-weight: bold; text-align: center; margin: 20px 0;">${ine}</p>
        <p>Merci de conserver précieusement cet identifiant, il vous sera utile pour vos démarches.</p>
        <p style="text-align: center; margin-top: 30px;">
          <a href="${loginUrl}" style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
            🔐 Se connecter
          </a>
        </p>
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        <p>Cordialement,<br>L'équipe SanoRdv</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: 'Votre Identifiant de Prise de rendez-vous médicale (INE)',
      html: htmlContent
    });

    console.log('Email INE envoyé avec succès:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur dans sendINEEmail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};

// Fonction pour envoyer l'email de réinitialisation de mot de passe
export const sendResetPasswordEmail = async (to, resetcode) => {
  try {
    console.log(`Tentative d'envoi du code de réinitialisation à : ${to}`);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de réinitialisation à 6 chiffres :</p>
        <p style="font-size: 24px; font-weight: bold; text-align: center; margin: 30px 0;">${resetcode}</p>
        <p>Ce code expirera dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe SanoRdv</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: 'Réinitialisation de mot de passe',
      html: htmlContent
    });

    console.log('Email de réinitialisation envoyé avec succès:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur dans sendResetPasswordEmail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};