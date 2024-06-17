const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const accountSid = 'ACbb1f1d4fda7a823baccf7ef987d13dd2';
const authToken = '';
const client = require('twilio')(accountSid, authToken);

const app = express();
const cors = require("cors");

// Configuration de l'application Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
// Configuration de CORS pour autoriser les requêtes depuis le serveur Angular
app.use(cors({ credentials: true, origin: "http://localhost:4200" }));

// URL de connexion à la base de données MongoDB
let url = "mongodb://127.0.0.1:27017/sensorDataDB";

// Fonction pour formater la date en format DD-MM-YYYY HH:MM:SS
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Vérification de la connexion de l'utilisateur
function checkSignIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

// Connection au serveur MongoDB
let db;
MongoClient.connect(url)
  .then((client) => {
    db = client.db("sensorDataDB");
    console.log("Connected to Database");
  })
  .catch((error) => console.error(error));

// Routes API REST 
// Récupération des données de la base de données avec une requête GET par date décroissante
app.get("/get-data", (req, res) => {
  db.collection("sensorData")
    .find()
    .sort({ date: -1 })
    .toArray()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});
// Mise en place d'un délai de 60 secondes pour l'envoi des notifications sur le téléphone
let lastMessageTime = null;
const delay = 60000; // 60 secondes
// Enregistrement des données du capteur dans la base de données avec une requête POST
app.post("/post-data", (req, res) => {
  const { temperature, humidity, dust, light } = req.body;
  if (
    // Vérification des valeurs des capteurs pour s'assurer qu'elles sont des nombres
    typeof temperature !== "number" ||
    typeof humidity !== "number" ||
    typeof dust !== "number" ||
    typeof light !== "number"
  ) {
    return res.status(400).json({ message: "Invalid sensor data format" });
  }

  let sensorData = {
    temperature,
    humidity,
    dust,
    light,
    date: formatDate(new Date()), // Ajout de la date actuelle
  };

  console.log(sensorData);
  // Envoi de la notification si une des valeurs dépasse le seuil
  if (temperature > 30 || dust > 2000 || light < 25) {
    if (!lastMessageTime || Date.now() - lastMessageTime > delay) {
      let message = 'Une des valeurs du capteur dépasse le seuil.';

      if (temperature > 30) {
        message = 'La température dépasse le seuil.';
      } else if (dust > 2000) {
        message = 'La poussière dépasse le seuil.';
      } else if (light <25) {
        message = 'La lumière dépasse le seuil.';
      }
      // Envoi de la notification par SMS
      client.messages.create({
        body: message,
        from: '+13135137763',
        to: '+33768159967'
      })
        .then(message => {
          console.log(message.sid);
          lastMessageTime = Date.now();
        });
    }
  }
  // Enregistrement des données dans la base de données
  db.collection("sensorData")
    .insertOne(sensorData)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      console.error("Error storing sensor data:", error);
      res.status(500).json({ message: "Failed to store sensor data" });
    });
});
// Connexion à l'API avec un login et un mot de passe
app.post("/login", (req, res) => {
  const { login, password } = req.body;
  // Vérification des champs login et password
  if (!login || !password) {
    return res.status(400).json({ message: "Login and password are required" });
  }
  // Recherche de l'utilisateur dans la base de données
  db.collection("users")
    .find({ login, password })
    .toArray()
    .then((users) => {
      // Si l'utilisateur est trouvé, la session est initialisée
      if (users.length > 0) {
        req.session.user = login;
        res.status(200).end();
      } else {
        // Sinon, une erreur 401 est renvoyée
        res.status(401).json({ message: "Unauthorized" });
      }
    })
    .catch((error) => {
      console.error("Error during login:", error);
      res.status(500).json({ message: error.message });
    });
});
// Déconnexion de l'API
app.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).end();
    });
  } else {
    res.status(200).end();
  }
});
// Vérification de la connexion de l'utilisateur
app.get("/isConnected", (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ connected: true });
  } else {
    res.status(200).json({ connected: false });
  }
});
// Lancement du serveur sur le port 3000
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
