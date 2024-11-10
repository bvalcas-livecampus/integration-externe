import {useRef, useState} from "react";
import api from "../helper/api.ts";
import {MapContainer, TileLayer, Marker, Popup, useMapEvent} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import '../app.css';
import Spinner from "../components/Spinner.tsx";
import map, {Station} from "../helper/map.ts";
import {toast} from "react-toastify";
import Input from "../components/Form/Input.tsx";
import CreateItineraryHelp from "../components/Itinerary/CreateItineraryHelp.tsx";
import Button from "../components/Button.tsx";
import domtoimage from 'dom-to-image';
import {LatLngExpression, LeafletMouseEvent} from "leaflet";

type MapClickHandlerProps = {
    onMapClick: (e: LeafletMouseEvent) => void;
}

const MapClickHandler = ({onMapClick}: MapClickHandlerProps) => {
    useMapEvent('click', onMapClick);
    return null;
};

enum Step {
    PreStart,
    Start,
    PreEnd,
    End,
    Custom
}

const CreateItineraries = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [filteredStations, setFilteredStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [markers, setMarkers] = useState<{
        lat: number;
        lon: number;
    }[]>([]);
    const step = useRef(Step.PreStart);
    const [name, setName] = useState("");
    const [preCreate, setPreCreate] = useState(false);
    const [create, setCreate] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const selectedStation = (coordonnees_geo: {
        lon: number;
        lat: number;
    }) => {
        const station = filteredStations.find(station => station.coordonnees_geo === coordonnees_geo);
        if (!station) {
            return;
        }
        const {lon, lat} = station.coordonnees_geo;
        setMarkers([...markers, {lat, lon}]);
        setFilteredStations([]);
    }

    const handleMapClick = (e: LeafletMouseEvent) => {
        const {lat, lng} = e.latlng;
        switch (step.current) {
            case Step.PreStart: {
                const filteredStations = map.filteredStations(stations, {lat, lon: lng});
                if (filteredStations.length > 0) {
                    setFilteredStations(map.filteredStations(stations, {lat, lon: lng}));
                    step.current = Step.Start;
                } else {
                    toast.error("Aucune station trouvée à cet endroit, veuillez cliquer sur une autre zone", {
                        position: "bottom-center"
                    });
                }
                break;
            }
            case Step.Start: {
                if (markers.length === 1) {
                    step.current = Step.PreEnd;
                }
                break;
            }
            case Step.PreEnd: {
                const filteredStations = map.filteredStations(stations, {lat, lon: lng});
                if (filteredStations.length > 0) {
                    setFilteredStations(map.filteredStations(stations, {lat, lon: lng}));
                    step.current = Step.End;
                } else {
                    toast.error("Aucune station trouvée à cet endroit, veuillez cliquer sur une autre zone", {
                        position: "bottom-center"
                    });
                }
                break;
            }
            case Step.End: {
                if (markers.length === 2) {
                    step.current = Step.Custom;
                }
                break;
            }
            case Step.Custom:
                setMarkers([...markers, {lat, lon: lng}]);
                break;
        }
    };

    const handleName = (newName: string) => {
        if (newName.trim().length === 0) {
            setErrorMessage("Le nom de l'itinéraire ne peut pas être vide");
        } else {
            setErrorMessage("");
            setName(newName);
        }
    }

    const reset = () => {
        setMarkers([]);
        setFilteredStations([]);
        step.current = Step.PreStart;
    }

    const onGenerateItinerary = async () => {
        try {
            const element = document.getElementById('map-all-stations');
            if (!element) {
                throw new Error("La carte n'a pas été trouvée");
            }

            const imageData = await domtoimage.toPng(element, {

                quality: 0.5
            });

            if (imageData) {
                api("POST", "itinerary", {
                    points: markers,
                    name: name,
                    image: imageData
                }).then((data) => {
                    reset();
                    setName("");
                    setPreCreate(false);
                    setCreate(false);
                    toast.success(data.message, {
                        position: "bottom-center"
                    })
                }).catch((err) => {
                    console.error("error post")
                    toast.error(err.message, {
                        position: "bottom-center"
                    })
                })
            } else {
                toast.error("aucune image à sauvegarer", {
                    position: "bottom-center"
                })
                console.error('no imageData');
            }
        } catch (error) {
            toast.error("Erreur lors de la capture d\'écran ", {
                position: "bottom-center"
            })
            console.error('Erreur lors de la capture d\'écran :', error);
        }
    }


    const onCreate = () => {
        if (name.trim().length === 0) {
            setErrorMessage("Le nom de l'itinéraire ne peut pas être vide");
            return;
        }
        setCreate(true);
        setIsLoading(true);
        api("GET", "stations").then(stations => {
            setStations(stations as Station[]);
        }).catch((err) => {
            toast.error(err.message, {
                position: "bottom-center"
            })
        }).finally(() => {
            setIsLoading(false);
        });
    }

    if (isLoading) {
        return (
            <>
                <p>Les stations sont en cours de chargement, veuillez patienter</p>
                <Spinner/>
            </>
        );
    }

    if (!preCreate) {
        return <Button onClick={() => setPreCreate(true)} buttonContent="Créer un itinéraire" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
    }

    if (preCreate && !create) {
        return (
            <div>
                <Input type="text" name="Le nom de votre itinéraire" errorMessage={errorMessage} handle={handleName}/>
                <Button onClick={() => onCreate()} buttonContent="Confirmer le nom de l'itinéraire" disabled={errorMessage.length > 0}/>
            </div>
        );
    }

    return (
        <div className="flex justify-center">
            <CreateItineraryHelp/>
            <MapContainer id="map-all-stations" center={map.getCenterStations(filteredStations) as LatLngExpression} zoom={13}
                          scrollWheelZoom={false} preferCanvas={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredStations.map((station, index) => {
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
                                    {(step.current === Step.End || step.current === Step.Start) && <Button onClick={() => selectedStation(station.coordonnees_geo)} buttonContent="Sélectionner"/>}
                                </Popup>
                            </Marker>
                        );
                    } else {
                        return null;
                    }
                })}
                {markers.map((marker, index) => {
                    return (
                        <Marker key={`marker-${index}`} position={[marker.lat, marker.lon]}>
                            <Popup>
                                <p>Latitude : {marker.lat}</p>
                                <p>Longitude : {marker.lon}</p>
                            </Popup>
                        </Marker>
                    );
                })}
                <MapClickHandler onMapClick={handleMapClick}/>
            </MapContainer>
            <div className="absolute top-[85%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-[10px]">
                {markers.length >= 2 && <Button onClick={onGenerateItinerary} buttonContent="Générer l'itinéraire"/>}
                {(filteredStations.length > 0 || markers.length > 0) && <Button onClick={reset} buttonContent="Annuler"/>}
            </div>
        </div>
    );
};

export default CreateItineraries;
