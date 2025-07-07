import nodemailer from 'nodemailer';

// Création du transporteur mail
const createTransporter = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback sur Ethereal pour test
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass',
    },
  });
};

// Template HTML pour l'email (ajout de numeroIdentification)
const createEmailTemplate = (email, password, username, numeroIdentification) => {
  const loginUrl = process.env.ADMIN_URL || 'http://localhost:3000/admin';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { background: #f8f9fa; padding: 20px; margin-top: 20px; }
    .credentials { background: white; border: 1px solid #ddd; padding: 15px; margin: 15px 0; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-top: 10px; }
    .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
    .btn-login {
      display: inline-block;
      padding: 12px 24px;
      margin-top: 20px;
      background-color: #28a745;
      color: #fff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }
    .btn-login:hover {
      background-color: #218838;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 SanoRdv - Vos identifiants de connexion</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${username},</h2>
      <p>Votre compte médecin a été créé avec succès. Voici vos identifiants :</p>
      <div class="credentials">
        <p><strong>Nom d'utilisateur :</strong> ${email}</p>
        <p><strong>Numéro d'identification :</strong> ${numeroIdentification}</p>
        <p><strong>Mot de passe temporaire :</strong> ${password}</p>
      </div>
      <div class="warning">
        <p><strong>⚠️ Important :</strong> Veuillez changer ce mot de passe dès votre première connexion pour sécuriser votre compte.</p>
      </div>
      <p style="text-align: center;">
        <a href="${loginUrl}" class="btn-login">🔐 Se connecter à votre compte</a>
      </p>
    </div>
    <div class="footer">
      <p>Cet email a été généré automatiquement. Si vous n'êtes pas à l'origine de cette création de compte, contactez immédiatement l'équipe technique.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Fonction d'envoi de l'email avec identifiants
export const sendMedecinCredentials = async (email, username, password, numeroIdentification) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.MAIL_FROM_NAME || 'SanoRdv'}" <${process.env.SMTP_FROM || 'noreply@sanordv.com'}>`,
      to: email,
      subject: '🔐 SanoRdv - Vos identifiants médecin',
      html: createEmailTemplate(email, password, username, numeroIdentification),
      text: `
SanoRdv - Vos identifiants médecin

Bonjour ${username},

Votre compte médecin a été créé avec succès.

Nom d'utilisateur : ${email}
Numéro d'identification : ${numeroIdentification}
Mot de passe temporaire : ${password}

⚠️ Veuillez changer ce mot de passe dès votre première connexion.

URL de connexion : ${process.env.ADMIN_URL || 'http://localhost:3000/api/auth/login'}
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
