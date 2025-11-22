import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./MapView.css";
import { robotsStore } from "./robotsStore";
import { startSimulation, stopSimulation } from "./robotSimulation";

export default function MapView() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const robotMarkersRef = useRef({}); // Store robot markers by ID
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);
  const [trashData, setTrashData] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [robots, setRobots] = useState(robotsStore.getRobots());

  // Load CSV data
  useEffect(() => {
    fetch("/muellsammelbehaelter-an-der-isar-2016-07-15.csv")
      .then((response) => response.text())
      .then((csvText) => {
  const lines = csvText.split("\n");
        
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(",");
            return {
              pos: values[0],
              bezeichnung: values[1],
              unterhalt: values[2],
              code: values[3],
              longitude: parseFloat(values[4]),
              latitude: parseFloat(values[5]),
              photo_url: values[6],
            };
          })
          .filter(item => !isNaN(item.longitude) && !isNaN(item.latitude));
        
        setTrashData(data);
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          // OpenStreetMap
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
          // Satellite (Esri)
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm-base",
            type: "raster",
            source: "osm",
            layout: { visibility: "visible" },
          },
          {
            id: "satellite-base",
            type: "raster",
            source: "satellite",
            layout: { visibility: "none" },
          },
        ],
      },
      center: [11.58397, 48.12552],
      zoom: 14.5,
    });

    mapRef.current = map;

    // ⭐ Add heatmap after map loads
    map.on("load", () => {
      const heatData = {
        type: "FeatureCollection",
        features: [
          // Example points — replace later with your data
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.58397, 48.12552] },
            properties: { intensity: 0.9 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.58440, 48.1241] },
            properties: { intensity: 0.7 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559620, 48.110591] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559610, 48.110691] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559603, 48.110791] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559594, 48.110891] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559620, 48.110991] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559920, 48.110091] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559620, 48.109091] },
            properties: { intensity: 0.8 },
          },
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: [11.559620, 48.109891] },
            properties: { intensity: 0.8 },
          }
        ],
      };

      map.addSource("trash-heat", {
        type: "geojson",
        data: heatData,
      });

      map.addLayer({
        id: "trash-heat-layer",
        type: "heatmap",
        source: "trash-heat",
        paint: {
          "heatmap-weight": ["get", "intensity"],
          "heatmap-intensity": 2,
          "heatmap-radius": 30,
          "heatmap-opacity": heatmapOpacity,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0, "green",
            0.3, "yellow",
            0.6, "orange",
            1, "red"
          ],
        },
      });

      setMapLoaded(true);

    });

    return () => map.remove();
  }, []);

  // Update heatmap opacity when slider changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.getLayer("trash-heat-layer")) {
      mapRef.current.setPaintProperty(
        "trash-heat-layer",
        "heatmap-opacity",
        heatmapOpacity
      );
    }
  }, [heatmapOpacity]);

  // Update trash bins when data is loaded
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (trashData.length === 0) return;

    const map = mapRef.current;

    trashData.forEach((item) => {
      if (isNaN(item.longitude) || isNaN(item.latitude)) return;

      const el = document.createElement("div");
      el.className = "trash-marker-container";
      
      const inner = document.createElement("div");
      inner.className = "trash-marker-content";
      inner.innerHTML = "🗑️";
      el.appendChild(inner);

      const popupContent = `
        <div class="popup-card">
          <div class="popup-heading">
            <span class="popup-emoji">🗑️</span>
            <div>
              <p class="popup-title">${item.bezeichnung}</p>
              <p class="popup-subtitle">ID ${item.pos} · Typ ${item.code}</p>
              <p class="popup-subtitle-secondary">${item.unterhalt || "Kommunalverwaltung"}</p>
            </div>
          </div>

          <div class="popup-coords">
            <div>
              <span class="popup-coords-label">Lat</span>
              <span class="popup-coords-value">${item.latitude.toFixed(6)}</span>
            </div>
            <div>
              <span class="popup-coords-label">Lng</span>
              <span class="popup-coords-value">${item.longitude.toFixed(6)}</span>
            </div>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ 
        offset: 16,
        closeButton: false 
      }).setHTML(popupContent);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([item.longitude, item.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [trashData, mapLoaded]);

  // Robot simulation effect
  useEffect(() => {
    startSimulation();
    const unsubscribe = robotsStore.subscribe((updatedRobots) => {
      setRobots([...updatedRobots]);
    });
    return () => {
      stopSimulation();
      unsubscribe();
    };
  }, []);

  // Update robot markers on map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    robots.forEach((robot) => {
      let marker = robotMarkersRef.current[robot.id];

      if (!marker) {
        // Create new marker
        const el = document.createElement("div");
        el.className = "robot-marker-container";
        
        const inner = document.createElement("div");
        inner.className = "robot-marker-content";
        inner.innerHTML = `<img src="/logo.png" alt="Robot" style="width: 100%; height: 100%; object-fit: contain;" />`;
        el.appendChild(inner);

        const popupContent = `
          <div class="popup-card">
            <div class="popup-heading">
              <span class="popup-emoji">
                <img src="/logo.png" alt="Robot" style="width: 30px; height: 30px; object-fit: contain;" />
              </span>
              <div>
                <p class="popup-title">${robot.name}</p>
                <p class="popup-subtitle">ID ${robot.id} · Status: ${robot.status}</p>
              </div>
            </div>

            <div class="popup-stats">
              <div class="popup-stat-row">
                <span class="popup-stat-label">Battery</span>
                <div class="battery-bar-container">
                  <div class="battery-bar" style="width: ${robot.battery}%"></div>
                </div>
                <span class="popup-stat-value">${Math.round(robot.battery)}%</span>
              </div>
              <div class="popup-stat-row">
                <span class="popup-stat-label">Trash collected</span>
                <span class="popup-stat-value">${robot.trashCollected.toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ 
          offset: 16,
          closeButton: false 
        }).setHTML(popupContent);

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([robot.position[1], robot.position[0]]) // Store is [Lat, Lng], MapLibre needs [Lng, Lat]
          .setPopup(popup)
          .addTo(map);

        robotMarkersRef.current[robot.id] = marker;
      } else {
        // Update existing marker position
        marker.setLngLat([robot.position[1], robot.position[0]]);
        
        // Update popup content if open (optional, but good for live updates)
        if (marker.getPopup().isOpen()) {
           const popupContent = `
          <div class="popup-card">
            <div class="popup-heading">
              <span class="popup-emoji">
                <img src="/logo.png" alt="Robot" style="width: 30px; height: 30px; object-fit: contain;" />
              </span>
              <div>
                <p class="popup-title">${robot.name}</p>
                <p class="popup-subtitle">ID ${robot.id} · Status: ${robot.status}</p>
              </div>
            </div>

            <div class="popup-stats">
              <div class="popup-stat-row">
                <span class="popup-stat-label">Battery</span>
                <div class="battery-bar-container">
                  <div class="battery-bar" style="width: ${robot.battery}%"></div>
                </div>
                <span class="popup-stat-value">${Math.round(robot.battery)}%</span>
              </div>
              <div class="popup-stat-row">
                <span class="popup-stat-label">Trash collected</span>
                <span class="popup-stat-value">${robot.trashCollected.toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        `;
          marker.getPopup().setHTML(popupContent);
        }
      }
    });
  }, [robots, mapLoaded]);

  // Remove markers on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, []);

  return (
    <div className="map-shell">
      <div ref={mapContainer} className="map-canvas" />

      {/* Opacity Slider Control */}
      <div className="map-control-card">
        <div className="opacity-card__header">
          <label htmlFor="heatmap-opacity-slider" className="opacity-card__label">
            Heatmap Opacity
          </label>
          <span className="opacity-card__value">{Math.round(heatmapOpacity * 100)}%</span>
        </div>
        <p className="opacity-card__hint">Fade the heatmap in or out smoothly.</p>
        <input
          id="heatmap-opacity-slider"
          className="opacity-card__slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={heatmapOpacity}
          onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}
