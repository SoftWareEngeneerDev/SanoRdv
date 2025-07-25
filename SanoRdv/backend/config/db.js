import mongoose from 'mongoose';
import dotenv from 'dotenv';
   

dotenv.config();

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const options = {
  useNewUrlParser: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  connectTimeoutMS: 10000,
};
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

const connectDB = async () => {
  try {
    console.log('MONGO_URI:', url);
    //await mongoose.connect(process.env.MONGO_URI);
	await mongoose.connect(url);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Échec de la connexion à MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;