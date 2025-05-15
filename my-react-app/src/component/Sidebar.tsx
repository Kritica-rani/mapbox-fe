import React, { useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from "@mui/material";
import { useMapContext } from "../context/MapContext";

const Sidebar: React.FC = () => {
  const {
    markers,
    polygons,
    drawingMode,
    currentPolygonPoints,
    removeMarker,
    clearMarkers,
    toggleDrawingMode,
    completePolygon,
    clearPolygons,
    clearAll,
    saveToLocalStorage,
    exportGeoJSON,
    importGeoJSON,
  } = useMapContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importGeoJSON(data);
      } catch (error) {
        console.error("Error parsing GeoJSON:", error);
        alert("Failed to parse GeoJSON file. Please check the file format.");
      }
    };
    reader.readAsText(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: "16px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        width: "100%",
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: "16px" }}>
        Map Controls
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ marginBottom: "16px" }}
      >
        <Tab label="Markers" />
        <Tab label="Polygons" />
        <Tab label="Tools" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6">Markers ({markers.length})</Typography>
          <List sx={{ maxHeight: "90%" }}>
            {markers.map((marker) => (
              <ListItem
                key={marker.id}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2">
                  Lng: {marker.lngLat[0].toFixed(4)}, Lat:{" "}
                  {marker.lngLat[1].toFixed(4)}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => removeMarker(marker.id)}
                  sx={{ marginLeft: "8px" }}
                >
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
          {markers.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={clearMarkers}
              sx={{ marginTop: "8px" }}
            >
              Clear Markers
            </Button>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6">Polygons ({polygons.length})</Typography>

          <FormControlLabel
            control={
              <Switch
                checked={drawingMode}
                onChange={toggleDrawingMode}
                color="primary"
              />
            }
            label="Drawing Mode"
          />

          {drawingMode && (
            <Box sx={{ marginTop: "8px" }}>
              <Typography variant="body2">
                Current Points: {currentPolygonPoints.length}
              </Typography>
              {currentPolygonPoints.length >= 3 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={completePolygon}
                  sx={{ marginTop: "8px" }}
                >
                  Complete Polygon
                </Button>
              )}
            </Box>
          )}

          <List sx={{ maxHeight: "150px", overflow: "auto", marginTop: "8px" }}>
            {polygons.map((polygon, index) => (
              <ListItem key={polygon.id}>
                <Typography variant="body2">
                  Polygon {index + 1}: {polygon.coordinates[0].length - 1}{" "}
                  vertices
                </Typography>
              </ListItem>
            ))}
          </List>

          {polygons.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={clearPolygons}
              sx={{ marginTop: "8px" }}
            >
              Clear Polygons
            </Button>
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6">Tools</Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            <Button variant="contained" color="error" onClick={clearAll}>
              Clear All
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={saveToLocalStorage}
            >
              Save to Local Storage
            </Button>

            <Button
              variant="contained"
              color="secondary"
              onClick={exportGeoJSON}
            >
              Export GeoJSON
            </Button>

            <Button variant="outlined" component="label">
              Import GeoJSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".geojson,.json"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default Sidebar;
