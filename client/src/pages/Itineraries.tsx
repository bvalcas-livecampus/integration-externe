import { useEffect, useState } from "react";
import api from "../helper/api.ts";
import {MapContainer, TileLayer, Marker, Popup, useMapEvent} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import '../app.css';
import Spinner from "../components/Spinner.tsx";

const MapClickHandler = ({ onMapClick }) => {
    // Utilisation du hook useMapEvent pour gérer le clic sur la carte
    useMapEvent('click', onMapClick);
    return null; // Ce composant ne rend rien directement sur la carte
};

const Itineraries = () => {
    const [stations, setStations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [markers, setMarkers] = useState([]);

    console.log(markers)

    useEffect(() => {
        api("GET", "stations").then(stations => {
            setStations(stations);
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            setIsLoading(false);
        });
    }, []);

    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setMarkers([...markers, { lat, lng }]);
    };

    if (isLoading) {
        return (
            <>
                <p>Les stations sont en cours de chargement, veuillez patienter</p>
                <Spinner />
            </>
        );
    }

    if (stations.length === 0) {
        return <p>Il n'y a pas de stations disponibles</p>;
    }

    return (
        <MapContainer id="map-all-stations" center={[48.85, 2.26]} zoom={10} scrollWheelZoom={false} preferCanvas={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stations.map((station, index) => {
                if (station.coordonnees_geo) {
                    return (
                        <Marker
                            key={`${station.stationcode}-${index}`}
                            position={[station.coordonnees_geo.lat, station.coordonnees_geo.lon]}
                        >
                            <Popup>
                                <p>Nom de la station : {station.name}</p>
                                <p>Capacité : {station.capacity}</p>
                                <p>Nombre de vélo disponible : {station.numbikesavailable}</p>
                                <p>Capacité de rangement disponible : {station.numdocksavailable}</p>
                            </Popup>
                        </Marker>
                    );
                } else {
                    return null;
                }
            })}
            {markers.map((marker, index) => {
                return (
                    <Marker key={`marker-${index}`} position={[marker.lat, marker.lng]}>
                        <Popup>
                            <p>Latitude : {marker.lat}</p>
                            <p>Longitude : {marker.lng}</p>
                        </Popup>
                    </Marker>
                );
            })}
            <MapClickHandler onMapClick={handleMapClick} />
        </MapContainer>
    );
};

export default Itineraries;
