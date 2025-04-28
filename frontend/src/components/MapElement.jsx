import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon for user marker
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673223.png', // Example user icon
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function SetViewOnPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

function MapElement({ tasks }) {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          setError(err.message);
        }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!position) {
    return <div>Loading location...</div>;
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '2rem' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <SetViewOnPosition position={position} />
      {/* User's location marker */}
      <Marker position={position} icon={userIcon}>
        <Popup>Your location</Popup>
      </Marker>
      {/* Task circles */}
      {tasks.map((task) => (
        <Circle
          key={task._id}
          center={[task.location.lat, task.location.lng]}
          radius={100} // 100 meters
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.5 }}
        >
          <Popup>{task.name}</Popup>
        </Circle>
      ))}
    </MapContainer>
  );
}

export default MapElement;