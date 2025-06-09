import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoute from './routes/user.routes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    console.log('Base de données connectée');
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  }

  app.use(cors());
  app.use(express.json());

  app.use('/api/users', userRoute);

  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
})();
