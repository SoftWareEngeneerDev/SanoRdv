import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Vérification des variables d'environnement nécessaires
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM_NAME', 'MAIL_FROM_ADDRESS', 'FRONTEND_URL'];
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
  debug: true,  // active le debug
  logger: true, // log dans la console
});

// Vérification de la connexion SMTP au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// Fonction pour envoyer l'email d'activation
export const sendActivationEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/activate/${token}`;
  
  try {
    console.log(`Attempting to send activation email to: ${to}`);
    
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: 'Activation de compte',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Activation de votre compte</h2>
          <p>Bonjour,</p>
          <p>Merci de vous être inscrit sur notre plateforme. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Activer mon compte
            </a>
          </p>
          <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666;">${url}</p>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe SanoRdv</p>
        </div>
      `
    });
    
    console.log('Email activation envoyé avec succès:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur détaillée dans sendActivationEmail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};

// Fonction pour envoyer l'email de réinitialisation de mot de passe
export const sendResetPasswordEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  try {
    console.log(`Attempting to send password reset email to: ${to}`);
    
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: 'Réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Pour procéder, veuillez cliquer sur le lien ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #666;">${url}</p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe SanoRdv</p>
        </div>
      `
    });
    
    console.log('Email réinitialisation envoyé avec succès:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur détaillée dans sendResetPasswordEmail:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
};
