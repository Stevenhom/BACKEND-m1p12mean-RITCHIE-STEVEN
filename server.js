// server.js

// Importer les modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Créer une instance d'Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour parser les requêtes JSON
app.use(cors());
app.use(express.json());

// Vérifier que JWT_SECRET est bien défini
if (!process.env.JWT_SECRET) {
  console.error("❌ Erreur: JWT_SECRET non défini !");
  process.exit(1); // Arrête le serveur si la variable d'environnement est absente
}

// Connexion à MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://ss_garage:ss_garage25@clusterss.kw5nn.mongodb.net/mean_db?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Atlas connecté"))
  .catch(err => console.error("❌ Erreur de connexion MongoDB :", err));


// Définir une route de test
app.use('/auth', require('./routes/authRoutes'));
app.use('/auth', require('./routes/forgotPasswordRoutes'));
app.use('/auth', require('./routes/resetPasswordRoutes'));
app.use('/brand', require('./routes/brandRoutes'));
app.use('/vehicle', require('./routes/vehicleRoutes'));
app.use('/reparationType', require('./routes/reparationTypeRoutes'));
app.use('/fleet', require('./routes/fleetRoutes'));
app.use('/deposit', require('./routes/depositRoutes'));
app.use('/expense', require('./routes/expenseRoutes'));
app.use('/reparation', require('./routes/reparationRoutes'));
// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port http://localhost:${PORT}`);
});