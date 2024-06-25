import L from "leaflet";
import "leaflet-canvas-marker";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import './app.css';

function App() {

  return (
    <>
      <MapContainer id="map" center={[51.505, -0.09]} zoom={10} scrollWheelZoom={false} preferCanvas={true} renderer={L.canvas()}>
        <>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[51.505, -0.09]}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </>
      </MapContainer>
    </>
  )
}

export default App
