#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
LiquidCrystal_I2C lcd(0x27, 20, 4);

int dustPin = 8;
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
const long interval = 5000; // Intervalle de changement d'affichage en millisecondes
bool showDust = true;

void setup() {
  Serial.begin(9600);
  pinMode(dustPin, INPUT);
  starttime = millis();

  lcd.init();
  lcd.backlight();

  dht.begin();
}

void loop() {
  unsigned long currentMillis = millis();

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

    Serial.println("------------------------------");
    Serial.println("concentrationsdisplay");
    Serial.println(concentrationsdisplay);
    Serial.println("concentration1");
    Serial.println(concentration1);
    Serial.println("concentration2");
    Serial.println(concentration2);
    Serial.println("concentration3");
    Serial.println("concentration3");
    Serial.println("concentration4");
    Serial.println("concentration4");

    lowpulseoccupancy = 0;
    starttime = millis();
    concentrationbefore = concentrationsdisplay;
  }

  // Mesure de la température et de l'humidité
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Affichage sur le moniteur série
  Serial.println("Temperature = " + String(temperature) + " °C");
  Serial.println("Humidite = " + String(humidity) + " %");

  // Changement d'affichage sur l'écran LCD toutes les 5 secondes
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    showDust = !showDust;

    lcd.clear();
    if (showDust) {
      // Affichage de la concentration de poussière
      lcd.setCursor(0, 0);
      lcd.print("Concentration:");
      lcd.setCursor(0, 1);
      lcd.print(concentrationsdisplay);
      lcd.print(" pcs/0.01cf");

      lcd.setCursor(0, 2);
      lcd.print("Pollution level:");
      lcd.setCursor(0, 3);
      if (concentrationsdisplay < 400) {
        lcd.print("NO");
      } else if (concentrationsdisplay <= 800) {
        lcd.print("Very Low");
      } else if (concentrationsdisplay <= 1500) {
        lcd.print("Low");
      } else if (concentrationsdisplay <= 2500) {
        lcd.print("Medium");
      } else {
        lcd.print("Very High");
      }
    } else {
      // Affichage de la température et de l'humidité
      lcd.setCursor(0, 0);
      lcd.print("Temp: ");
      lcd.print(temperature);
      lcd.print(" C");

      lcd.setCursor(0, 1);
      lcd.print("Hum: ");
      lcd.print(humidity);
      lcd.print(" %");
    }
  }

  delay(100);
}
