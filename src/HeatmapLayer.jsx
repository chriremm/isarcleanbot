import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// IMPORTANT – this must load before using it:
import "leaflet-webgl-heatmap";

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Check if plugin loaded
    if (typeof L.webGLHeatmap !== "function") {
      console.error("webGLHeatmap plugin not loaded!");
      return;
    }

    if (!points || points.length === 0) {
      console.warn("Heatmap: no points provided");
      return;
    }

    // Convert the points into WebGLHeatmap format:
    const heatData = points.map(([lat, lng, intensity]) => ({
      lat,
      lng,
      intensity: Math.min(1, Math.max(0, intensity)),
    }));

    // Debug (helps check they're correct)
    console.log("Heatmap data:", heatData);

    // Create heatmap layer
    const heatmap = L.webGLHeatmap({
      size: 40,                 // constant size (zoom-stable)
      units: "px",
      opacity: 1.0,
      alphaRange: [0.0, 1.0],
      intensityToAlpha: true,
      gradientTexture: false,
    });

    heatmap.setData(heatData);
    heatmap.addTo(map);

    return () => {
      map.removeLayer(heatmap);
    };
  }, [map, points]);

  return null;
}
