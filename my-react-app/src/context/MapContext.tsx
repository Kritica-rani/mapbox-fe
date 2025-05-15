import React from "react";
import { createContext, useState, useContext, useEffect } from "react";

interface Marker {
  id: string;
  lngLat: [number, number];
}

interface Polygon {
  id: string;
  coordinates: [number, number][][];
}

interface MapContextType {
  markers: Marker[];
  polygons: Polygon[];
  drawingMode: boolean;
  currentPolygonPoints: [number, number][];
  addMarker: (lngLat: [number, number]) => void;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
  toggleDrawingMode: () => void;
  addPolygonPoint: (lngLat: [number, number]) => void;
  completePolygon: () => void;
  clearPolygons: () => void;
  clearAll: () => void;
  exportGeoJSON: () => void;
  importGeoJSON: (data: any) => void;
}

// Create the context
const MapContext = createContext<MapContextType | undefined>(undefined);

// Create a provider component
export const MapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPolygonPoints, setCurrentPolygonPoints] = useState<
    [number, number][]
  >([]);
  const [initialized, setInitialized] = useState(false);
  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("mapState");
      if (savedState) {
        const { markers, polygons } = JSON.parse(savedState);
        setMarkers(markers || []);
        setPolygons(polygons || []);
      }
      // Mark as initialized AFTER loading data
      setInitialized(true);
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      setInitialized(true); // Still mark as initialized in case of error
    }
  }, []);

  // Auto-save to localStorage whenever markers or polygons change
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem("mapState", JSON.stringify({ markers, polygons }));
      } catch (error) {
        console.error("Error auto-saving to localStorage:", error);
      }
    }
  }, [markers, polygons, initialized]);

  // Add a marker
  const addMarker = (lngLat: [number, number]) => {
    if (!drawingMode) {
      const newMarker: Marker = {
        id: `marker-${Date.now()}`,
        lngLat,
      };
      setMarkers((currentMarkers) => [...currentMarkers, newMarker]);
    }
  };

  // Remove a marker
  const removeMarker = (id: string) => {
    setMarkers((currentMarkers) =>
      currentMarkers.filter((marker) => marker.id !== id)
    );
  };

  // Clear all markers
  const clearMarkers = () => {
    setMarkers([]);
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
    if (drawingMode && currentPolygonPoints.length > 0) {
      // If we're exiting drawing mode with points, complete the polygon
      completePolygon();
    }
  };

  // Add a point to the current polygon
  const addPolygonPoint = (lngLat: [number, number]) => {
    if (drawingMode) {
      setCurrentPolygonPoints((points) => [...points, lngLat]);
    }
  };

  // Complete the current polygon
  const completePolygon = () => {
    if (currentPolygonPoints.length >= 3) {
      const newPolygon: Polygon = {
        id: `polygon-${Date.now()}`,
        coordinates: [[...currentPolygonPoints, currentPolygonPoints[0]]], // Close the polygon
      };
      setPolygons((currentPolygons) => [...currentPolygons, newPolygon]);
      setCurrentPolygonPoints([]);
    }
  };

  // Clear all polygons
  const clearPolygons = () => {
    setPolygons([]);
    setCurrentPolygonPoints([]);
  };

  // Clear all markers and polygons
  const clearAll = () => {
    clearMarkers();
    clearPolygons();
  };

  // Export as GeoJSON
  const exportGeoJSON = () => {
    const geoJSON = {
      type: "FeatureCollection",
      features: [
        ...markers.map((marker) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: marker.lngLat,
          },
          properties: {
            id: marker.id,
          },
        })),
        ...polygons.map((polygon) => ({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: polygon.coordinates,
          },
          properties: {
            id: polygon.id,
          },
        })),
      ],
    };

    const dataStr = JSON.stringify(geoJSON, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "map-data.geojson";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Import GeoJSON
  const importGeoJSON = (data: any) => {
    try {
      if (data && data.features) {
        const newMarkers: Marker[] = [];
        const newPolygons: Polygon[] = [];

        data.features.forEach((feature: any) => {
          if (feature.geometry.type === "Point") {
            newMarkers.push({
              id:
                feature.properties.id ||
                `marker-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              lngLat: feature.geometry.coordinates as [number, number],
            });
          } else if (feature.geometry.type === "Polygon") {
            newPolygons.push({
              id:
                feature.properties.id ||
                `polygon-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              coordinates: feature.geometry.coordinates as [number, number][][],
            });
          }
        });

        setMarkers((currentMarkers) => [...currentMarkers, ...newMarkers]);
        setPolygons((currentPolygons) => [...currentPolygons, ...newPolygons]);
        alert("GeoJSON imported successfully!");
      }
    } catch (error) {
      console.error("Error importing GeoJSON:", error);
      alert("Failed to import GeoJSON. Please check the file format.");
    }
  };

  const value = {
    markers,
    polygons,
    drawingMode,
    currentPolygonPoints,
    addMarker,
    removeMarker,
    clearMarkers,
    toggleDrawingMode,
    addPolygonPoint,
    completePolygon,
    clearPolygons,
    clearAll,
    exportGeoJSON,
    importGeoJSON,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Custom hook to use the map context
export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};
