import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  Snackbar,
  Typography,
} from "@mui/material";
import React from "react";
import { useState, useEffect } from "react";
import { MapProvider } from "./context/MapContext";
import mapboxgl from "mapbox-gl";
import Sidebar from "./component/Sidebar";
import MapComponent from "./component/MapComponent";
import "./App.css";

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  const defaultCenter: [number, number] = [-74.006, 40.7128];
  const defaultZoom = 12;

  const [error, setError] = useState<string | null>(null);
  const [mapSupported, setMapSupported] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (!mapboxgl.supported()) {
        console.error("Mapbox GL not supported in this browser");
        setMapSupported(false);
        setError(
          "Your browser does not support Mapbox GL. Please try a different browser."
        );
      }
    } catch (e) {
      console.error("Error checking Mapbox support:", e);
      setMapSupported(false);
      setError(
        "Could not initialize the map library. Please check your internet connection."
      );
    }
  }, []);

  const handleCloseSnackbar = () => setError(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MapProvider>
        {!mapSupported ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              padding: 3,
              textAlign: "center",
            }}
          >
            <Alert severity="error" sx={{ maxWidth: 600, mb: 2 }}>
              {error || "Map functionality is not supported in your browser."}
            </Alert>
            <Typography variant="body1">
              Please try using a modern browser like Chrome, Firefox, or Edge.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              height: "100vh",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <Box
              sx={{
                flexGrow: 0.2,
                width: { xs: "100%", md: "300px" },
                height: { xs: "40%", md: "100%" },
                overflow: "auto",
              }}
            >
              <Sidebar />
            </Box>
            <Box
              sx={{
                flexGrow: 2,
                height: { xs: "60%", md: "100%" },
                position: "relative",
              }}
            >
              <MapComponent center={defaultCenter} zoom={defaultZoom} />
            </Box>
          </Box>
        )}

        {mapSupported && error && (
          <Snackbar
            open
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity="error" onClose={handleCloseSnackbar}>
              {error}
            </Alert>
          </Snackbar>
        )}
      </MapProvider>
    </ThemeProvider>
  );
}

export default App;
