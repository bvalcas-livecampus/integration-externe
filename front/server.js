const express = require('express');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();

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

app.listen(3001, () => {
    console.log("Serveur démarré sur le port 3001");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Authentification
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const auth = async (method, action, body, params) => {
    const response = await fetch(`http://localhost:3000/${action}${params}`, {
        method,
        headers: {
            "Content-Type": "application/json",
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

app.get('/logout', async (req, res) => {
    const {jeton} = req.body;
    if (jeton) {
        auth("GET", "logout", {jeton})
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(401).send({status: "Erreur", message: "Jeton inconnu"});
    }
});

app.post('/verify', async (req, res) => {
    const {jeton} = req.body;
    if (jeton) {
        auth("POST", "verify", {jeton})
            .then((response) => {
                res.send(response);
            }).catch((error) => {
            res.status(401).send({status: "Erreur", message: error.message});
        });
    } else {
        res.status(401).send({status: "Erreur", message: "Jeton inconnu"});
    }
});

app.patch('/update/:id', async (req, res) => {
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

app.post('/itinerary', async (req, res) => {
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

app.get("/itinerary", async (req, res) => {
    const {identifier} = req.body;
    if (identifier) {
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
        req.db.all(sql, [identifier], (err, rows) => {
            if (err) {
                res.status(400).send({
                    status: "Erreur",
                    message: "Une erreur est survenue lors de la récupération des itinéraires"
                });
                return;
            }
            const itinerary = {};
            for (const row of rows) {
                if (!itinerary[row.identifier]) {
                    itinerary[row.identifier] = {
                        name: row.name,
                        steps: [],
                    };
                } else {
                    fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${row.lon}&lat=${row.lat}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.features.length > 0) {
                                const address = data.features[0].properties.label;
                                itinerary[row.identifier].steps.push({
                                    id: row.step_id,
                                    lon: row.lon,
                                    lat: row.lat,
                                    route_index: row.route_index,
                                    address,
                                });
                            }
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            }
            res.send({status: "Succès", itinerary});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant n'est pas défini"});
    }
});

app.delete("/itinerary/:id", async (req, res) => {
    const id = req.body.params;
    if (id) {
        const sql = req.db.prepare("DELETE FROM itinerary WHERE id = ?");
        sql.run([id], (err) => {
            if (err) {
                res.status(400).send({status: "Erreur", message: "Une erreur est survenue lors de la suppression de l'itinéraire"});
                return;
            }
            sql.finalize();
            res.send({status: "Succès", message: "Itinéraire supprimé"});
        });
    } else {
        res.status(400).send({status: "Erreur", message: "L'identifiant n'est pas défini"});
    }
});


