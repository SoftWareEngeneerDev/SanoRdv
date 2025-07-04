import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

// Import des routes
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import medecinRoutes from './routes/medecin.routes.js';
import specialiteRoutes from './routes/specialite.routes.js';
import creneauRouter from './routes/creneau.routes.js';
import notificationRouter from './routes/notification.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Connexion à la base de données MongoDB
    await connectDB();
    console.log('✅ Base de données connectée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }

  // Middleware CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  }));

  // Middlewares pour parser le corps des requêtes
  app.use(express.json()); // Remplace bodyParser.json()
  app.use(express.urlencoded({ extended: true })); // Remplace bodyParser.urlencoded()

  // Montage des routes
  app.use('/api/auth', userRoutes);
  app.use('/api/auth', patientRoutes);
  app.use('/api/auth', medecinRoutes);
  app.use('/api/specialites', specialiteRoutes);
  app.use('/api/creneaux', creneauRouter);
  app.use('/api/notifications', notificationRouter);

  // Route "health check"
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Middleware gestion des erreurs 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé',
    });
  });

  // Démarrage du serveur
  const server = app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  });

  // Gestion propre des arrêts
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
})();