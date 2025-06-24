import { Parser } from 'json2csv';
import RendezVous from '../models/rendezvous.model.js';
import dayjs from 'dayjs';

export const generateCsv = async ({ medecinId, patientId }) => {
  const start = dayjs().startOf('week').toDate();
  const end = dayjs().endOf('week').toDate();

  
  const filters = {
    createdAt: { $gte: start, $lte: end }
  };
  if (medecinId) filters.medecin = medecinId;
  if (patientId) filters.patient = patientId;

  
  const data = await RendezVous.find(filters)
    .populate('patient', 'nom prenom')
    .populate('medecin', 'nom prenom')
    .lean();

  
  const fields = [
    { label: 'Date', value: row => dayjs(row.date).format('YYYY-MM-DD') },
    { label: 'Heure', value: 'time' },
    { label: 'Statut', value: 'status' },
    { label: 'Patient', value: row => `${row.patient?.prenom || ''} ${row.patient?.nom || ''}`.trim() },
    { label: 'Médecin', value: row => `${row.medecin?.prenom || ''} ${row.medecin?.nom || ''}`.trim() }
  ];

  
  const parser = new Parser({ fields });
  return parser.parse(data);
};
