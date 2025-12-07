import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to update map view when location changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.latitude, center.longitude], 13);
    }
  }, [map, center]);
  return null;
}

export default function AirQualityMap({ userLocation, aqiData, history }) {

  if (!userLocation) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#00E400';
    if (aqi <= 100) return '#FFFF00';
    if (aqi <= 150) return '#FF7E00';
    if (aqi <= 200) return '#FF0000';
    if (aqi <= 300) return '#8F3F97';
    return '#7E0023';
  };

  const getRadius = (aqi) => {
    // Larger radius for worse air quality
    return Math.max(500, Math.min(2000, aqi * 10));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 overflow-hidden">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Community Exposure Map</h3>
      <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <MapUpdater center={userLocation} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <div>
                <strong>Your Location</strong>
                {aqiData && (
                  <>
                    <br />AQI: {aqiData.aqi}
                    <br />{aqiData.location}
                  </>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Air quality circle */}
          {aqiData && (
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={getRadius(aqiData.aqi)}
              pathOptions={{
                color: getAQIColor(aqiData.aqi),
                fillColor: getAQIColor(aqiData.aqi),
                fillOpacity: 0.2,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <strong>Air Quality Zone</strong>
                  <br />AQI: {aqiData.aqi}
                  <br />Radius: ~{Math.round(getRadius(aqiData.aqi) / 1000)}km
                </div>
              </Popup>
            </Circle>
          )}

          {/* Historical exposure points */}
          {history.slice(0, 10).map((entry, index) => {
            if (!entry.coordinates?.latitude || !entry.coordinates?.longitude) return null;
            return (
              <Circle
                key={index}
                center={[entry.coordinates.latitude, entry.coordinates.longitude]}
                radius={300}
                pathOptions={{
                  color: getAQIColor(entry.aqi),
                  fillColor: getAQIColor(entry.aqi),
                  fillOpacity: 0.1,
                  weight: 1,
                }}
              >
                <Popup>
                  <div>
                    <strong>Past Reading</strong>
                    <br />AQI: {entry.aqi}
                    <br />{new Date(entry.timestamp).toLocaleString()}
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Map shows your location and air quality exposure zones. Circles indicate pollution hotspots.
      </p>
    </div>
  );
}

