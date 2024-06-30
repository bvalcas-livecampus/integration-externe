import { useEffect, useState } from 'react';
import api from "../helper/api.ts";
import {toast} from "react-toastify";
import Spinner from "../components/Spinner.tsx";
import DataTable from "../components/Itinerary/DataTable.tsx";

const ItinerariesComponent = () => {
    const [itineraries, setItineraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api("GET", "itineraries")
            .then((response) => {
                setItineraries(response.itineraries);
            })
            .catch((error) => {
                toast.error('Erreur lors de la récupération des itinéraires : ' + error.message, {
                    position: "bottom-center"
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (<div className="flex flex-col">
            <Spinner />
            <p>Récupération des itinéraires en cours, veuillez patienter</p>
        </div>)
    }

    return (
        <div>
            <ul>
                <DataTable itineraries={itineraries} />
            </ul>
        </div>
    );
};

export default ItinerariesComponent;
