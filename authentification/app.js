const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de donnée.
const db = new sqlite3.Database(':compte_itineraire:');

// Serveur d'authentification.

// Création de compte. méthode POST
app.get('/register', (req, res) => {
    console.log(req.body);
    res.send('ok');
})

// Connexion. Méthode POST
app.get('/login', (req, res) => {
})

// Déconnexion. Méthode GET
app.get('/logout', (req, res) => {
    console.log("logout")
    res.send("logout")
})

// Vérification du jeton. Méthode POST
app.get('/verify', (req, res) => {
})

// Modification des données d'un compte. Méthode PATCH
app.get('/update', (req, res) => {
})



var server = app.listen(3000, () => {
    console.log("On écoute sur le port 3000");
});
