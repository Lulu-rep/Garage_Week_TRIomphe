const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
/*const accountSid = '';
const authToken = '';
const client = require('twilio')(accountSid, authToken);
*/
const app = express();
const cors = require("cors");

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
app.use(cors({ credentials: true, origin: "http://localhost:4200" }));

let url = "mongodb://127.0.0.1:27017/sensorDataDB";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

function checkSignIn(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

// Connect to the MongoDB database outside of the route handlers for efficiency
let db;
MongoClient.connect(url)
  .then((client) => {
    db = client.db("sensorDataDB");
    console.log("Connected to Database");
  })
  .catch((error) => console.error(error));

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

app.post("/post-data", (req, res) => {
  const { temperature, humidity, dust, light } = req.body;
  if (
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
    date: formatDate(new Date()), // Add the current date
  };

  console.log(sensorData);
  /*if (temperature > 30 || dust > 100 || light > 1000) {
    // Si oui, envoyez un message via l'API
    client.messages.create({
      body: 'Une des valeurs du capteur dépasse le seuil.',
      from: '+13135137763',
      to: '+33768159967'
    })
    .then(message => console.log(message.sid));
  }*/

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

app.post("/login", (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ message: "Login and password are required" });
  }

  db.collection("users")
    .find({ login, password })
    .toArray()
    .then((users) => {
      if (users.length > 0) {
        req.session.user = login;
        res.status(200).end();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    })
    .catch((error) => {
      console.error("Error during login:", error);
      res.status(500).json({ message: error.message });
    });
});

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

app.get("/isConnected", (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ connected: true });
  } else {
    res.status(200).json({ connected: false });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
