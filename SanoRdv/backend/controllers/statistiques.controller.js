import RendezVous from '../models/rendezvous.model.js';
import dayjs from 'dayjs';
import { generateCsv } from '../services/csv.service.js';
import { generatePdf } from '../services/pdf.service.js';
import { sendWeeklyReportEmail } from '../services/email.service.js';

export const getStatistiquesHebdomadaires = async (req, res) => {
  try {
    const { medecinId, patientId } = req.query;

    const start = dayjs().startOf('week').toDate();
    const end = dayjs().endOf('week').toDate();

    const filters = { createdAt: { $gte: start, $lte: end } };
    if (medecinId) filters.medecin = medecinId;
    if (patientId) filters.patient = patientId;

    const stats = await RendezVous.aggregate([
      { $match: filters },
      {
        $group: {
          _id: { date: '$date', status: '$status' },
          total: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          rendezvous: {
            $push: {
              status: '$_id.status',
              count: '$total'
            }
          },
          totalParJour: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportCsv = async (req, res) => {
  const buffer = await generateCsv(req.query);
  res.setHeader('Content-Disposition', 'attachment; filename="rapport.csv"');
  res.setHeader('Content-Type', 'text/csv');
  res.send(buffer);
};

export const exportPdf = async (req, res) => {
  const buffer = await generatePdf(req.query);
  res.setHeader('Content-Disposition', 'attachment; filename="rapport.pdf"');
  res.setHeader('Content-Type', 'application/pdf');
  res.send(buffer);
};
