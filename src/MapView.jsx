import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import HeatmapLayer from './HeatmapLayer';

// Trash heatmap data points [lat, lng, intensity 0-1]
const trashHeatPoints = [
  // High intensity areas (red)
  [48.12552, 11.58397, 0.9],
  [48.1241, 11.5844, 0.85],
  [48.0906, 11.5502, 0.8],
  [48.1005, 11.5491, 0.9],
  [48.1062, 11.5531, 0.75],
  
  // Medium-high intensity (orange-red)
  [48.1025, 11.5516, 0.7],
  [48.1176, 11.5616, 0.65],
  [48.1252, 11.5742, 0.7],
  [48.0804, 11.5425, 0.6],
  [48.0838, 11.5427, 0.65],
  
  // Medium intensity (orange-yellow)
  [48.1262, 11.5835, 0.5],
  [48.0971, 11.5507, 0.45],
  [48.1089, 11.5593, 0.5],
  [48.1199, 11.5647, 0.48],
  [48.0955, 11.5505, 0.52],
  
  // Low intensity (yellow-green)
  [48.0884, 11.5483, 0.3],
  [48.0866, 11.5468, 0.35],
  [48.1053, 11.5563, 0.3],
  [48.1237, 11.5716, 0.32],
  [48.1210, 11.5658, 0.28],
  
  // Very low intensity (green)
  [48.0779, 11.5416, 0.15],
  [48.0746, 11.5414, 0.18],
  [48.1118, 11.5607, 0.2],
  [48.1164, 11.5605, 0.15],
  [48.1148, 11.5604, 0.12],
];

// Custom trash bin icon
const trashBinIcon = divIcon({
  className: 'custom-trash-icon',
  html: `
    <div style="
      font-size: 28px;
      text-align: center;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
      🗑️
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapView() {
  const [trashBins, setTrashBins] = useState([]);

  useEffect(() => {
    // Load and parse CSV file
    fetch('/muellsammelbehaelter-an-der-isar-2016-07-15.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        const bins = [];
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',');
          if (parts.length >= 6) {
            const pos = parts[0];
            const bezeichnung = parts[1];
            const longitude = parseFloat(parts[4]);
            const latitude = parseFloat(parts[5]);
            
            if (!isNaN(longitude) && !isNaN(latitude)) {
              bins.push({
                id: pos || `bin-${i}`,
                bezeichnung: bezeichnung,
                lat: latitude,
                lng: longitude,
              });
            }
          }
        }
        
        setTrashBins(bins);
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
      });
  }, []);

  return (
    <MapContainer
      center={[48.12552, 11.58397]}
      zoom={15}
      maxZoom={19}
      style={{ height: '100vh', width: '100vw' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <LayersControl position="topright">
        {/* OpenStreetMap Layer */}
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>

        {/* ESRI Satellite Layer */}
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Heatmap Layer - Trash Intensity */}
      <HeatmapLayer points={trashHeatPoints} />

      {/* Trash bin markers */}
      {trashBins.map((bin, index) => (
        <Marker 
          key={`${bin.id}-${index}`} 
          position={[bin.lat, bin.lng]}
          icon={trashBinIcon}
        >
          <Popup>
            <div style={{ minWidth: '180px' }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: '#1a1a1a'
              }}>
                🗑️ {bin.bezeichnung}
              </h3>
              <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#333' }}>
                <div>
                  <strong>ID:</strong> {bin.id}
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#666' }}>
                  📍 {bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;
