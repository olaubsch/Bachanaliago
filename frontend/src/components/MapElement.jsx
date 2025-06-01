import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from "./modules/MapElement.module.css";
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

function MapElement({ tasks, position: externalPosition, onClearPosition }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [error, setError] = useState(null);
  const [centerSource, setCenterSource] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = [pos.coords.latitude, pos.coords.longitude];
            setUserLocation(coords);

            if (!mapCenter && !externalPosition) {
              setMapCenter(coords);
              setCenterSource("user");
            }
          },
          (err) => setError(err.message)
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError("Geolocation is not supported by this browser");
    }
  }, [mapCenter, externalPosition]);

  useEffect(() => {
    if (externalPosition && centerSource !== "external") {
      setMapCenter(externalPosition);
      setCenterSource("external");
    }
  }, [externalPosition]);

  const handleRecenter = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setCenterSource("user");

      // Tell parent to forget external position
      onClearPosition?.();
    }
  };

  if (error) {
    return <div className={styles.load_wrapper}>Error: {error}</div>;
  }

  return (
    <div className={`${styles.map_wrapper} ${ mapCenter ? styles.map_visible : ''}`}>
      {!mapCenter ? (
          <div className={styles.load_wrapper}>
            <div className={styles.wave_loader} />
          </div>
      ) : (
          <>
            <MapContainer
                center={mapCenter}
                scrollWheelZoom={false}
                tap={false}
                dragging={!L.Browser.mobile}
                zoomControl={false}
                zoom={13}
                style={{
                  height: '250px', width: '100%', borderRadius: '12px' }}
            >
              <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <SetViewOnPosition position={mapCenter} />
              {userLocation && (
                  <Marker position={mapCenter} icon={userIcon}>
                    <Popup>Your location</Popup>
                  </Marker>
              )}

              {/* Task circles */}
              {tasks.map((task) => {
                if (!task.location || task.location.lat == null || task.location.lng == null) return null;

                return (
                    <Circle
                        key={task._id}
                        center={[task.location.lat, task.location.lng]}
                        radius={100}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.5 }}
                    >
                      <Popup>{task.name}</Popup>
                    </Circle>
                );
              })}

            </MapContainer>
            {/* Recenter button */}
            <button className={styles.recenter_button} onClick={handleRecenter}>
              <div className={ styles.locationIcon } ></div>
            </button>
          </>
      )}
    </div>
  );
}

export default MapElement;