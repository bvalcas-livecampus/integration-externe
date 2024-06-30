import {Itineraries, Step} from "../../type/type.ts";
import {useState} from "react";
import file from "../../helper/file.ts";
import ModalMap from "./ModalMap.tsx";

type DataTableProps = {
    itineraries: Itineraries
}

const DataTable = ({itineraries}: DataTableProps) => {
    const [open, setOpen] = useState(false);
    const [steps, setSteps] = useState([] as Step[]);

    return (
        <div className="container">
            <h1 className="text-sm font-bold mb-2">
                Liste des Itinéraires
            </h1>

            <table className="text-left w-full">
                <thead className="bg-black flex text-white w-full">
                <tr className="flex w-full mb-4">
                    <th className="p-4 w-1/4">Nom de votre itinéraire</th>
                    <th className="p-4 w-1/4">Voir la carte</th>
                    <th className="p-4 w-1/4">Télécharger votre itinéraire au format pdf</th>
                </tr>
                </thead>
                <tbody className="bg-grey-light flex flex-col items-center justify-between overflow-y-scroll w-full"
                       style={{height: "50vh"}}>
                {itineraries.map((itinerary, index) => (
                    <tr className="flex w-full mb-4" key={index}>
                        <td className="p-4 w-1/4">{itinerary.name}</td>
                        <td className="p-4 w-1/4">
                            <button onClick={() => {
                                setSteps(itinerary.steps);
                                setOpen(true);
                            }}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Voir la carte
                            </button>
                        </td>
                        <td className="p-4 w-1/4">
                            {itinerary.pdf ? (
                                    <button onClick={() => file.handleDownloadPdf(itinerary.pdf as string, itinerary.name)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                        Télécharger PDF
                                    </button>
                                ) :
                                <p>{itinerary.message}</p>
                            }
                        </td>
                    </tr>
                ))
                }
                </tbody>
                <ModalMap steps={steps} open={open} setOpen={setOpen}/>
            </table>
        </div>
    )
}

export default DataTable;
