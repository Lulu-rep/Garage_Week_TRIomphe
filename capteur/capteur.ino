#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

#define DHTPIN 2    // Pin de données du capteur DHT11 (température et humidité)
#define DHTTYPE DHT11  // Type de capteur DHT11 (température et humidité)
#define LEDTemp 7 // Pin pour la LED de température
#define LEDDust 6 // Pin pour la LED de poussière
#define LEDLight 5  // Pin pour la LED de luminosité

DHT dht(DHTPIN, DHTTYPE);
// Adresse I2C de l'écran LCD et format (16 colone et 2 lignes pour le modèle 16x2)
LiquidCrystal_I2C lcd(0x27, 16, 2);

int dustPin = 8; // Pin numérique pour la mesure de la poussière
int ldrPin = A0;  // Pin analogique pour la photorésistance
// Variables pour la mesure de la poussière
unsigned long duration; // Durée de la mesure
unsigned long starttime;
unsigned long sampletime_ms = 30000; // Durée de l'échantillonnage
unsigned long lowpulseoccupancy = 0; // Occupation de la basse fréquence
float ratio = 0;

// Variables pour la concentration de poussière
float concentration = 0;
float concentrationsdisplay = 0;
float concentration1 = 0;
float concentration2 = 0;
float concentration3 = 0;
float concentration4 = 0;
float concentrationbefore = 0;

unsigned long previousMillis = 0;
const long interval = 5000;  // Intervalle de changement d'affichage en millisecondes

// Variables pour l'affichage des capteurs
bool showDust = true;
bool showTempHum = false;
bool showLight = false;

SoftwareSerial BTSerial(10, 11);  // RX, TX pour le Bluetooth (A brancher sur le module HC-05 avec RXD sur TXD et TXD sur RXD)

float temperature;
float humidity;
float luminosity;

void setup() {
  Serial.begin(38400);    // Initialise la communication série pour le débogage (USB)
  BTSerial.begin(38400);  // Initialise la communication Bluetooth

  pinMode(dustPin, INPUT); // Pin pour la mesure de la poussière
  starttime = millis(); // Initialisation du temps de démarrage

  pinMode(LEDTemp, OUTPUT); // Pin pour la LED de température
  pinMode(LEDDust, OUTPUT); // Pin pour la LED de poussière
  pinMode(LEDLight, OUTPUT); // Pin pour la LED de luminosité

  // Initialisation de l'écran LCD
  lcd.init();
  lcd.backlight();

  dht.begin();
}

void loop() {
  unsigned long currentMillis = millis();

  // Lecture des commandes AT via le terminal série et envoi au module Bluetooth
  if (Serial.available()) {
    String command = Serial.readString();
    Serial.print(command);
    if (command.startsWith("AT")) {
      Serial.println("AT Command");
      delay(100);
      BTSerial.println(command);
      delay(100);
    }
    while (BTSerial.available() > 0) {
      command += (char)BTSerial.read();
    }
    Serial.println(command);
  }

  // Mesure de la poussière
  duration = pulseIn(dustPin, LOW);
  lowpulseoccupancy += duration;

  // Calcul de la concentration de poussière
  if ((currentMillis - starttime) > sampletime_ms) {
    ratio = lowpulseoccupancy / (sampletime_ms * 10.0);
    concentration = 1.1 * pow(ratio, 3) - 3.8 * pow(ratio, 2) + 520 * ratio + 0.62;
    if (concentration < 0.63) {
      concentration = concentrationbefore;
    }
    // Moyenne des 4 dernières valeurs de concentration
    concentration4 = concentration3;
    concentration3 = concentration2;
    concentration2 = concentration1;
    concentration1 = concentration;
    concentrationsdisplay = (concentration1 + concentration2 + concentration3 + concentration4) / 4;

    lowpulseoccupancy = 0;
    starttime = millis();
    concentrationbefore = concentrationsdisplay;
  }

  // Mesure de la température et de l'humidité
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  // Mesure de la luminosité
  int ldrValue = analogRead(ldrPin);
  luminosity = map(ldrValue, 1023, 0, 0, 100);  // Conversion en pourcentage de luminosité

  // Envoi des valeurs lues par les capteurs au terminal pour le débogage
  Serial.print("Temperature: ");
  Serial.println(temperature);
  Serial.print("Humidite: ");
  Serial.println(humidity);
  Serial.print("Luminosite: ");
  Serial.println(luminosity);
  Serial.print("Concentration: ");
  Serial.println(concentrationsdisplay);

  // Envoi des valeurs via Bluetooth pour l'affichage sur un terminal distant
  sendValue(temperature,humidity, concentrationsdisplay, luminosity);

  // Changement d'affichage sur l'écran LCD toutes les 5 secondes
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    lcd.clear();
    if (showDust) {
      // Affichage de la concentration de poussière
      lcd.setCursor(0, 0);
      lcd.print("Concentration:");
      lcd.setCursor(0, 1);
      lcd.print(concentrationsdisplay);
      lcd.print(" pcs/0.01cf");

      showDust = false;
      showTempHum = true;
    } else if (showTempHum) {
      // Affichage de la température et de l'humidité
      lcd.setCursor(0, 0);
      lcd.print("Temp: ");
      lcd.print(temperature);
      lcd.print(" C");

      lcd.setCursor(0, 1);
      lcd.print("Hum: ");
      lcd.print(humidity);
      lcd.print(" %");

      showTempHum = false;
      showLight = true;
    } else if (showLight) {
      // Affichage de la luminosité
      lcd.setCursor(0, 0);
      lcd.print("Luminosite: ");
      lcd.setCursor(0, 1);
      lcd.print(luminosity);
      lcd.print(" %");

      showLight = false;
      showDust = true;
    }
  }

  // Allumage des LEDs en fonction des valeurs des capteurs
  if(temperature > 30) {
    digitalWrite(LEDTemp, HIGH);
  } else {
    digitalWrite(LEDTemp, LOW);
  }
  if(concentrationsdisplay > 2000) {
    digitalWrite(LEDDust, HIGH);
  } else {
    digitalWrite(LEDDust, LOW);
  }
  if(luminosity < 25) {
    digitalWrite(LEDLight, HIGH);
  } else {
    digitalWrite(LEDLight, LOW);
  }

  delay(1000);
}

// Fonction pour envoyer les valeurs des capteurs via Bluetooth
void sendValue(float temperature,float humidity, float concentrationsdisplay, float luminosity) {
  // Création d'un objet JSON pour l'envoi des valeurs
  StaticJsonDocument<200> doc;
  // Ajout des valeurs des capteurs dans l'objet JSON correspondant format de la basse de données
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["dust"] = concentrationsdisplay;
  doc["light"] = luminosity;

  // Conversion de l'objet JSON en chaîne de caractères et envoi via Bluetooth
  String output;
  serializeJson(doc, output);

  BTSerial.println(output);
  delay(100);
}