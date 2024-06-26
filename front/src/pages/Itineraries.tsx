import {useEffect, useRef, useState} from "react";
import api from "../helper/api.ts";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import '../app.css';

const Itineraries = () => {
    const [stations, setStations] = useState([]);
    
    /**
 * Récupère toutes les stations de vélos de Paris
 */
    const getAllStation = async () => {
        let allStation = [];
        let offset = 0;
        const limit = 100;
        let total_count = 0;

        try {
            // On récupère d'abord le nombre de stations
            const initialData = await api.openData(limit, offset);
            total_count = initialData.total_count;
            allStation = initialData.results;
            // La limite de l'api est fixé à 100, on doit donc faire plusieurs requêtes pour récupérer toutes les stations
            while (allStation.length < total_count) {
                offset += limit;
                const nextData = await api.openData(limit, offset);
                allStation = allStation.concat(nextData.results);
            }

            return allStation;
        } catch (error) {
            console.error(error);
        }
    }   
    
    useEffect(() => {
        getAllStation().then(stations => {
            setStations(stations);
        }).catch((err) => {
            console.error(err);
        })
    }, [])
    //console.log(stations);
    return (
        <div>
            <p>
            Itinéraire :
            </p>
            <MapContainer id="map-all-stations" center={[48.85, 2.26]} zoom={10} scrollWheelZoom={false} preferCanvas={true} renderer={L.canvas()}>
                <>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {stations.map((station, index) => {
                    return <Marker key={`${station.stationcode}-${index}`} position={[station.coordonnees_geo.lat, station.coordonnees_geo.lon]}>
                        <Popup>
                            <p>Nom de la station : {station.name}</p>
                            <p>Capacité : {station.capacity}</p>
                            <p>Nombre de vélo disponible : {station.numbikesavailable}</p>
                            <p>Capacité de rangement disponible : {station.numdocksavailable}</p>
                        </Popup>
                    </Marker>
                })}
                
                </>
            </MapContainer>
            {/* <iframe src="https://opendata.paris.fr/explore/embed/dataset/velib-disponibilite-en-temps-reel/map/?disjunctive.name&disjunctive.is_installed&disjunctive.is_renting&disjunctive.is_returning&disjunctive.nom_arrondissement_communes&basemap=jawg.dark&location=8,49.25499,2.90588&static=false&datasetcard=false&scrollWheelZoom=false" width="400" height="300" frameborder="0"></iframe>  */}
        </div>
    )
}

export default Itineraries