const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
let session = require('express-session')
var FileStore = require('session-file-store')(session);
const jwt = require('jsonwebtoken');

require('dotenv').config()

const sqlite3 = require('sqlite3').verbose();

app.use(cors({credentials: true, origin: "http://client:8080" /* pour le site en dev */ || "*" /* pour PostMan */}))

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    store: new FileStore({}),
    secret: process.env.SECRET_KEY_SESSION,
    cookie: {maxAge: 1000 * 60 * 20, sameSite: "none"},
}))

try {
    app.use(bodyParser.json({
        limit: '50mb',
        extended: true
    }));
} catch {
    app.status(400)
    res.send({statut: "Erreur", message: "JSON incorrect"});
    return;
}

app.listen(3001, () => {
    console.log("Serveur démarré sur le port 3001");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Authentification
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Cette fonction permet de faire une requête au serveur d'authentification
 * @param method 'POST' | 'GET' | 'PATCH'
 * @param action 'register' | 'login' | 'logout' | 'verify' | 'update'
 * @param body
 * @param params
 * @param headers
 * @return {Promise<any>}
 * @throws {Error}
 */
const auth = async (req, method, action, body, params = "", headers = {}) => {
    let response = {}
    let responseJson = {}
    console.log("connection to auth...")
    try {
        response = await fetch(`http://auth:3000/${action}${params}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: JSON.stringify(body),
        });
        responseJson = await response.json()
    } catch (e) {
        if (req.session.token) {
            if (headers.token != req.session.token) {
                throw new Error("Le token est corrompu")
            }
            const identifiant = await expTokenVerification(headers.token)
            response.status = 200;
            responseJson.status = "Succès"
            responseJson.message = "Token valide";
            responseJson.utilisateur = {
                identifiant: identifiant
            }
        } else {
            response.status = 500;
            responseJson.message = e;
        }
    }
    if (response.status === 200 || response.status === 201) {
        console.log("success connection to auth")
        return responseJson;
    } else {
        console.error("failed connection to auth")
        throw new Error(responseJson.message);
    }
}


/**
 * Cette fonction permet de vérifier si un token est valide
 * @param {string} jeton - Le token JWT à vérifier
 * @throws {Promise<Error>} Si le token est invalide ou si l'utilisateur n'est pas trouvé
 * @return {Promise<string>} Une promesse qui résout avec l'identifiant du compte
 */
function expTokenVerification(jeton) {
    return new Promise((resolve, reject) => {
        try {
            const token = jwt.verify(jeton, process.env.SECRET_KEY_AUTH);

            if (!token.iat || !token.exp || !token.identifiant) {
                return reject(new Error("Element manquant dans le token"));
            }
            if (new Date(token.iat) > new Date(Date.now())) {
                return reject(new Error("La date de création doit être inférieure à l'heure actuel"));
            }
            if (new Date(token.exp) < new Date(Date.now())) {
                return reject(new Error("La date d'expiration doit être supérieure à l'heure actuel"));
            }
            if (new Date(token.iat) > new Date(token.exp)) {
                return reject(new Error("La date d'expiration doit être supérieure à la date de création"));
            }
            resolve(token.identifiant);
        } catch (error) {
            reject(new Error("Échec de la vérification du token : " + error.message));
        }
    });
}

/**
 * Cette route permet de créer un compte
 * @req La requête
 * @res La réponse
 * @req.body {Object} Les données de la requête.
 * @req.body.identifiant {string} L'identifiant de l'utilisateur
 * @req.body.motdepasse {string} Le mot de passe de l'utilisateur
 * @return {Promise<{
 *  status: string,
 *  message: string
 *  }>
 */
app.post('/register', async (req, res) => {
    const {identifiant, motdepasse} = req.body;
    if (identifiant && motdepasse) {
        auth(req, "POST", "register", {identifiant, motdepasse})
            .then((response) => {
                res.status(200).send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
    }
})

/**
 * Cette route permet de connecter un utilisateur
 * @req La requêtecd
 * @res La réponse
 * @req.body {Object} Les données de la requête.
 * @req.body.identifiant {string} L'identifiant de l'utilisateur
 * @req.body.motdepasse {string} Le mot de passe de l'utilisateur
 * @return {Promise<{
 *   status: string,
 *   jeton: string
 *   } | {
 *       status: string,
 *       message: string
 *   }>
 */
app.post('/login', async (req, res) => {
    const {identifiant, motdepasse} = req.body;
    if (identifiant && motdepasse) {
        auth(req, "POST", "login", {identifiant, motdepasse})
            .then((response) => {
                req.session.token = response.message;
                res.status(200).send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
    }
});

/**
 * Cette route permet de déconnecter un utilisateur
 * @req La requête
 * @res La réponse
 * @req.cookies.token {string} Le jeton de l'utilisateur
 * @return {Promise<{
 *   status: string,
 *   message: string
 *   } >
 */
app.get('/logout', async (req, res) => {
    const {token} = req.query
    if (token) {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({status: "Erreur", message: "Une erreur est survenue"});
            } else {
                res.status(200).send({status: "Succès", message: "Vous avez été déconnecté"});
            }
        })
    } else {
        res.status(401).send({status: "Erreur", message: "Jeton inconnu"});
    }
});

/**
 * Cette fonction permet de vérifier si un token est valide
 * @param token {string} Le jeton de l'utilisateur
 * @throws {Error}
 * @return {Promise<{
 *     status: string,
 *     message: string
 * } | {
 *     status: string,
 *     message: string,
 *     utilisateur: {
 *     identifiant: string
 *     }
 * }
 * >}
 */
async function verify(token, req) {
    if (token) {
        return await auth(req, "POST", "verify", {}, "", {token: token})
    } else {
        throw new Error("Token manquant")
    }
}

/**
 * Cette route permet de vérifier si un token est valide
 * @req La requête
 * @res La réponse
 * @req.headers.token {string} Le jeton de l'utilisateur
 * @return {Promise<{
 *  status: string,
 *  message: string
 *  } | {
 *     status: string,
 *     message: string,
 *     utilisateur: {
 *     identifiant: string
 *     }
 * }
 * >
 */
app.post('/verify', async (req, res) => {
    const {token} = req.headers;

    if (token) {
        verify(token, req)
            .then((response) => {
                res.status(200).send(response);
            }).catch((error) => {
            console.log("error", error.message)
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(401).send({status: "Erreur", message: "Token manquant"});
    }
});

/**
 * Cette route permet de supprimer un compte en fonction de son identifiant
 * @param id
 * @return {Promise<{
 *   status: string,
 *   message: string
 *   }>
 */
app.patch('/update', async (req, res) => {
    const {identifiant, motdepasse} = req.body;
    const {token} = req.headers;
    const id = req.query.id;

    /**
     * Cette fonction permet de mettre à jour un champ de l'utilisateur
     * @param field {string} 'identifiant' | 'motdepasse' Le champ à mettre à jour
     * @param value {string} La nouvelle valeur du champ
     */
    const update = (field, value) => {
        verify(token, req)
            .then(() => {
                let updateData = {};
                if (field === 'identifiant') {
                    updateData = {identifiant: value};
                } else if (field === 'motdepasse') {
                    updateData = {motdepasse: value};
                }
                auth(req, "PATCH", "update", updateData, `?id=${id}`)
                    .then((response) => {
                        res.status(200).send(response);
                    }).catch((error) => {
                    res.status(401).send({status: "Erreur", message: error.message});
                });
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        })
    };

    if (identifiant && id) {
        update('identifiant', identifiant);
    } else if (motdepasse && id) {
        update('motdepasse', motdepasse);
    } else {
        res.status(401).send({status: "Erreur", message: "L'identifiant, l'id ou le mot de passe n'est pas défini"});
    }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Système itinéraires
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.use((req, res, next) => {
    // S'il y a déjà une variable req.db, on continue
    // Il n'y a pas de raison.
    if (req.db) {
        next();
    } else {
        req.db = new sqlite3.Database('itineraries');

        // Creation de la table inineraire si elle n'existe pas
        req.db.run("CREATE TABLE IF NOT EXISTS itinerary (\
            id INTEGER PRIMARY KEY AUTOINCREMENT, \
            identifier VARCHAR(100) NOT NULL, \
            name VARCHAR(255) NOT NULL\
            )");

        // Création de la table itinerary_route si elle n'existe pas
        req.db.run("CREATE TABLE IF NOT EXISTS itinerary_route (\
            id INTEGER PRIMARY KEY AUTOINCREMENT, \
            itinerary_id INTEGER NOT NULL, \
            lon FLOAT NOT NULL, \
            lat FLOAT NOT NULL, \
            FOREIGN KEY (itinerary_id) REFERENCES itinerary(id) ON DELETE CASCADE\
            )");
        next();
    }
});

/**
 * Cette route permet de récupérer les données de l'api open data
 * @param limit {number}
 * @param offset {number}
 * @return {Promise<
 *  {
 *   total_count: number,
 *   results: [
 *       {
 *          stationcode: string,
 *          name: string,
 *          is_installed: string,
 *          capacity: number,
 *          numdocksavailable: number,
 *          numbikesavailable: number,
 *          mechanical: number,
 *          ebike: number,
 *          is_renting: string,
 *          is_returning: string,
 *          duedate: Date,
 *          coodonnees_geo: {
 *              lon: number,
 *              lat: number
 *          },
 *          nom_arrondissement_communes: string,
 *          code_insee_commune: string
 *       }
 *   ]
 *  } | Error>
 */
const openData = async (limit, offset) => {
    const response = await fetch(`https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=${limit}&offset=${offset}&refine=nom_arrondissement_communes%3AParis&exclude=is_renting%3ANON`, {
        method: "GET"
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw new Error(responseJson.message);
    }
}

/**
 * Cette route permet de récupérer toutes les stations de vélib
 * @return {Promise<
 *  {
 *   total_count: number,
 *   results: [
 *       {
 *          stationcode: string,
 *          name: string,
 *          is_installed: string,
 *          capacity: number,
 *          numdocksavailable: number,
 *          numbikesavailable: number,
 *          mechanical: number,
 *          ebike: number,
 *          is_renting: string,
 *          is_returning: string,
 *          duedate: Date,
 *          coodonnees_geo: {
 *              lon: number,
 *              lat: number
 *          },
 *          nom_arrondissement_communes: string,
 *          code_insee_commune: string
 *       }
 *   ]
 *  }>
 */
app.get('/stations', async (req, res) => {
    const {token} = req.headers;

    verify(token, req)
        .then(async () => {
            let allStation = [];
            let offset = 0;
            const limit = 100;
            let total_count = 0;

            try {
                // On récupère d'abord le nombre de stations
                const initialData = await openData(limit, offset);
                total_count = initialData.total_count;
                allStation = initialData.results;
                // La limite de l'api est fixé à 100, on doit donc faire plusieurs requêtes pour récupérer toutes les stations
                while (allStation.length < total_count) {
                    offset += limit;
                    const nextData = await openData(limit, offset);
                    allStation = allStation.concat(nextData.results);
                }
                res.send(allStation);
            } catch (error) {
                res.status(500).send({
                    status: "Erreur",
                    message: "Une erreur est survenue lors de la récupération des stations"
                });
            }
        })
        .catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
});

const getId = async (identifier) =>  {
    const response = await fetch(`http://auth:3000/compteId?identifiant=${identifier}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    });
    const responseJson = await response.json()
    if (responseJson.status === "Succès") {
        return responseJson.message;
    } else {
        console.log("responseJson", ici)
        throw new Error("id was not get")
    }
}

/**
 * Cette route permet de créer un itinéraire
 * @return {Promise<{
 *    status: string,
 *    message: string
 *    }>
 */
app.post('/itinerary', async (req, res) => {
    const {token} = req.headers;

    try {
        const result = await verify(token, req);
        const identifier = result.utilisateur.identifiant;
        const {name, points, image} = req.body;
        if (identifier && name && points && image) {
            const id = await getId(identifier);

            if (id) {
                let sql = req.db.prepare("INSERT INTO itinerary (identifier, name) VALUES (?, ?)");

                await sql.run([id, name], async function (err) {
                    if (err) {
                        res.status(401).send({
                            status: "Erreur",
                            message: "Une erreur est survenue lors de la création de l'itinéraire"
                        });
                        return;
                    }

                    let newItineraryId = this.lastID === 0 ? 1 : this.lastID;
                    
                    sql.finalize();

                    await Promise.all(points.map(async (point) => {
                        let stepSql = req.db.prepare("INSERT INTO itinerary_route (itinerary_id, lon, lat) VALUES (?, ?, ?)");
                        stepSql.run([newItineraryId, point.lon, point.lat], (err) => {
                            if (err) {
                                console.log(err)
                                res.status(401).send({
                                    status: "Erreur",
                                    message: "Une erreur est survenue lors de la création d'une étape de l'itinéraire'"
                                });
                                return;
                            }
                            stepSql.finalize();
                        });
                    }))

                    fetch(`http://pdf:3002/itinerary`, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({itinerary: newItineraryId, name, points, image}),
                    });

                    res.status(201).send({status: "Succès", message: "Itinéraire enregistré"});
                });
            } else {
                res.status(401).send({
                    status: "Erreur",
                    message: "L'utilisateur n'existe pas"
                });
            }
        } else {
            res.status(400).send({
                status: "Erreur",
                message: "L'identifiant, le nom les étapes ou l'image du trajet ne sont pas définis"
            });
        }
    } catch (e) {
        res.status(401).send({status: "Erreur", message: e.message});
    }
});

/**
 * Cette route permet de récupérer un itinéraire en fonction de son identifiant
 * @return {Promise<{
 *     status: string,
 *     itinerary: {
 *     identifier: string,
 *     name: string,
 *     steps: [
 *         {
 *             lon: number,
 *             lat: number,
 *             route_index: number,
 *             address: string
 *         }
 *     ]
 * } |
 *  {
 *      status: string,
 *      message: string
 *  }
 * >}
 */
app.get("/itineraries", async (req, res) => {
    const {token} = req.headers;

    try {
        const result = await verify(token, req);
        const identifier = result.utilisateur.identifiant;

        if (!identifier) {
            res.status(400).send({status: "Erreur", message: "L'identifiant n'est pas défini"});
            return;
        }

        console.log("recuperation de l'id", identifier)
        const id = await getId(identifier);

        if (!id) {
            res.status(401).send({
                status: "Erreur",
                message: "L'utilisateur n'existe pas"
            });
            return;
        }

        const sql = `
            SELECT it.id AS itinerary_id,
                   it.identifier,
                   it.name,
                   ir.id AS step_id,
                   ir.lon,
                   ir.lat
            FROM itinerary it
                     LEFT JOIN itinerary_route ir ON it.id = ir.itinerary_id
            WHERE it.identifier = ?
        `;

        const rows = await new Promise((resolve, reject) => {
            req.db.all(sql, [id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const itineraries = []

        if (rows.length === 0) {
            res.status(404).send({status: "Erreur", message: "Aucun itinéraire trouvé pour cet identifiant"});
            return;
        }

        let itinerary = {
            identifier: rows[0].identifier,
            name: rows[0].name,
            steps: []
        };
        let previousItineraryId = rows[0].itinerary_id

        for (const row of rows){
            if (previousItineraryId !== row.itinerary_id) {
                itineraries.push(itinerary);
                itinerary = {
                    identifier: row.identifier,
                    name: row.name,
                    steps: []
                };
            }
            previousItineraryId = row.itinerary_id

            if (!itinerary.pdf && !itinerary.status && !itinerary.message) {
                const response = await fetch(`http://pdf:3002/itinerary?id=` + row.itinerary_id, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const data = await response.json();
                        itinerary.status = data.status;
                        itinerary.message = data.message;
                        if (data.pdfBase64) {
                            itinerary.pdf = data.pdfBase64;
                        }
                    } else {
                        itinerary.status = "Erreur";
                        itinerary.message = "Type de contenu inconnu";
                    }
                } else {
                    itinerary.status = "Erreur";
                    itinerary.message = "Une erreur est survenue lors de la récupération du pdf";
                }
            }

            itinerary.steps.push({
                lon: row.lon,
                lat: row.lat
            });

            if (rows.indexOf(row) === rows.length - 1) {
                itineraries.push(itinerary);
            }
        }

        res.status(200).send({status: "Succès", itineraries});

    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "Erreur",
            message: "Une erreur est survenue lors de la récupération des itinéraires"
        });
    }
});


/**
 * Cette route permet de supprimer un itinéraire en fonction de son identifiant
 * @param id
 * @return {Promise<{
 *    status: string,
 *    message: string
 *    }>
 */
app.delete("/itinerary/:id", async (req, res) => {
    const {token} = req.headers;

    try {
        await verify(token, req);
    } catch (e) {
        res.status(401).send({status: "Erreur", message: e.message});
        return;
    }
    const id = req.params.id;
    if (id) {
        const sql = req.db.prepare("DELETE FROM itinerary WHERE id = ?");
        sql.run([id], (err) => {
            if (err) {
                res.status(400).send({
                    status: "Erreur",
                    message: "Une erreur est survenue lors de la suppression de l'itinéraire"
                });
                return;
            }
            sql.finalize();
            res.status(200).send({status: "Succès", message: "Itinéraire supprimé"});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant n'est pas défini"});
    }
});


