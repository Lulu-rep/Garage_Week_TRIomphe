#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"
#include <SoftwareSerial.h>

#define DHTPIN 2
#define DHTTYPE DHT11
#define LEDTemp 7
#define LEDDust 6
#define LEDLight 5

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

int dustPin = 8;
int ldrPin = A0;  // Pin analogique pour la photorésistance
unsigned long duration;
unsigned long starttime;
unsigned long sampletime_ms = 30000;
unsigned long lowpulseoccupancy = 0;
float ratio = 0;


float concentration = 0;
float concentrationsdisplay = 0;
float concentration1 = 0;
float concentration2 = 0;
float concentration3 = 0;
float concentration4 = 0;
float concentrationbefore = 0;

unsigned long previousMillis = 0;
const long interval = 5000;  // Intervalle de changement d'affichage en millisecondes
bool showDust = true;
bool showTempHum = false;
bool showLight = false;

SoftwareSerial BTSerial(10, 11);  // RX, TX pour le Bluetooth (exemple)

float temperature;
float humidity;
float luminosity;

void setup() {
  Serial.begin(38400);    // Initialise la communication série pour le débogage (USB)
  BTSerial.begin(38400);  // Initialise la communication Bluetooth

  pinMode(dustPin, INPUT);
  starttime = millis();

  pinMode(LEDTemp, OUTPUT);
  pinMode(LEDDust, OUTPUT);
  pinMode(LEDLight, OUTPUT);

  lcd.init();
  lcd.backlight();

  dht.begin();
}

void loop() {
  unsigned long currentMillis = millis();

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

  if ((currentMillis - starttime) > sampletime_ms) {
    ratio = lowpulseoccupancy / (sampletime_ms * 10.0);
    concentration = 1.1 * pow(ratio, 3) - 3.8 * pow(ratio, 2) + 520 * ratio + 0.62;
    if (concentration < 0.63) {
      concentration = concentrationbefore;
    }

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
  Serial.print("Humidity: ");
  Serial.println(humidity);
  Serial.print("Luminosity: ");
  Serial.println(luminosity);
  Serial.print("Concentration: ");
  Serial.println(concentrationsdisplay);

  // Envoi des valeurs via Bluetooth pour l'affichage sur un terminal distant
  sendValue(temperature);
  sendValue(humidity);
  sendValue(concentrationsdisplay);
  sendValue(luminosity);

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

  if(temperature > 30) {
    digitalWrite(LEDTemp, HIGH);
  } else {
    digitalWrite(LEDTemp, LOW);
  }
  if(concentrationsdisplay > 1000) {
    digitalWrite(LEDDust, HIGH);
  } else {
    digitalWrite(LEDDust, LOW);
  }
  if(luminosity < 20) {
    digitalWrite(LEDLight, HIGH);
  } else {
    digitalWrite(LEDLight, LOW);
  }

  delay(1000);
}

void sendValue(float value) {
  BTSerial.println(value, 1); // Envoi avec un chiffre après la virgule
  delay(100);
}
