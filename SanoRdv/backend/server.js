import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

<<<<<<< HEAD
=======
// Importation des routes
>>>>>>> origin/master
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import adminRoutes from './routes/admin.routes.js';
import specialiteRoutes from './routes/specialite.routes.js';
import systemeDeRechercheRoutes from './routes/SystemeDeRecherche.routes.js';
import rendezvousRoutes from './routes/rendezvous.routes.js';
import creneauRouter from './routes/creneau.routes.js';
<<<<<<< HEAD
import statistiquesRoutes from './routes/statistiques.routes.js';




=======
import agendaRouter from './routes/agenda.routes.js';
import medecinRouter from './routes/medecin.routes.js'; // corrigé : medecinRouter au lieu de medecinRoutes
import notificationRouter from './routes/notification.routes.js';

// Configuration des variables d'environnement
>>>>>>> origin/master
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Connexion à la base de données
    await connectDB();
<<<<<<< HEAD
    console.log('✅ Base de données connectée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }

=======
    console.log('Base de données connectée avec succès');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1); // Arrêt de l'application en cas d'erreur
  }

  // Middleware CORS
>>>>>>> origin/master
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  }));

<<<<<<< HEAD
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // IMPORTANT : Utilise des routes distinctes pour éviter les conflits
  app.use('/api/auth', userRoutes);        // ex: gestion des utilisateurs
  app.use('/api/auth', patientRoutes);  // gestion patients
  app.use('/api/auth', adminRoutes);      // gestion admins
  app.use('/api/specialites', specialiteRoutes);
  app.use('/api/recherche', systemeDeRechercheRoutes);
  app.use('/api/rendezvous', rendezvousRoutes);
  app.use('/api/creneau', creneauRouter);
  app.use('/api/statistiques', statistiquesRoutes);

  
  // Gestion 404
=======
  // Middleware pour parser le JSON et les données url-encoded
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Définition des routes
  app.use('/api/auth', userRoutes);        // Routes pour les utilisateurs
  app.use('/api/patients', patientRoutes); // Routes pour les patients
  app.use('/api/medecins', medecinRouter); // Routes pour les médecins
  app.use('/api/admins', adminRoutes);     // Routes pour les administrateurs
  app.use('/api/specialites', specialiteRoutes); // Routes pour les spécialités
  app.use('/api/recherche', systemeDeRechercheRoutes); // Système de recherche
  app.use('/api/rendezvous', rendezvousRoutes);  // Routes pour les rendez-vous
  app.use('/api/creneaux', creneauRouter); // Routes pour les créneaux horaires
  app.use('/api/agenda', agendaRouter);   // Routes pour l'agenda
  app.use('/api/notifications', notificationRouter); // Routes pour les notifications

  // Gestion des erreurs 404 (Route non trouvée)
>>>>>>> origin/master
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé',
    });
  });

<<<<<<< HEAD
  const server = app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
=======
  // Démarrage du serveur
  const server = app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
>>>>>>> origin/master
  });

  // Gestion propre de l'arrêt du processus
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Processus terminé');
      process.exit(0);
    });
  });
})();