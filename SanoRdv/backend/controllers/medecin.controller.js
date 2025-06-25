import Admin from '../models/admin.model.js';
import Patient from '../models/patient.model.js';
import Medecin from '../models/medecin.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const changerStatutMedecin = async (req, res) => {
  try {
    const medecin = await Medecin.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    res.json(medecin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const changerStatutPatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
