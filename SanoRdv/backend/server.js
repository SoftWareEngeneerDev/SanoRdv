import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import adminRoutes from './routes/admin.routes.js';
import specialiteRoutes from './routes/specialite.routes.js';
import systemeDeRechercheRoutes from './routes/SystemeDeRecherche.routes.js';
import rendezvousRoutes from './routes/rendezvous.routes.js';
import creneauRouter from './routes/creneau.routes.js';
import agendaRouter from './routes/agenda.routes.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    console.log('✅ Base de données connectée avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }

  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  }));

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
  app.use('/api/agenda', agendaRouter);

  // Gestion 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint non trouvé',
    });
  });

  const server = app.listen(port, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
})();
