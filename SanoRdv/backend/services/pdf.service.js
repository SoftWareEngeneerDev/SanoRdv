import PDFDocument from 'pdfkit';
import RendezVous from '../models/rendezvous.model.js';
import dayjs from 'dayjs';

export const generatePdf = async ({ medecinId, patientId }) => {
  const start = dayjs().startOf('week').toDate();
  const end = dayjs().endOf('week').toDate();

  const filters = { createdAt: { $gte: start, $lte: end } };
  if (medecinId) filters.medecin = medecinId;
  if (patientId) filters.patient = patientId;

  const data = await RendezVous.find(filters)
    .populate('patient', 'nom prenom')
    .populate('medecin', 'nom prenom')
    .lean();

  // Création du document PDF
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  // Titre
  doc.fontSize(16).text('Rapport Hebdomadaire des Rendez-vous', {
    align: 'center',
    underline: true
  });

  doc.moveDown();

  if (data.length === 0) {
    doc.fontSize(12).text('Aucun rendez-vous trouvé pour cette semaine.');
  } else {
    data.forEach(rdv => {
      doc
        .fontSize(11)
        .text(
          `📅 Date : ${dayjs(rdv.date).format('DD/MM/YYYY')}  🕐 Heure : ${rdv.time}  ✅ Statut : ${rdv.status.toUpperCase()}`
        );
      doc.text(
        `👤 Patient : ${rdv.patient?.prenom || 'N/A'} ${rdv.patient?.nom || ''}    👨‍⚕️ Médecin : ${rdv.medecin?.prenom || 'N/A'} ${rdv.medecin?.nom || ''}`
      );
      doc.moveDown();
    });
  }

  doc.end();

  // Retourne une promesse qui résout un buffer PDF prêt à être envoyé ou téléchargé
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
  });
};
