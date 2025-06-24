import Admin from '../models/admin.model.js';
import Patient from '../models/patient.model.js';
import Medecin from '../models/medecin.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const loginAdmin = async (req, res) => {
  const { email, motDePasse } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin non trouvé.' });

    const isMatch = await admin.comparePassword(motDePasse);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect.' });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ message: 'Connexion réussie', admin, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const creerMedecin = async (req, res) => {
  try {
    const nouveau = new Medecin(req.body);
    const saved = await nouveau.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const creerPatient = async (req, res) => {
  try {
    const nouveau = new Patient(req.body);
    const saved = await nouveau.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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

export const modifierMedecin = async (req, res) => {
  try {
    const updated = await Medecin.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const modifierPatient = async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const supprimerMedecin = async (req, res) => {
  try {
    await Medecin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Médecin supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const supprimerPatient = async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
