import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import User from '../models/user.model.js';

const router = express.Router();

// Route d'inscription avec validation
router.post(
  '/register',
  [
    body('nom').notEmpty().withMessage('Le nom est obligatoire'),
    body('prenom').notEmpty().withMessage('Le prénom est obligatoire'),
    body('email').isEmail().withMessage('Email invalide'),
    body('telephone').notEmpty().withMessage('Le téléphone est obligatoire'),
    body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('dateNaissance').optional().isISO8601().toDate().withMessage('Date de naissance invalide'),
  ],
  async (req, res) => {
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

      // Créer et sauvegarder le nouvel utilisateur
      const newUser = new User({
        nom,
        prenom,
        email,
        telephone,
        motDePasse: hashedPassword,
        dateNaissance,
      });

      await newUser.save();

      res.status(201).json({ message: 'Utilisateur créé avec succès', userId: newUser._id });
    } catch (error) {
      console.error('Erreur lors de l’inscription:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
);

export default router;
