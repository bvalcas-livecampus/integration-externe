import { useEffect, useState } from 'react';
import api from "../helper/api.ts";
import {toast} from "react-toastify";
import Spinner from "../components/Spinner.tsx";

const ItinerariesComponent = () => {
    const [itineraries, setItineraries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api("GET", "itineraries")
            .then((response) => {
                setItineraries(response.itineraries);
            })
            .catch((error) => {
                toast.error('Erreur lors de la récupération des itinéraires : ' + error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleDownloadPdf = (pdfBase64, pdfName) => {
        try {
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', pdfName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur lors du téléchargement du PDF : ', error);
        }
    };


    if (isLoading) {
        return (<div className="flex flex-col">
            <Spinner />
            <p>Récupération des itinéraires en cours, veuillez patienter</p>
        </div>)
    }

    return (
        <div>
            <h2>Liste des Itinéraires</h2>
            <ul>
                {itineraries.map((itinerary, index) => (
                    <li key={index}>
                        <p>Identifiant : {itinerary.identifier}</p>
                        <p>Nom : {itinerary.name}</p>
                        {itinerary.pdf && (
                            <button onClick={() => handleDownloadPdf(itinerary.pdf, itinerary.name)}>Télécharger PDF</button>
                        )}
                        <hr />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItinerariesComponent;
