import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

// Importation des routes
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import adminRoutes from './routes/admin.routes.js';
import specialiteRoutes from './routes/specialite.routes.js';
import systemeDeRechercheRoutes from './routes/SystemeDeRecherche.routes.js';
import rendezvousRoutes from './routes/rendezvous.routes.js';
import creneauRouter from './routes/creneau.routes.js';
import agendaRouter from './routes/agenda.routes.js';
import medecinRouter from './routes/medecin.routes.js';  // corrigé : medecinRouter au lieu de medecinRoutes

// Configuration des variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Base de données connectée avec succès');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1); // Arrêt de l'application en cas d'erreur
  }

  // Configuration CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  }));

  // Middleware pour parser le JSON et les données url-encoded
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // IMPORTANT : Utiliser des préfixes de routes distincts pour éviter les conflits
  app.use('/api/auth', userRoutes);         // gestion des utilisateurs (authentification)
  app.use('/api/patients', patientRoutes);  // gestion des patients
  app.use('/api/medecins', medecinRouter);  // gestion des médecins
  app.use('/api/admins', adminRoutes);       // gestion des admins
  app.use('/api/specialites', specialiteRoutes);
  app.use('/api/recherche', systemeDeRechercheRoutes);
  app.use('/api/rendezvous', rendezvousRoutes);
  app.use('/api/creneaux', creneauRouter);
  app.use('/api/agenda', agendaRouter);

  // Gestion des erreurs 404 (Route non trouvée)
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé',
    });
  });

  // Démarrage du serveur
  const server = app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });

  // Gestion propre de l'arrêt du processus
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Processus terminé');
      process.exit(0);
    });
  });
})();
