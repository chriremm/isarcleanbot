import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Create heatmap layer
    const heat = L.heatLayer(points, {
      radius: 80,
      blur: 40,
      max: 0.8,
      minOpacity: 0.5,
      gradient: {
        0.0: '#00ff00',  // green (clean)
        0.3: '#ffff00',  // yellow (low)
        0.5: '#ffa500',  // orange (medium)
        0.7: '#ff4500',  // orange-red (high)
        1.0: '#ff0000'   // red (very high)
      }
    }).addTo(map);

    // Cleanup on unmount
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
}

export default HeatmapLayer;
