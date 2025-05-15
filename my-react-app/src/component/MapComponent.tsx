import React from "react";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapContext } from "../context/MapContext";
import {
  Box,
  Alert,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapComponentProps {
  center: [number, number];
  zoom: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    markers,
    polygons,
    drawingMode,
    currentPolygonPoints,
    addMarker,
    addPolygonPoint,
  } = useMapContext();

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      if (!mapContainer.current) {
        setMapError("Map container not found");
        setLoading(false);
        return;
      }

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v10",
        center: center,
        zoom: zoom,
        attributionControl: true,
        preserveDrawingBuffer: true,
      });

      mapInstance.on("load", () => {
        setMapLoaded(true);
        setLoading(false);
      });

      mapInstance.on("error", (e) => {
        console.error("Mapbox error details:", e);
        let errorMessage = "Unknown map error";
        if (e.error) {
          errorMessage = e.error.message || JSON.stringify(e.error);
        } else if (typeof e === "object") {
          errorMessage = JSON.stringify(e);
        }
        setMapError(`Map error: ${errorMessage}`);
        setLoading(false);
      });

      mapInstance.on("click", (e) => {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (drawingMode) {
          addPolygonPoint(lngLat);
        } else {
          addMarker(lngLat);
        }
      });

      map.current = mapInstance;

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        `Failed to initialize map: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setLoading(false);
    }
  }, [center, zoom, addMarker, addPolygonPoint, drawingMode]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      Object.values(markersRef.current).forEach((marker) => {
        marker.remove();
      });
      markersRef.current = {};

      markers.forEach((marker) => {
        const newMarker = new mapboxgl.Marker()
          .setLngLat(marker.lngLat)
          .addTo(map.current!);
        markersRef.current[marker.id] = newMarker;
      });
    } catch (error) {
      console.error("Error handling markers:", error);
    }
  }, [markers, mapLoaded]);

  // Handle polygons
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      polygons.forEach((polygon, index) => {
        const sourceId = `polygon-source-${index}`;
        const layerId = `polygon-layer-${index}`;
        const outlineLayerId = `${layerId}-outline`;

        if (map.current!.getLayer(outlineLayerId)) {
          map.current!.removeLayer(outlineLayerId);
        }

        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }

        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      });

      // Add polygon layers
      polygons.forEach((polygon, index) => {
        const sourceId = `polygon-source-${index}`;
        const layerId = `polygon-layer-${index}`;

        if (map.current!.loaded()) {
          map.current!.addSource(sourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: polygon.coordinates,
              },
              properties: {},
            },
          });

          map.current!.addLayer({
            id: layerId,
            type: "fill",
            source: sourceId,
            layout: {},
            paint: {
              "fill-color": "#0080ff",
              "fill-opacity": 0.5,
            },
          });

          const outlineLayerId = `${layerId}-outline`;
          map.current!.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            layout: {},
            paint: {
              "line-color": "#000",
              "line-width": 2,
            },
          });
        }
      });
    } catch (error) {
      console.error("Error handling polygons:", error);
    }
  }, [polygons, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded || currentPolygonPoints.length < 2) return;

    try {
      const sourceId = "current-polygon-source";
      const lineLayerId = "current-polygon-line-layer";

      if (map.current.loaded()) {
        if (map.current.getLayer(lineLayerId)) {
          map.current.removeLayer(lineLayerId);
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }

        map.current.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: currentPolygonPoints,
            },
            properties: {},
          },
        });

        map.current.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          layout: {},
          paint: {
            "line-color": "#ff0000",
            "line-width": 2,
            "line-dasharray": [2, 1],
          },
        });
      }
    } catch (error) {
      console.error("Error handling current polygon:", error);
    }

    return () => {
      if (map.current && map.current.loaded()) {
        try {
          const lineLayerId = "current-polygon-line-layer";
          const sourceId = "current-polygon-source";

          if (map.current.getLayer(lineLayerId)) {
            map.current.removeLayer(lineLayerId);
          }

          if (map.current.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }
        } catch (error) {
          console.error("Error cleaning up polygon drawing:", error);
        }
      }
    };
  }, [currentPolygonPoints, mapLoaded]);

  const renderFallbackUI = () => {
    if (loading) {
      return (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            textAlign: "center",
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading map...
          </Typography>
        </Box>
      );
    }

    if (mapError) {
      return (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            width: "80%",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {mapError}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
        bgcolor: "#f0f0f0",
      }}
    >
      {renderFallbackUI()}

      <Box
        ref={mapContainer}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
};

export default MapComponent;
