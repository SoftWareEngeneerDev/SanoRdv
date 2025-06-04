// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'sanoRdv';

app.get('/', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    res.send({ message: 'Connected to MongoDB!', collections });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur de connexion MongoDB');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
