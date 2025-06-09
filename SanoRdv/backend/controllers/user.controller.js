import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/user.model.js';
import { generateIna } from '../utils/generateIna.js';
import { blacklistToken } from '../middlewares/auth.middleware.js';
import { sendINEEmail, sendResetPasswordEmail } from '../utils/mail.util.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ta_clef_secrete';

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
      isActive: true // Activation automatique car pas besoin de lien
    });

    await newUser.save();

    try {
      await sendINEEmail(email, ID, prenom, nom);
    } catch (mailError) {
      console.error('Erreur email INE:', mailError);
      // On n’annule plus l’inscription en cas d’échec email
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès. Vérifiez votre email pour votre INE.',
      userId: newUser._id,
      ID
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur' });
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
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ✅ Déconnexion
export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Aucun token fourni' });

  const token = authHeader.split(' ')[1];

  try {
    await blacklistToken(token);
    res.status(200).json({ message: 'Déconnexion réussie. Token invalidé.' });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ✅ Étape 1 : Demander un code de réinitialisation
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Génération d'un code de réinitialisation à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Mise à jour du code et de la date d'expiration (1 heure)
    user.resetCode = resetCode;
    user.resetCodeExpire = Date.now() + 60 * 60 * 1000;
    console.log("resetCode généré :", resetCode);
   console.log("resetCodeExpire :", new Date(user.resetCodeExpire).toISOString());


    await user.save();

    // Envoi de l'email avec le code de réinitialisation
    await sendResetPasswordEmail(user.email, resetCode);

    return res.status(200).json({ message: "Code de réinitialisation envoyé.", resetCode });
  } catch (error) {
    console.error("Erreur forgotPassword:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ✅ Étape 2 : Vérifier le code envoyé par email
export const verifyResetCode = async (req, res) => {
  let { resetCode } = req.body;

  try {
    if (!resetCode || typeof resetCode !== 'string' || resetCode.trim() === '') {
      return res.status(400).json({ message: "Le code de réinitialisation est requis." });
    }

    resetCode = resetCode.trim();

    const user = await User.findOne({
      resetCode,
      resetCodeExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Code incorrect ou expiré." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      message: "Code validé. Vous pouvez réinitialiser votre mot de passe.",
      token
    });
  } catch (error) {
    console.error("Erreur verifyResetCode:", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Étape 3 : Réinitialiser le mot de passe
export const resetPassword = async (req, res) => {
  const { motDePasse, confirmationMotDePasse } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (motDePasse !== confirmationMotDePasse) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    user.motDePasse = await bcrypt.hash(motDePasse, 10);
    user.resetCode = undefined;
    user.resetCodeExpire = undefined;

    await user.save();

    return res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error("Erreur resetPassword:", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};
