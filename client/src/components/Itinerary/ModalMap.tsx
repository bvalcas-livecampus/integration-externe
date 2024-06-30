import {Step} from "../../type/type.ts";
import map from "../../helper/map.ts";
import {MapContainer, Marker, TileLayer} from "react-leaflet";
import {LatLngExpression} from "leaflet";

type ModelMapProps = {
    steps: Step[],
    open: boolean,
    setOpen: (open: boolean) => void
}

const ModalMap = ({steps, open, setOpen}: ModelMapProps) => {

    console.log(steps)

    if (!open) {
        return null;
    }

    return (
        <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10">
            <div className="max-h-full w-full max-w-xl overflow-y-auto sm:rounded-2xl bg-white">
                <div className="w-full">
                    <div className="m-8 my-20 max-w-[400px] mx-auto">
                        <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
                            <h2 className="text-2xl font-semibold">La carte de votre itinéraire</h2>
                            <button onClick={() => setOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="feather feather-x">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <MapContainer id="map-all-stations" center={map.getCenterSteps(steps) as LatLngExpression} zoom={12}
                                      scrollWheelZoom={false} preferCanvas={true}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {steps.map((step, index) => {
                                return (
                                    <Marker
                                        key={`ModalMap-${index}`}
                                        position={[step.lat, step.lon]}
                                    >
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalMap