const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const cors = require('cors')
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config()

const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de donnée.

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors())

try {
    app.use(bodyParser.json());
} catch {
    app.status(400)
    res.send({statut: "Erreur", message: "JSON incorrect"});
    return;
}
app.use((req, res, next) => {
    // S'il y a déjà une variable req.db, on continue
    // Il n'y a pas de raison.
    if (req.db) {
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

/**
 * Cette route permet de créer un compte
 * @param req {Object} La requête.
 * @param res {Object} La réponse.
 * @param req.body {Object} Les données de la requête.
 * @param req.body.identifiant {string} L'identifiant du compte.
 * @param req.body.motdepasse {string} Le mot de passe du compte.
 * @return Promise<{
 * status: string,
 * message: string
 * }>
 */
app.post('/register', async (req, res) => {
    const {identifiant, motdepasse} = req.body;
    if (identifiant && motdepasse) {
        bcrypt.hash(motdepasse, 10, (err, hash) => {
            if (err) {
                console.error('Une erreure est survenue lors du hachage. Veuillez contacter l\'administrateur. Error :' + err);
                res.status(500).send({
                    status: "Erreur",
                    message: 'Une erreure est survenue lors du hachage. Veuillez contacter l\'administrateur.'
                })
                return;
            }
            let sql = req.db.prepare("INSERT INTO compte VALUES (?, ?)", [identifiant, hash])
            sql.run((err) => {
                if (err) {
                    console.error('Une erreur est survenue lors de l\'a création du compte : ' + err);
                    res.status(500).send({status: "Erreur",
                        message: 'Une erreur est survenue lors de l\'a création du compte ' + err
                    });
                    return;
                }
                console.log("Compte enregistré");
                sql.finalize();
                res.status(200).send({status: "Succès", message: 'Compte enregistré'})
            })
        })
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
    }
})

/**
 * Cette fonction permet de vérifier si un token est valide
 * @param {string} jeton - Le token JWT à vérifier
 * @param {Object} req - La requête
 * @throws {Promise<Error>} Si le token est invalide ou si l'utilisateur n'est pas trouvé
 * @return {Promise<string>} Une promesse qui résout avec l'identifiant du compte
 */
function expTokenVerification(jeton, req) {
    return new Promise((resolve, reject) => {
        try {
            const token = jwt.verify(jeton, process.env.SECRET_KEY);

            if (!token.iat || !token.exp || !token.identifiant) {
                return reject(new Error("Element manquant dans le token"));
            }
            if (token.iat > Date.now() / 1000) {
                return reject(new Error("La date de création doit être inférieure à l'heure actuelle"));
            }
            if (token.exp < Date.now() / 1000) {
                return reject(new Error("La date d'expiration doit être supérieure à l'heure actuelle"));
            }
            if (token.iat > token.exp) {
                return reject(new Error("La date d'expiration doit être supérieure à la date de création"));
            }

            const identifiant = token.identifiant;

            const sql = req.db.prepare('SELECT * FROM compte WHERE identifiant = ?');

            sql.get([identifiant], (err, row) => {
                if (err) {
                    return reject(new Error("Erreur lors de l'exécution de la requête : " + err.message));
                }
                if (!row) {
                    return reject(new Error("Jeton inconnu"));
                }

                sql.finalize((err) => {
                    if (err) {
                        return reject(new Error("Erreur lors de la finalisation de la requête : " + err.message));
                    }
                    resolve(row.identifiant);
                });
            });
        } catch (error) {
            reject(new Error("Échec de la vérification du token : " + error.message));
        }
    });
}

/**
 * Cette route permet de se connecter
 * @param req {Object} La requête.
 * @param res {Object} La réponse.
 * @param req.body {Object} Les données de la requête.
 * @param req.body.identifiant {string} L'identifiant du compte.
 * @param req.body.motdepasse {string} Le mot de passe du compte.
 * @return Promise<{
 * status: string,
 * message: string
 * }>
 */
app.post('/login', (req, res) => {
    const {identifiant, motdepasse} = req.body;
    if (identifiant && motdepasse) {
        let sql = req.db.prepare(`SELECT motdepasse FROM compte WHERE identifiant = ?`, [identifiant])
        sql.get(async (err, result) => {
            if (err) {
                console.error('Erreur sql :', err);
                res.status(500).send({status: "Erreur", message: 'Erreur sql'})
                return;
            }
            if (!result.motdepasse) {
                console.error("Compte inconnu (ou en double, c'est un problème)");
                res.status(404).send({status: "Erreur", message: "Compte inconnu (ou en double, c'est un problème)"})
                return;
            }
            const row = result.motdepasse;

            const compare = await bcrypt.compare(motdepasse, row.toString());
            if (compare !== true) {
                console.error("Identifiants incorrects");
                res.status(401).send({statut: "Erreur", message: "Identifiants incorrects"});
                return;
            }

            const token = jwt.sign(
                // Ceci est le "payload", donc le contenu concret du JWT
                {
                    identifiant: identifiant,
                    exp: Date.now() + (1000 * 60 * 10) // 10 Minutes avant expiration
                },
                // Ceci est la clef secrète
                process.env.SECRET_KEY
            );

            console.log("JWT Token Créé");
            res.status(200).send({statut: "Succès", message: token});
        })
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
        return;
    }
})

/**
 * Cette route permet de se déconnecter
 * @param req {Object} La requête.
 * @param res {Object} La réponse.
 * @param req.headers.token {string} Le token du compte.
 * @return Promise<{
 * status: string,
 * message: string
 * }>
 */
app.get('/logout', (req, res) => {
    const token = req.headers.token;
    if (token) {

    } else {
        res.status(400).send({statut: "Erreur", message: "Le token doit être fournis"});
        return;
    }
    res.send({status: "Succès", message: "logout"})
})

/**
 * Cette route permet de vérifier si un token est valide
 * @param req {Object} La requête.
 * @param res {Object} La réponse.
 * @param req.headers.token {string} Le token du compte.
 * @return Promise<{
 * status: string,
 * message: string
 * } | {
 *     status: string,
 *     message: string,
 *     utilisateur: {
 *     identifiant: string
 *     }
 * }>
 */
app.post('/verify', (req, res) => {
    const token = req.headers.token;
    if (!token) {
        res.status(400).send({statut: "Erreur", message: "Le token doit être fournis"});
    }
    expTokenVerification(token, req)
        .then((identifiant) => {
            console.log("Token valide")
            res.status(200).send({
                status: "Succès",
                message: "Token valide",
                utilisateur: {
                    identifiant: identifiant
                }
            })
        })
        .catch((err) => {
            console.log(err)
            res.status(401).send({status: "Erreur", message: err})
        });
})

/**
 * Cette route permet de modifier un champ d'un compte
 * @param req {Object} La requête.
 * @param res {Object} La réponse.
 * @param req.query.id {string} L'identifiant du compte.
 * @param req.body {Object} Les données de la requête.
 * @param req.body.identifiant {string} L'identifiant du compte.
 * @param req.body.motdepasse {string} Le mot de passe du compte.
 * @return Promise<{
 * status: string,
 * message: string
 * }>
 */
app.patch('/update', (req, res) => {
    const id = req.query.id;
    const {identifiant, motdepasse} = req.body;

    if (!id) {
        res.status(400).send({status: "Erreur", message: "L'identifiant doit être fournis"});
        return;
    }

    if (!identifiant && motdepasse) {
        bcrypt.hash(motdepasse, 10, (err, hash) => {
            if (err) {
                console.error('Une erreure est survenue lors du hachage. Veuillez contacter l\'administrateur. Error :' + err);
                res.status(500).send({
                    status: "Erreur",
                    message: 'Une erreure est survenue lors du hachage. Veuillez contacter l\'administrateur.'
                })
                return;
            }
            let sql = req.db.prepare("UPDATE compte SET motdepasse = ? WHERE identifiant = ?", [motdepasse, id])
            sql.run((err) => {
                if (err) {
                    console.error('Une erreure est survenue lors de la modification du compte : ' + err);
                    res.status(500).send({
                        status: "Erreur",
                        message: 'Une erreure est survenue lors de la modification du compte'
                    });
                    return;
                }
                console.log("Modification réussie avec succès");
                sql.finalize();
                res.status(200).send({status: "Succès", message: 'Modification réussie avec succès'})
            })
        })
    } else if (identifiant && !motdepasse) {
        let sql = req.db.prepare("UPDATE compte SET identifiant = ? WHERE identifiant = ?", [identifiant, id])
        sql.run((err) => {
            if (err) {
                console.error('Une erreure est survenue lors de la modification du compte : ' + err);
                res.status(500).send({
                    status: "Erreur",
                    message: 'Une erreure est survenue lors de la modification du compte'
                });
                return;
            }
            console.log("Modification réussie avec succès");
            sql.finalize();
            res.status(200).send({status: "Succès", message: 'Modification réussie avec succès'})
        })
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
    }
})

const server = app.listen(3000, () => {
    console.log("Le serveur d'authentification écoute sur le port 3000");
});
