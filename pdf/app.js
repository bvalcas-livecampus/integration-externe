const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const fs = require('fs');
const path = require('path');
const PuppeteerHTMLPDF = require("puppeteer-html-pdf");

const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de donnée.

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors())

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

const db = new sqlite3.Database('itineraire_pdf', (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données:', err.message);
    } else {
        // Création de la table "pdf" si elle n'existe pas
        db.run(`CREATE TABLE IF NOT EXISTS pdf (
            id_itineraire INTEGER PRIMARY KEY NOT NULL,
            url VARCHAR(255) NOT NULL,
            status VARCHAR(10) NOT NULL
            )`, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table pdf:', err.message);
            } else {
                console.log('Table "pdf" créée avec succès.');
            }
        });
    }
});

app.use((req, res, next) => {
    if (req.db) {
        next();
    } else {
        req.db = db;
        next();
    }
});

/**
 * Cette fonction permet de récupérer les données de l'api adresse
 * @param lon {number}
 * @param lat {number}
 * @throws {Error}
 * @return {Promise<{
 *     type: "FeatureCollection",
 *     version: "draft",
 *     features: Array<{
 *       type: "Feature",
 *       geometry: {
 *         type: "Point",
 *         coordinates: [number, number]
 *       },
 *      properties: {
 *         label: string,
 *         score: number,
 *         housenumber: string,
 *         id: string,
 *         type: string,
 *         name: string,
 *         postcode: string,
 *         citycode: string,
 *         x: number,
 *         y: number,
 *         city: string,
 *         context: string,
 *         importance: number,
 *         street: string
 *       }
 *     }>
 */
const api_adresse = async (lon, lat) => {
    const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`, {
        method: "GET"
    });
    if (response.ok) {
        const responseJson = await response.json();
        return responseJson;
    } else {
        const responseJson = await response.json();
        throw new Error(responseJson.message);
    }
}

/**
 * Cette route permet de créer un pdf
 * @req La requête
 * @res La réponse
 * @req.body {Object} Les données de la requête.
 * @req.body.itinerary {number} L'id de l'itinéraire
 * @req.body.name {string} Le nom de l'itinéraire
 * @req.body.points {Array<{lon: number, lat: number}>} Les points de l'itinéraire
 * @req.body.image {string} L'image de l'itinéraire
 */
app.post('/itinerary', async (req, res) => {
    const {itinerary, name, points, image} = req.body;
    if (itinerary && name && points && image) {
        const htmlPDF = new PuppeteerHTMLPDF();
        try {
            const dirPath = path.join(__dirname, 'public');
            fs.mkdir(dirPath, { recursive: true }, (err) => {
                if (err) {
                    throw new Error('Error creating directory:', err);
                }
            });
        } catch (e) {
            res.status(400).send({
                statut: "Erreur",
                Message: "Une erreure est survenue lors de l'ajout du pdf : " + err
            })
            return ;
        }
        const url = `./public/` + itinerary + ' - ' + name + '.pdf';
        const options = {
            format: "A4",
            path: url,
        };
        await htmlPDF.setOptions(options);

        let sql = req.db.prepare("INSERT INTO pdf VALUES (?, ?, ?)", [itinerary, url, "Creating"])
        sql.run((err) => {
            if (err) {
                console.error('Une erreure est survenue lors de l\'ajout du pdf dans la bdd : ' + err);
                res.status(400).send({
                    statut: "Erreur",
                    Message: "Une erreure est survenue lors de l'ajout du pdf : " + err
                })
                return;
            }
            console.log("Pdf ajouté à la bdd");
            sql.finalize();
        })

        let content = "<h1>" + name + "</h1>"

        res.status(204).send({statut: "Succès", message: ''});

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        await Promise.all(points.map(async (coordinates, index) => {
            await delay(((index + 1) / 50) * 1000);
            const info = await api_adresse(coordinates["lon"], coordinates['lat'])
            content += "<p>Allez à " + info.features[0].properties.label + "</p>";
        }));

        content += `<img src="${image}" style="width: 100%; height: auto;" />`;

        try {
            await htmlPDF.create(content)
            let sql = req.db.prepare("UPDATE pdf set status = 'Finished' WHERE id_itineraire = ?", [itinerary])
            sql.run((err) => {
                if (err) {
                    console.error('Une erreur est survenue lors de la maj du status du pdf dans la bdd : ' + err);
                    return;
                }
                console.log("Status du pdj mis à jour");
                sql.finalize();
            })
        } catch (error) {
            console.log("Erreur lors de la création de pdf : ", error)
            let sql = req.db.prepare("UPDATE pdf set status = 'Error' WHERE id_itineraire = ?", [itinerary])
            sql.run((err) => {
                if (err) {
                    console.error('Une erreur est survenue lors de la maj du status du pdf dans la bdd : ' + err);
                    return;
                }
                console.log("Status du pdf mis à jour");
                sql.finalize();
            })
        }
    } else {
        res.status(400).send({statut: "Erreur", message: "Les paramètres ne sont pas définis"});
        return;
    }
})

/**
 * Cette route permet de récupérer un pdf
 * @param id {number} : id de l'itinéraire
 * @return {Promise<{status: string, message: string} | >}
 */
app.get('/itinerary', async (req, res) => {
    const id = req.query.id;
    if (id) {
        let sql = req.db.prepare("SELECT url, status FROM pdf WHERE id_itineraire = ?", [id])
        sql.get(async (err, result) => {
            if (err) {
                console.error('Une erreure est survenue lors de la récupération du pdf dans la bdd : ' + err);
                res.status(500).json({
                    statut: "Erreur",
                    Message: "Une erreure est survenue lors de la récupération du pdf : " + err
                })
                return;
            }

            if (!result || !result.url || !fs.existsSync(result.url)) {
                console.error("Le pdf n'existe pas");
                res.status(404).json({status: "Erreur", message: "Le pdf n'existe pas."})
                return;
            } else {
                const status = result.status;
                if (status) {
                    if (status === "Creating") {
                        res.status(200).json({statut: "En cours", message: "Le pdf est en cours de création"});
                    } else if (status === "Error") {
                        res.status(500).json({
                            statut: "Erreur",
                            message: "Une erreur est survenue lors de la création du pdf"
                        });
                    } else {
                        res.type('application/pdf')
                        const data = fs.readFileSync(result.url);
                        res.writeHead(200, {
                            'Content-Type': 'application/pdf',
                            'Content-disposition': 'attachment;filename=' + result.url,
                            'Content-Length': data.length
                        });
                        res.end(Buffer.from(data));
                    }
                } else {
                    res.status(404).json({statut: "Erreur", message: "Le pdf n'existe pas"});
                }
            }
        })
    } else {
        res.status(400).json({statut: "Erreur", message: "L'id n'est pas défini"});
    }
})


const server = app.listen(3002, () => {
    console.log("Le serveur PDF écoute sur le port 3002");
});
