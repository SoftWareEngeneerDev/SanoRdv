import nodemailer from 'nodemailer';

const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Application de gestion de rdv médical';
const ADMIN_URL = 'https://sanordv-wu78.onrender.com/auth/login';

/**
 * Crée un transporteur nodemailer selon les variables d'environnement (Gmail, SMTP ou Ethereal)
 * @returns {import('nodemailer').Transporter}
 */
const createTransport = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Permet de désactiver les vérifications de certificat (utile pour le dev)
      },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // Permet de désactiver les vérifications de certificat (utile pour le dev)
      },
    });
  }

  // Transporteur de test (Ethereal)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass',
    },
    tls: {
      rejectUnauthorized: false // Permet de désactiver les vérifications de certificat (utile pour le dev)
    },
  });
};

/**
 * Génère le contenu HTML de l'email contenant les identifiants
 * @param {string} prenom - Prénom de l'admin
 * @param {string} nom - Nom de l'admin
 * @param {string} IDadmin - Identifiant admin
 * @param {string} motDePasse - Mot de passe
 * @param {string} email - Email de l'admin
 * @returns {string} Contenu HTML de l'email
 */
const createEmailTemplate = (prenom, nom, IDadmin, motDePasse, email) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { background: #f8f9fa; padding: 20px; margin: 20px 0; }
    .credentials { background: white; padding: 15px; border: 1px solid #ddd; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-top: 15px; }
    .btn {
      display: inline-block;
      background-color: #007bff;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 5px;
      box-shadow: 0 4px 8px rgba(0,123,255,0.2);
      transition: background-color 0.3s ease;
    }
    .btn:hover { background-color: #0056b3; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 SanoRdv - Identifiants Administrateur</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${prenom} ${nom},</h2>
      <p>Votre compte a été créé avec succès. Voici vos identifiants :</p>
      <div class="credentials">
        <p><strong>Nom d'utilisateur :</strong> <code>${IDadmin} ou ${email}</code></p>
        <p><strong>Mot de passe :</strong> <code>${motDePasse}</code></p>
      </div>
      <div class="warning">
        <h4>⚠️ Important :</h4>
        <ul>
          <li>Changez ce mot de passe dès votre première connexion.</li>
          <li>Ne partagez jamais ces identifiants.</li>
          <li>Utilisez un gestionnaire de mots de passe.</li>
          <li>Activez l'authentification à deux facteurs si disponible.</li>
        </ul>
      </div>
      <p style="text-align: center; color: green;">
        <a href="${ADMIN_URL}" class="btn" target="_blank" rel="noopener noreferrer">Se connecter</a>
      </p>
    </div>
    <div class="footer">
      <p>Cet email a été généré automatiquement par ${MAIL_FROM_NAME}.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, contactez l'équipe technique.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Envoie un email contenant les identifiants administrateur
 * @param {string} adminEmail - Email du destinataire
 * @param {string} prenom - Prénom de l'admin
 * @param {string} nom - Nom de l'admin
 * @param {string} IDadmin - Identifiant admin
 * @param {string} motDePasse - Mot de passe
 * @returns {Promise<{success: boolean, messageId?: string, message: string}>}
 */
export const sendAdminCredentials = async (adminEmail, prenom, nom, IDadmin, motDePasse) => {
  try {
    const transporter = createTransport();

    const mailOptions = {
      from: process.env.SMTP_FROM || `"${MAIL_FROM_NAME}" <noreply@sanoRdv.com>`,
      to: adminEmail,
      subject: '🔐 SanoRdv - Identifiants Administrateur',
      html: createEmailTemplate(prenom, nom, IDadmin, motDePasse, adminEmail),
      text: `
SanoRdv - Identifiants Administrateur

Bonjour ${prenom} ${nom},

Votre compte administrateur a été créé avec succès. Voici vos identifiants :

Nom d'utilisateur : ${IDadmin} ou ${adminEmail}
Mot de passe : ${motDePasse}

⚠️ Important :
- Changez ce mot de passe dès votre première connexion
- Ne partagez jamais ces identifiants
- Utilisez un gestionnaire de mots de passe
- Activez l'authentification à deux facteurs si disponible

URL de connexion : ${ADMIN_URL}
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email envoyé avec succès',
    };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error(`Erreur envoi email: ${error.message}`);
  }
};

/**
 * Vérifie si la configuration email est valide
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const testEmailConfig = async () => {
  try {
    const transporter = createTransport();
    await transporter.verify();
    return { success: true, message: 'Configuration email valide' };
  } catch (error) {
    return { success: false, message: `Configuration email invalide: ${error.message}` };
  }
};
