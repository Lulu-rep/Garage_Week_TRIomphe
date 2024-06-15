const axios = require('axios'); // Importez axios
const MongoClient = require('mongodb').MongoClient;
const {SerialPort} = require('serialport')
const WebSocket = require('ws');

// URL de connexion à la base de données MongoDB
let url = 'mongodb://127.0.0.1:27017/sensorDataDB';
let lastReceivedData = '';
let currentSocket = null;

const arduinoSerial = new SerialPort({ path: "COM7", baudRate: 38400 }); // Remplacez "COM7" par le port série de votre Arduino pour le bluetooth

// Connexion à la base de données MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    const db = client.db("sensorDataDB");
    const collection = db.collection("devices");

    // Ouverture de la connexion série
    arduinoSerial.on("open", () => {
      console.log("Serial port open");

      // Réception des données série depuis l'Arduino
      arduinoSerial.on("data", (data) => {
        const dataString = data.toString();
        lastReceivedData += dataString; // Concaténez le message à la dernière donnée reçue
      
        // Si le message se termine par un caractère de fin de ligne, traitez-le comme une chaîne complète
        if (dataString.endsWith("\n")) {
          console.log(`Données reçues de l'Arduino : ${lastReceivedData.trim()}`);
          if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
            currentSocket.send(lastReceivedData.trim());
          }
      
          // Parsing des données JSON et envoi à la base de données
          try {
            const jsonData = JSON.parse(lastReceivedData.trim());
          
            // envoie de la requête POST à l'API avec les données JSON
            axios.post('http://localhost:3000/post-data', jsonData)
              .then(response => {
                console.log('Data sent to API:', response.data);
              })
              .catch(error => {
                console.error('Failed to send data to API:', error);
              });

            // Insertion des données dans MongoDB
            collection.insertOne(jsonData)
              .then(result => {
                console.log('Data inserted into MongoDB:', result);
              })
              .catch(error => {
                console.error('Failed to insert data into MongoDB:', error);
              });

            // Reset lastReceivedData
            lastReceivedData = '';
          } catch (error) {
            console.error('Failed to parse JSON data:', error);
          }
        }
      });
    });
    // Gestion des erreurs de connexion série
    arduinoSerial.on('error', function(err) {
      console.log('Erreur avec le port série : ', err.message);
    })
  })
  .catch((error) => console.error('Failed to connect to MongoDB', error));