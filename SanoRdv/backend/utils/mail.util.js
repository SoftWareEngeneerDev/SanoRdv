import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendActivationEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/activate/${token}`;
  try {
    const info = await transporter.sendMail({
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: 'Activation de compte',
      html: `<p>Bonjour,</p><p>Cliquez ici pour activer votre compte : <a href="${url}">${url}</a></p>`
    });
    console.log('Email activation envoyé:', info.response);
  } catch (error) {
    console.error('Erreur dans sendActivationEmail:', error);
    throw error; // remonte l'erreur au registre appelant
  }
};


export const sendResetPasswordEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
    to,
    subject: 'Réinitialisation de mot de passe',
    html: `<p>Bonjour,</p><p>Cliquez ici pour réinitialiser votre mot de passe : <a href="${url}">${url}</a></p>`
  });
};
// mail.util.js
export {
  sendActivationEmail,
  sendResetPasswordEmail
}
