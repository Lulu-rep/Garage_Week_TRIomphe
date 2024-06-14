const WebSocket = require("ws");
const { SerialPort } = require("serialport");
const express = require("express");

const server = new WebSocket.Server({ port: 8080 }); // Port WebSocket

// Création de la connexion série avec l'Arduino
const arduinoSerial = new SerialPort({ path: "COM8", baudRate: 38400 });

let currentSocket = null;
let lastReceivedData = ""; // Initialisez la variable

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
      lastReceivedData = ""; // Réinitialisez la dernière donnée reçue
    }
  });
});

// Connexion WebSocket
server.on("connection", (socket) => {
  console.log("WebSocket client connected");
  currentSocket = socket;

  // Gestion des erreurs WebSocket
  socket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  // Gestion de la fermeture de la connexion WebSocket
  socket.on("close", () => {
    console.log("WebSocket client disconnected");
    currentSocket = null;
  });
});

// Gestion des erreurs de connexion série
arduinoSerial.on("error", (err) => {
  console.error("Error with serial port:", err);
});

// Gestion des erreurs du serveur WebSocket
server.on("error", (err) => {
  console.error("WebSocket server error:", err);
});

console.log("WebSocket server running on port 8080");

// Serveur HTTP pour obtenir les dernières données reçues de l'Arduino
const httpServer = express();
httpServer.get("/", (req, res) => {
  res.send(
    `Dernières données reçues de l'Arduino : ${
      lastReceivedData || "Aucune donnée reçue de l'Arduino pour le moment"
    }`
  );
});

httpServer.listen(3001, () => {
  console.log("Serveur HTTP en écoute sur le port 3001");
});
