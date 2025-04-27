import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LocationMarker({ setLat, setLng }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setLat(lat);
      setLng(lng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected task location</Popup>
    </Marker>
  ) : null;
}

function TaskMapPicker({ setLat, setLng }) {
  const defaultCenter = [51.505, -0.09]; // Default to London

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker setLat={setLat} setLng={setLng} />
    </MapContainer>
  );
}

export default TaskMapPicker;