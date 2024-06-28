const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const sqlite3 = require('sqlite3').verbose();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());

app.use(cors())

try {
    app.use(bodyParser.json());
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
 * @return {Promise<any>}
 */
const auth = async (method, action, body, params = "", headers = {}) => {
    const response = await fetch(`http://localhost:3000/${action}${params}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        body: JSON.stringify(body),
    });
    const responseJson = await response.json();
    if (response.status === 200 || response.status === 201) {
        return responseJson;
    } else {
        throw new Error(responseJson.message);
    }
}

/**
 * Cette fonction permet de créer un compte
 * @return {Promise<{
 *  status: string,
 *  message: string
 *  }>
 */
app.post('/register', async (req, res) => {
    const {identifiant, motdepasse} = req.body;
    if (identifiant && motdepasse) {
        auth("POST", "register", {identifiant, motdepasse})
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
    }
})

/**
 * Cette fonction permet de connecter un utilisateur
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
        auth("POST", "login", {identifiant, motdepasse})
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant ou le mot de passe n'est pas défini"});
    }
});

/**
 * Cette fonction permet de déconnecter un utilisateur
 * @return {Promise<{
 *   status: string,
 *   message: string
 *   }>
 */
app.get('/logout', async (req, res) => {
    const {token} = req.headers;
    if (token) {
        auth("GET", "logout", {token})
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(401).send({status: "Erreur", message: "Jeton inconnu"});
    }
});

/**
 * Cette fonction permet de vérifier un jeton
 * @return {Promise<{
 *    status: string,
 *    message: string
 *    }>
 */
app.post('/verify', async (req, res) => {
    const {token} = req.headers;
    
    if (token) {
        auth("POST", "verify", {}, "", {
            token: token
        })
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(401).send({status: "Erreur", message: "Le token est manquant"});
    }
});

async function verify(token) {
    if (token) {
        await auth("POST", "verify", {}, "", { token: token })
    } else {
        throw new Error("Token manquant")
    }
}

/**
 * Cette fonction permet de supprimer un compte en fonction de son identifiant
 * @param id
 * @return {Promise<{
 *   status: string,
 *   message: string
 *   }>
 */
app.patch('/update/:id', async (req, res) => {
    try {
        await verify(token);
    } catch (e) {
        res.status(401).send({
            status: "Erreur",
            message: e.message
        });
        return ;
    }
    const {identifiant, motdepasse} = req.body;
    const id = req.params.id;
    if (identifiant && id) {
        auth("PATCH", "update", {identifiant}, `/${id}`)
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else if (motdepasse && id) {
        auth("PATCH", "update", {motdepasse}, `/${id}`)
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
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
            route_index INT NOT NULL, \
            FOREIGN KEY (itinerary_id) REFERENCES itinerary(id) ON DELETE CASCADE\
            )");
        next();
    }
});

/**
 * Cette fonction permet de récupérer les données de l'api open data
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
    const response = await fetch(`https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=${limit}&offset=${offset}`, {
        method: "GET"
    });
    if (response.ok) {
        const responseJson = await response.json();
        return responseJson;
    }
    else {
        throw new Error(responseJson.message);
    }
}

/**
 * Cette fonction permet de récupérer toutes les stations de vélib
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

    try {
        await verify(token);
    } catch (e) {
        res.status(401).send({
            status: "Erreur",
            message: e.message
        });
        return ;
    }
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
        res.status(500).send({status: "Erreur", message: "Une erreur est survenue lors de la récupération des stations"});
    }
});

/**
 * Cette fonction permet de créer un itinéraire
 * @return {Promise<{
 *    status: string,
 *    message: string
 *    }>
 */
app.post('/itinerary', async (req, res) => {
    const {token} = req.headers;

    try {
        await verify(token);
    } catch (e) {
        res.status(401).send({
            status: "Erreur",
            message: e.message
        });
        return ;
    }

    const {identifier, name, steps} = req.body;
    if (identifier && name && steps) {
        let sql = req.db.prepare("INSERT INTO itinerary (identifier, name) VALUES (?, ?)");

        sql.run([identifier, name], function (err) {
            if (err) {
                res.status(401).send({
                    status: "Erreur",
                    message: "Une erreur est survenue lors de la création de l'itinéraire"
                });
                return;
            }

            let newItineraryId = this.lastID;
            sql.finalize();

            for (const step of steps) {
                let stepSql = req.db.prepare("INSERT INTO itinerary_route (itinerary_id, lon, lat, route_index) VALUES (?, ?, ?, ?)");
                stepSql.run([newItineraryId, step.lon, step.lat, step.route_index], (err) => {
                    if (err) {
                        res.status(401).send({
                            status: "Erreur",
                            message: "Une erreur est survenue lors de la création d'une étape de l'iténiraire'"
                        });
                        return;
                    }
                    stepSql.finalize();
                });
            }

            res.send({status: "Succès", message: "Itinéraire enregistré",});
        });
    } else {
        res.status(400).send({
            status: "Erreur",
            message: "L'identifiant, le nom ou les étapes du trajet ne sont pas définis"
        });
    }
});

/**
 * Cette fonction permet de récupérer un itinéraire en fonction de son identifiant
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
app.get("/itinerary", async (req, res) => {
    const {token} = req.headers;

    try {
        await verify(token);
    } catch (e) {
        res.status(401).send({
            status: "Erreur",
            message: e.message
        });
        return ;
    }

    const {identifier} = req.body;
    if (!identifier) {
        res.status(400).send({status: "Erreur", message: "L'identifiant n'est pas défini"});
        return;
    }

    const sql = `
        SELECT it.id AS itinerary_id,
               it.identifier,
               it.name,
               ir.id AS step_id,
               ir.lon,
               ir.lat,
               ir.route_index
        FROM itinerary it
                 LEFT JOIN
             itinerary_route ir ON it.id = ir.itinerary_id
        WHERE it.identifier = ?
    `;

    try {
        const rows = await new Promise((resolve, reject) => {
            req.db.all(sql, [identifier], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        if (rows.length === 0) {
            res.status(404).send({status: "Erreur", message: "Aucun itinéraire trouvé pour cet identifiant"});
            return;
        }

        let itinerary = {
            identifier: rows[0].identifier,
            name: rows[0].name,
            steps: [],
        };

        for (const row of rows) {
            const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${row.lon}&lat=${row.lat}`);
            if (response.ok) {
                const data = await response.json();
                if (data.features.length > 0) {
                    const address = data.features[0].properties.label;
                    itinerary.steps.push({
                        lon: row.lon,
                        lat: row.lat,
                        route_index: row.route_index,
                        address,
                    });
                }
            }
        }

        res.send({status: "Succès", itinerary});

    } catch (error) {
        console.error(error);
        res.status(400).send({
            status: "Erreur",
            message: "Une erreur est survenue lors de la récupération des itinéraires"
        });
    }
});

/**
 * Cette fonction permet de supprimer un itinéraire en fonction de son identifiant
 * @param id
 * @return {Promise<{
 *    status: string,
 *    message: string
 *    }>
 */
app.delete("/itinerary/:id", async (req, res) => {
    const {token} = req.headers;

    try {
        await verify(token);
    } catch (e) {
        res.status(401).send({
            status: "Erreur",
            message: e.message
        });
        return ;
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
            res.send({status: "Succès", message: "Itinéraire supprimé"});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant n'est pas défini"});
    }
});


