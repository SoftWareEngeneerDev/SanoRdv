import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import { generateIna } from '../utils/generateIna.js';
import jwt from 'jsonwebtoken';
import { blacklistToken } from '../middlewares/auth.middleware.js'

const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete'; 

// ✅ Fonction d'inscription
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erreurs: errors.array() });
  }

  try {
    const { nom, prenom, email, telephone, motDePasse, dateNaissance } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

    // Générer un INE (ina) unique
    let ID;
    let IDExists = true;
    while (IDExists) {
      ID = generateIna();
      const existingIna = await User.findOne({ ID });
      if (!existingIna) IDExists = false;
    }

    const newUser = new User({
      nom,
      prenom,
      email,
      telephone,
      motDePasse: hashedPassword,
      dateNaissance,
      ID,
    });

    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser._id, ID });
  } catch (error) {
    console.error('Erreur lors de l’inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Fonction de connexion
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erreurs: errors.array() });
  }

  try {
    const { UserID, motDePasse } = req.body; // Assure-toi que c'est 'motDePasse' dans Postman/Frontend

    // Trouver l'utilisateur par email ou ID
    const user = await User.findOne({
      $or: [{ email: UserID }, { ID: UserID }]
    });

    if (!user) {
      return res.status(400).json({ message: "Identifiant ou mot de passe incorrect" });
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: "Identifiant ou mot de passe incorrect" });
    }

    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Fonction de déconnexion
export const logout = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Aucun token fourni' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Blacklister le token — cette fonction doit gérer le stockage du token blacklisté
    blacklistToken(token);

    return res.status(200).json({ message: 'Déconnexion réussie. Le token est invalidé.' });
  } catch (error) {
    console.error('Erreur lors du blacklistage du token:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la déconnexion.' });
  }
};

