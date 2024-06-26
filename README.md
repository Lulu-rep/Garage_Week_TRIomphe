Titre du projet : "MainTRIance"

Slogan :          "Ensemble, faisons du tri un véritable TRI-omphe pour notre planète !" 

Paragraphe résumant le projet
" Un projet cherchant à simplifier la maintenance sur les machines de tri optiques de Véolia, en collectant des données pour permettre de signaler les dysfonctionnements avant qu'ils ne se produisent, fournissant une solution de maintenance préventive et prédictive afin d'optimiser les coûts de maintenance. Permettant ainsi d'améliorer l'éfficacité oppérationelle et la durabilité des équipements"

Démarrage :

Prérequis : 
    - Avoir Nodejs et MongoDB d'installé sur sa machine.
   	- Avoir Arduino Ide d'installé sur sa machine.
Installation :
- Récupérer le code zippé fourni.
- Dézipper le dossier à l'endroit souhaité.
- Ouvrir un terminal dans le dossier du projet.
- Se rendre dans le dossier node_server avec ```cd node_server```.
- Exécuter la commande ```npm install``` pour installer les dépendances des serveurs Nodejs
- Se rendre dans le dossier Interface et ouvrir un terminal dans celui-ci.
- Exécuter ```npm install``` pour installer les dépendances nécessaires à Angular.
- En cas d'échec sous Windows :
- Ouvrez un terminal PowerShell en mode administrateur.
- Exécuter la commande ``` set-executionpolicy unrestricted```.
- Valider avec O.

Pour l'Arduino :
Si le module Bluetooth n'est pas configuré :
-	Se connecter à l'Arduino par le câble USB.
-	Entrez en mode AT (en maintenant le bouton du module lors du démarrage).
-	Fixez le nom à Triomphe, le Baud rate à 38400, le mode à 0 (slave).
-	Ouvrir le fichier capteur/librairies/capteur.ino dans Arduino IDE.
-	Installer les librairies nécessaires en les importants depuis le dossier capteur/librairies (LiquidCrystal_I2C, DHT_sensor_library, ArduinoJson, Adafruit_Unified_Sensor).
-	Téléverser le code de capteur/librairies/capteur.ino sur l’Arduino.
    
Pour le Bluetooth :
- Activer le Bluetooth sur votre machine.
- Rechercher et ajouter l'appareil Triomphe dans les appareils disponibles (sous Windows 11   pensez à activer la découverte des appareils avancé).
- Se connecter au module Bluetooth en utilisant le mot-de-passe : 1234 .
-	Noter le numéro de port série utilisé par le module Arduino, de la forme COMx avec x un chiffre pouvant varier.
-	Remplacer dans le fichier node_server/app.js à la ligne 9 la valeur du port COM que vous avez noté précédemment.

Pour la base de données :
- Télécharger MongoDB et MongoDB Compass
- Lancer les serveurs Nodejs comme décrit dans la partie exécution
- Dans MongoDB Compass connecter-vous à la base de données mongodb://localhost:27017
- Dans la base sensorDataDB (qui existe si les étapes précédentes ont été réalisé) créer une nouvelle collection nommée "users"
- Insérer dans la collection (avec le bouton add data) une nouvelle combinaison de login password de la forme ``` {"login":"VotreLogin","password":"VotreMotDePasse"}```

Exécution :
-	Ouvrir deux terminaux dans le dossier node_server et un dans Interface/projet.
-	Exécuter les commandes dans l'ordre ```node api.js```, ```node app.js``` et ```ng serve``` dans les terminaux du dossier node_server et dans Interface/projet respectivement.
-	Ouvrir la page http://localhost:4200


Arborescence du projet :
    - capteur : contient les fichiers nécessaires à l'Arduino.
         -librairies : contient les différentes librairies nécessaires au fonctionnement de l’Arduino.
         - capteur.ino : code de l’Arduino.
    - Interface/projet : Code de la page web utilisé pour l'affichage des données et des alertes.
    - node_server : Contient le code nécessaire pour les différents serveurs nodejs nécessaire au fonctionnement du projet.
        - api.js : code nodejs chargé de la gestion de la base de données.
        - app.js : code nodejs chargé de la connexion entre l'Arduino et la base de données.

Auteurs : 
- Luigi GIUSIANO, Lucas REPPLINGER, Théo GEORGIN, Elisa MARTINELLI, Sophie SOUBRY; 
- TRIomphe, 
- 2024
