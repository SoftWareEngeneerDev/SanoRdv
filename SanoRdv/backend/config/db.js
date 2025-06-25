import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sanoRdv');
    console.log('MongoDB connecté');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB', error);
    process.exit(1); // arrêt du serveur si échec
  }
};

export default connectDB;