import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import { generateIna } from '../utils/generateIna.js';
import { blacklistToken } from '../middlewares/auth.middleware.js';
import { sendActivationEmail, sendResetPasswordEmail } from '../utils/mail.util.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete';

// ✅ Inscription
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });

  try {
    const {
      nom, prenom, email, telephone,
      motDePasse, confirmationMotDePasse,
      dateNaissance, sex
    } = req.body;

    if (motDePasse !== confirmationMotDePasse)
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    let ID, IDExists = true;
    while (IDExists) {
      ID = generateIna();
      if (!await User.findOne({ ID })) IDExists = false;
    }

    const newUser = new User({
      nom, prenom, email, telephone,
      motDePasse: hashedPassword,
      dateNaissance, sex, ID,
      isActive: false
    });

    // Sauvegarde l'utilisateur d'abord
    await newUser.save();

    // Génère le token avec l'ID créé
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    // Essaye d'envoyer le mail, si erreur supprime l'utilisateur
    try {
      await sendActivationEmail(email, token);
    } catch (mailError) {
      await User.deleteOne({ _id: newUser._id });
      console.error('Erreur lors de l’envoi de l’email d’activation:', mailError);
      return res.status(500).json({ message: "Impossible d'envoyer l'email d'activation. Inscription annulée." });
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès. Vérifiez votre email pour activer votre compte.',
      userId: newUser._id,
      ID
    });

  } catch (error) {
    console.error('Erreur lors de l’inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// ✅ Activation
export const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    user.isActive = true;
    await user.save();

    res.status(200).json({ message: 'Compte activé avec succès' });
  } catch (error) {
    res.status(400).json({ message: 'Lien invalide ou expiré' });
  }
};

// ✅ Connexion
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ erreurs: errors.array() });

  try {
    const { UserID, motDePasse } = req.body;

    const user = await User.findOne({
      $or: [{ email: UserID }, { ID: UserID }]
    });

    if (!user || !(await bcrypt.compare(motDePasse, user.motDePasse)))
      return res.status(400).json({ message: "Identifiant ou mot de passe incorrect" });

    if (!user.isActive)
      return res.status(403).json({ message: 'Votre compte n’est pas encore activé.' });

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Connexion réussie', token });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Déconnexion
export const logout = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Aucun token fourni' });

  const token = authHeader.split(' ')[1];

  try {
    blacklistToken(token);
    res.status(200).json({ message: 'Déconnexion réussie. Token invalidé.' });
  } catch (error) {
    console.error('Erreur blacklist token:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Mot de passe oublié
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpire = Date.now() + 3600000; // 1h
  await user.save();

  await sendResetPasswordEmail(user.email, resetToken);

  res.status(200).json({ message: "Lien de réinitialisation envoyé à votre email." });
};

// ✅ Réinitialisation mot de passe
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { motDePasse, confirmationMotDePasse } = req.body;

  try {
    if (motDePasse !== confirmationMotDePasse)
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    user.motDePasse = await bcrypt.hash(motDePasse, 10);
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error('Erreur reset password:', error);
    res.status(400).json({ message: "Lien invalide ou expiré" });
  }
};
