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

const MAPBOX_TOKEN =


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
      // Set the access token
      mapboxgl.accessToken = MAPBOX_TOKEN;

      // Make sure the container is available
      if (!mapContainer.current) {
        setMapError("Map container not found");
        setLoading(false);
        return;
      }

      console.log("Initializing map with token:", MAPBOX_TOKEN);

      // Create the map instance with a simpler style
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v10",
        center: center,
        zoom: zoom,
        attributionControl: true,
        preserveDrawingBuffer: true,
      });

      // Handle map load event
      mapInstance.on("load", () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setLoading(false);
      });

      // Handle map error event with more detailed logging
      mapInstance.on("error", (e) => {
        console.error("Mapbox error details:", e);
        // Try to extract more meaningful error information
        let errorMessage = "Unknown map error";
        if (e.error) {
          errorMessage = e.error.message || JSON.stringify(e.error);
        } else if (typeof e === "object") {
          errorMessage = JSON.stringify(e);
        }
        setMapError(`Map error: ${errorMessage}`);
        setLoading(false);
      });

      // Handle map click event
      mapInstance.on("click", (e) => {
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];

        if (drawingMode) {
          addPolygonPoint(lngLat);
        } else {
          addMarker(lngLat);
        }
      });

      map.current = mapInstance;

      // Cleanup function
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

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove markers that are no longer in the state
      Object.keys(markersRef.current).forEach((id) => {
        if (!markers.find((m) => m.id === id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      // Add new markers
      markers.forEach((marker) => {
        if (!markersRef.current[marker.id]) {
          const newMarker = new mapboxgl.Marker()
            .setLngLat(marker.lngLat)
            .addTo(map.current!);
          markersRef.current[marker.id] = newMarker;
        }
      });
    } catch (error) {
      console.error("Error handling markers:", error);
    }
  }, [markers, mapLoaded]);

  // Handle polygons
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    try {
      // Remove existing polygon layers and sources
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

        // Only add sources and layers if the map is fully loaded
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

          // Add outline
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

  // Handle current polygon being drawn
  useEffect(() => {
    if (!map.current || !mapLoaded || currentPolygonPoints.length < 2) return;

    try {
      const sourceId = "current-polygon-source";
      const lineLayerId = "current-polygon-line-layer";

      // Only manipulate the map if it's fully loaded
      if (map.current.loaded()) {
        // Remove existing layers if they exist
        if (map.current.getLayer(lineLayerId)) {
          map.current.removeLayer(lineLayerId);
        }

        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }

        // Add the current polygon as a line
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
