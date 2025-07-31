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
import medecinRouter from './routes/medecin.routes.js';
import notificationRouter from './routes/notification.routes.js';
import stateRouter from './routes/state.routes.js';

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
    process.exit(1);
  }

  // ✅ Middleware CORS avec plusieurs origines autorisées
  const allowedOrigins = [
    'http://localhost:4200',
    'https://sanordv-wu78.onrender.com',
  ];

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    credentials: true,
  }));

  // Middleware pour parser le JSON et les données url-encoded
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Définition des routes
  app.use('/api/auth', userRoutes);
  app.use('/api/patients', patientRoutes);
  app.use('/api/medecins', medecinRouter);
  app.use('/api/admins', adminRoutes);
  app.use('/api/specialites', specialiteRoutes);
  app.use('/api/recherche', systemeDeRechercheRoutes);
  app.use('/api/rendezvous', rendezvousRoutes);
  app.use('/api/creneaux', creneauRouter);
  app.use('/api/agenda', agendaRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/state', stateRouter);

  // Gestion des erreurs 404
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
