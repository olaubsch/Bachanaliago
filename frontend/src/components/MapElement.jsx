import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon for task markers
const taskIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1182/1182720.png', // Example task icon
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom icon for user marker (to make it distinct)
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
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <SetViewOnPosition position={position} />
      {/* User's location marker */}
      <Marker position={position} icon={userIcon}>
        <Popup>Your location</Popup>
      </Marker>
      {/* Task markers */}
      {tasks.map((task) => (
        <Marker
          key={task._id}
          position={[task.location.lat, task.location.lng]}
          icon={taskIcon}
        >
          <Popup>{task.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapElement;