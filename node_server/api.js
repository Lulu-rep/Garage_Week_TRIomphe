const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

const app = express();
const cors = require("cors");
app.use(cors({ credentials: true, origin: "http://localhost:4200" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// Connect to the MongoDB database outside of the route handlers for efficiency
let db;
MongoClient.connect(url)
  .then((client) => {
    db = client.db("sensorDataDB");
    console.log("Connected to Database");
  })
  .catch((error) => console.error(error));

app.post("/post-data", (req, res) => {
  // Validate incoming data
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
