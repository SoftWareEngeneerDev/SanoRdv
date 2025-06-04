import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import { generateIna } from '../utils/generateIna.js'; 

// Fonction d'inscription
export const register = async (req, res) => {
  // Vérification des erreurs de validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ erreurs: errors.array() });
  }

  try {
    const { nom, prenom, email, telephone, motDePasse, dateNaissance } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(motDePasse, saltRounds);

    // Générer un ina unique
    let ina;
    let inaExists = true;
    while (inaExists) {
      ina = generateIna();
      // Vérifier que l'ina n'existe pas déjà dans la base
      const existingIna = await User.findOne({ ina });
      if (!existingIna) inaExists = false;
    }

    // Créer le nouvel utilisateur
    const newUser = new User({
      nom,
      prenom,
      email,
      telephone,
      motDePasse: hashedPassword,
      dateNaissance,
      ina,
    });

    // Sauvegarder en base de données
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser._id, ina });
  } catch (error) {
    console.error('Erreur lors de l’inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
