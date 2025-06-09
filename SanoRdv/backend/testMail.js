import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

async function testSend() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection successful');

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: process.env.SMTP_USER,
      subject: 'Test envoi email',
      text: 'Ceci est un email test depuis Node.js avec Nodemailer',
    });

    console.log('Email envoyé:', info.messageId);
  } catch (error) {
    console.error('Erreur SMTP:', error);
  }
}

testSend();
