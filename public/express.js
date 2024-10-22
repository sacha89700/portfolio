const express = require('express');
const path = require('path');

const app = express();

// Servir les fichiers statiques à partir du dossier 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Définir d'autres routes si nécessaire
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html')); // Point d'entrée de ton application
});

// Démarrer le serveur
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
