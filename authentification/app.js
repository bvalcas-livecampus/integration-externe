const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const app = express();


const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de donnée.


try {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use((req, res, next) => {
        // S'il y a déjà une variable req.db, on continue
        // Il n'y a pas de raison.
        if(req.db) {
            next();
        } else {
            req.db = new sqlite3.Database('compte_itineraire');

            
            // Creation de la table compte si elle n'existe pas
            req.db.run("CREATE TABLE IF NOT EXISTS compte (\
                identifiant VARCHAR(100) NOT NULL, \
                motdepasse VARCHAR(255) NOT NULL, \
                PRIMARY KEY (identifiant) )");
        
            next();
        }
    });
} catch {
    app.status(400)
    res.send({ statut: "Erreur", message: "JSON incorrect" });
    return ;
}
  

// Création de compte. méthode POST
app.post('/register', async (req, res) => {
    const identifiant = req.body.identifiant;
    const motdepasse = req.body.motdepasse;
    bcrypt.hash(motdepasse, 10, (err, hash) => {
        if(err){
            console.error('Une erreure est survenue lors du hachage. Veuillez contacter l\'administrateur. Error :' + err);
            res.status(401);
            res.send('Une erreure est survenue lors du hachage. Veuillez contacter l\'administrateur.')
            return ;
        }
        let sql = req.db.prepare("INSERT INTO compte VALUES (?, ?)", [identifiant, hash])
        sql.run((err) => {
            if (err){
                console.error('Une erreure est survenue lors de l\'a création du compte : ' + err);
                res.status(401);
                res.send('Une erreure est survenue lors de l\'a création du compte');
                return ;
            }
            console.log("Compte enregistré");
            sql.finalize();  
            res.send('Compte enregistré')
        })
    })
})

// Connexion. Méthode POST
app.post('/login', (req, res) => {
    const identifiant = req.body.identifiant;
    const motdepasse = req.body.motdepasse;

    let sql = req.db.prepare(`SELECT motdepasse FROM compte WHERE identifiant = ?`, [ identifiant ])
    sql.get( async (err, result) => {
        if (err) {
            console.error('Erreur sql :', err);
            res.status(400);
            res.send('Erreur sql')
            return ;
        }
        if(!result.motdepasse) {
            console.error("Compte inconnu (ou en double, c'est un problème)");
            res.status(401);
            res.send("Compte inconnu (ou en double, c'est un problème)")
            return ;
        }
        const row = result.motdepasse;
        
        const compare = await bcrypt.compare(motdepasse, row.toString());
        if(compare !== true) {
            console.error("Identifiants incorrects");
            res.status(401);
            res.send({ statut: "Erreur", message: "Identifiants incorrects" });
            return ;
        }

        console.error("JWT Token");
        res.status(200)
        res.send({ statut: "Succès", message: "JWT Token" });
    })
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
