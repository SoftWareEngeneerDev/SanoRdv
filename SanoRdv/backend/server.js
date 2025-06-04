import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoute from './routes/user.routes.js';

const app = express();
const port = 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoute);

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
