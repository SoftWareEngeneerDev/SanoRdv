import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

// Import des routes (avec export default)
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import adminRoutes from './routes/admin.routes.js';
import specialiteRoutes from './routes/specialite.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Connexion à la base MongoDB
    await connectDB();
    console.log('✅ Base de données connectée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }

  // Middleware CORS - autoriser frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  }));

  // Parse JSON et URL-encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Montage des routes
  // Note : attention, tu utilises la même route de base '/api/auth' pour 3 routes différentes, 
  // cela peut poser problème, idéalement utilise des routes distinctes
  app.use('/api/auth', userRoutes);       // Par exemple, changer ici en /api/users
  app.use('/api/auth', patientRoutes);
  app.use('/api/auth', adminRoutes);
  app.use('/api/specialites', specialiteRoutes);

  // Route santé
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Gestion 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé',
    });
  });

  // Démarrage serveur
  const server = app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  });

  // Gestion arrêt propre
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
})();
