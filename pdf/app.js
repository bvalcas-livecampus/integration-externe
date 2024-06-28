const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const fs = require('fs');
const PuppeteerHTMLPDF = require("puppeteer-html-pdf");

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
    res.send({ statut: "Erreur", message: "JSON incorrect" });
    return ;
}
app.use((req, res, next) => {
    // S'il y a déjà une variable req.db, on continue
    // Il n'y a pas de raison.
    if(req.db) {
        next();
    } else {
        req.db = new sqlite3.Database('pdf');
        
        // Creation de la table compte si elle n'existe pas
        req.db.run("CREATE TABLE IF NOT EXISTS pdf (\
            id_itineraire integer NOT NULL, \
            url VARCHAR(255) NOT NULL, \
            status varchar(10) NOT NULL,\
            PRIMARY KEY (id_itineraire) )");
    
        next();
    }
});

/**
 * Cette fonction permet de récupérer les données de l'api adresse
 * @param lon {number}
 * @param lat {number}
 * @return {Promise<
*  {
*   "type":"FeatureCollection",
*   "version":"draft",
*   "features":[
*   {
*       "type":"Feature",
*       "geometry":{
*           "type":"Point",
*           "coordinates":[
*               2.290084,
*               49.897443
*           ]
*       },
*       "properties":{
*           "label":"8 Boulevard du Port 80000 Amiens",
*           "score":0.49159121588068583,
*           "housenumber":"8",
*           "id":"80021_6590_00008",
*           "type":"housenumber",
*           "name":"8 Boulevard du Port",
*           "postcode":"80000",
*           "citycode":"80021",
*           "x":648952.58,
*           "y":6977867.25,
*           "city":"Amiens",
*           "context":"80, Somme, Hauts-de-France",
*           "importance":0.6706612694243868,
*           "street":"Boulevard du Port"
*       }
*   }
*  } | Error>
*/
const api_adresse = async (lon, lat) => {
    const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`, {
        method: "GET"
    });
    if (response.ok) {
        const responseJson = await response.json();
        return responseJson;
    }
    else {
        const responseJson = await response.json();
        throw new Error(responseJson.message);
    }
}


// creation du pdf
app.post('/itinerary', async (req, res) => {
    const {itinerary, name, points} = req.body;
    const htmlPDF = new PuppeteerHTMLPDF();
    const url = `./public/` + itinerary + ' - ' + name + '.pdf';
    const options = {
        format: "A4",
        path: url, 
    };
    htmlPDF.setOptions(options);

    let sql = req.db.prepare("INSERT INTO pdf VALUES (?, ?, ?)", [itinerary, url, "Creating"])
    sql.run((err) => {
        if (err){
            console.error('Une erreure est survenue lors de l\'ajout du pdf dans la bdd : ' + err);
            return ;
        }
        console.log("Pdf ajouté à la bdd");
        sql.finalize();
    })
    
    let content = "<h1>" + name + "</h1>"

    res.status(204);
    res.send();
    
    await Promise.all(points.map( async (coordinates) => {
        const info = await api_adresse(coordinates["lon"], coordinates['lat'])
        content = content + "<p>Aller à " + info.features[0].properties.street + "</p>";
    }));

    try {
        await htmlPDF.create(content)
        let sql = req.db.prepare("UPDATE pdf set status = 'Finished' WHERE id_itineraire = ?", [itinerary])
        sql.run((err) => {
            if (err){
                console.error('Une erreure est survenue lors de la maj du status du pdf dans la bdd : ' + err);
                return ;
            }
            console.log("Status du pdj mis à jour");
            sql.finalize();
        })
    } catch (error){
        console.log("Erreur lors de la création de pdf : ", error)
        let sql = req.db.prepare("UPDATE pdf set status = 'Error' WHERE id_itineraire = ?", [itinerary])
        sql.run((err) => {
            if (err){
                console.error('Une erreure est survenue lors de la maj du status du pdf dans la bdd : ' + err);
                return ;
            }
            console.log("Status du pdj mis à jour");
            sql.finalize();
        })
    }
})

// récupération du pdf
app.get('/itinerary', async (req, res) => {
    const id = req.query.id;

    let sql = req.db.prepare("SELECT url FROM pdf WHERE id_itineraire = ?", [id])
    sql.get( async (err, result) => {
        if (err){
            console.error('Une erreure est survenue lors de la récupération du pdf dans la bdd : ' + err);
            res.status(401);
            res.send({statut : "Erreur", Message : "Une erreure est survenue lors de la récupération du pdf."})
            return ;
        }
        if(!result.url || !fs.existsSync(result.url)) {
            console.error("Le pdf n'existe pas");
            res.status(401);
            res.send({ status: "Erreur", message: "Le pdf n'existe pas." })
            return ;
        }
        
        res.download(result.url, 'itineraire.pdf', (err) => {
            if (err) {
                res.status(402);
                console.log(err)
                res.send({status : "Erreur", message : "Erreur lors du téléchargement"});
                return
            }
        });
    })
})


var server = app.listen(3002, () => {
    console.log("On écoute sur le port 3002");
});
