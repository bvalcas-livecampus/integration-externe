const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const app = express();

try {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
} catch {
    app.statusCode(400)
    res.send({ statut: "Erreur", message: "JSON incorrect" });
    return ;
}

const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de donnée.
const db = new sqlite3.Database('compte_itineraire');

// Creation de la table compte si elle n'existe pas

db.run("CREATE TABLE IF NOT EXISTS compte (\
        identifiant VARCHAR(100) NOT NULL, \
        motdepasse VARCHAR(255) NOT NULL, \
        PRIMARY KEY (identifiant) )");

// Serveur d'authentification.


async function hashPassword (identifiant, password) {

    const saltRounds = 10;
  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
  
    return hashedPassword
  }
  

// Création de compte. méthode POST
app.post('/register', async (req, res) => {
    const identifiant = req.body.identifiant;
    const motdepasse = req.body.motdepasse;
    await hashPassword(motdepasse, 10, (err, hash) => {
        sql = db.prepare("INSERT INTO compte VALUES (?, ?)");
        sql.run(identifiant, hash)
        sql.finalize();  
        
        db.all(`SELECT * from compte WHERE identifiant = "${identifiant}"`, function(err, row) {
            console.log(row);
        })
    })
    res.send('ok')
})

// Connexion. Méthode POST
app.post('/login', (req, res) => {
    const identifiant = req.body.identifiant;
    const motdepasse = req.body.motdepasse;
    console.log(`SELECT motdepasse FROM compte WHERE identifiant = '${identifiant}'`)
    const hash = db.run(`SELECT motdepasse FROM compte WHERE identifiant = '${identifiant}'`)

    console.log("hash", hash)
    const result = bcrypt.compare(motdepasse, hash);
    if (result) {

        // TODO : Création du jeton
        // TODO : Sauvegarde du jeton

        res.statusCode("200");
        res.send({ statut: "Succès", message: "JWT Token" });
    } else {
        res.statusCode("401");
        res.send({ statut: "Erreur", message: "Identifiants incorrects" });
    }
})

// Déconnexion. Méthode GET
app.get('/logout', (req, res) => {
    console.log("logout")
    res.send("logout")
})

// Vérification du jeton. Méthode POST
app.post('/verify', (req, res) => {
})

// Modification des données d'un compte. Méthode PATCH
app.patch('/update', (req, res) => {
})



var server = app.listen(3000, () => {
    console.log("On écoute sur le port 3000");
});
