import React, { useRef, useMemo } from "react";
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
  Divider,
  Chip,
  Badge,
  ListItemText,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  PushPin as PinIcon,
  Rectangle as PolygonIcon,
  Draw as DrawIcon,
  Check as CheckIcon,
  ClearAll as ClearAllIcon,
} from "@mui/icons-material";
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
    exportGeoJSON,
    importGeoJSON,
  } = useMapContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tabValue, setTabValue] = React.useState(0);

  // Calculate number of total vertices across all polygons
  const totalVertices = useMemo(() => {
    return polygons.reduce((sum, polygon) => {
      // Subtract 1 because the last point is the same as the first in a closed polygon
      return sum + (polygon.coordinates[0].length - 1);
    }, 0);
  }, [polygons]);

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
      elevation={4}
      sx={{
        padding: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        width: "100%",
        borderRadius: { xs: 0, md: 2 },
        background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <DrawIcon sx={{ fontSize: 28 }} /> Map Controls
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: 1.5,
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: "medium",
            fontSize: "0.9rem",
            minHeight: 48,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: alpha("#1976d2", 0.04),
            },
          },
        }}
      >
        <Tab
          label={
            <Badge
              badgeContent={markers.length}
              color="primary"
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  right: -12,
                  top: -2,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PinIcon fontSize="small" />
                <Typography>Markers</Typography>
              </Box>
            </Badge>
          }
        />
        <Tab
          label={
            <Badge
              badgeContent={polygons.length}
              color="secondary"
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  right: -12,
                  top: -2,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PolygonIcon fontSize="small" />
                <Typography>Polygons</Typography>
              </Box>
            </Badge>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FileDownloadIcon fontSize="small" />
              <Typography>Export/Import</Typography>
            </Box>
          }
        />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: "auto", px: 0.5 }}>
        {tabValue === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PinIcon color="primary" /> Markers
                <Chip
                  label={markers.length}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 22, minWidth: 28 }}
                />
              </Typography>
              {markers.length > 0 && (
                <Tooltip title="Clear all markers">
                  <IconButton
                    color="error"
                    onClick={clearMarkers}
                    size="small"
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha("#f44336", 0.1),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {markers.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 3,
                  color: "text.secondary",
                  backgroundColor: alpha("#f5f5f5", 0.5),
                  borderRadius: 2,
                  border: "1px dashed #ccc",
                }}
              >
                <PinIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                <Typography>No markers added yet</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Click on the map to add markers
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: "calc(100vh - 240px)",
                  overflow: "auto",
                  backgroundColor: alpha("#fff", 0.6),
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                {markers.map((marker, index) => (
                  <React.Fragment key={marker.id}>
                    {index > 0 && <Divider variant="middle" sx={{ my: 0.5 }} />}
                    <ListItem
                      sx={{
                        py: 1,
                        px: 2,
                        "&:hover": {
                          backgroundColor: alpha("#1976d2", 0.04),
                        },
                        borderRadius: 1,
                        transition: "background-color 0.2s",
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Marker {index + 1}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            Lng: {marker.lngLat[0].toFixed(4)}, Lat:{" "}
                            {marker.lngLat[1].toFixed(4)}
                          </Typography>
                        }
                      />
                      <Tooltip title="Remove marker">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeMarker(marker.id)}
                          sx={{
                            ml: 1,
                            "&:hover": {
                              backgroundColor: alpha("#f44336", 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PolygonIcon color="secondary" /> Polygons
                <Chip
                  label={polygons.length}
                  size="small"
                  color="secondary"
                  sx={{ ml: 1, height: 22, minWidth: 28 }}
                />
              </Typography>
              {polygons.length > 0 && (
                <Tooltip title="Clear all polygons">
                  <IconButton
                    color="error"
                    onClick={clearPolygons}
                    size="small"
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha("#f44336", 0.1),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                border: `1px solid ${
                  drawingMode ? alpha("#2e7d32", 0.5) : "#e0e0e0"
                }`,
                borderRadius: 2,
                backgroundColor: drawingMode
                  ? alpha("#2e7d32", 0.05)
                  : "background.paper",
                transition: "all 0.3s",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={drawingMode}
                    onChange={toggleDrawingMode}
                    color="success"
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        "&:hover": {
                          backgroundColor: alpha("#2e7d32", 0.12),
                        },
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: drawingMode ? 600 : 400 }}>
                    {drawingMode
                      ? "Drawing Mode Active"
                      : "Enable Drawing Mode"}
                  </Typography>
                }
              />

              {drawingMode && (
                <Box sx={{ mt: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Chip
                      icon={<PolygonIcon />}
                      label={`${currentPolygonPoints.length} points`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {currentPolygonPoints.length < 3
                        ? `Add ${
                            3 - currentPolygonPoints.length
                          } more points to complete`
                        : "Ready to complete polygon"}
                    </Typography>
                  </Box>

                  {currentPolygonPoints.length >= 3 && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={completePolygon}
                      startIcon={<CheckIcon />}
                      fullWidth
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        boxShadow: 2,
                        "&:hover": {
                          boxShadow: 4,
                        },
                      }}
                    >
                      Complete Polygon
                    </Button>
                  )}
                </Box>
              )}
            </Paper>

            {!polygons.length ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 3,
                  color: "text.secondary",
                  backgroundColor: alpha("#f5f5f5", 0.5),
                  borderRadius: 2,
                  border: "1px dashed #ccc",
                }}
              >
                <PolygonIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                <Typography>No polygons created yet</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Enable drawing mode to create polygons
                </Typography>
              </Box>
            ) : (
              <List
                sx={{
                  maxHeight: drawingMode
                    ? "calc(100vh - 400px)"
                    : "calc(100vh - 280px)",
                  overflow: "auto",
                  backgroundColor: alpha("#fff", 0.6),
                  borderRadius: 2,
                  border: "1px solid #eee",
                }}
              >
                {polygons.map((polygon, index) => (
                  <React.Fragment key={polygon.id}>
                    {index > 0 && <Divider variant="middle" sx={{ my: 0.5 }} />}
                    <ListItem
                      sx={{
                        py: 1.5,
                        px: 2,
                        "&:hover": {
                          backgroundColor: alpha("#9c27b0", 0.04),
                        },
                        borderRadius: 1,
                        transition: "background-color 0.2s",
                      }}
                    >
                      <Box sx={{ width: "100%" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Polygon {index + 1}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            size="small"
                            label={`${
                              polygon.coordinates[0].length - 1
                            } vertices`}
                            color="secondary"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {`${
                              polygon.coordinates[0].length > 0
                                ? polygon.coordinates[0][0]
                                    .map((coord) => coord.toFixed(2))
                                    .join(", ")
                                : "No coordinates"
                            }`}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FileDownloadIcon color="primary" /> Export & Import
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={clearAll}
                startIcon={<ClearAllIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  borderWidth: "1.5px",
                  "&:hover": {
                    borderWidth: "1.5px",
                    backgroundColor: alpha("#f44336", 0.04),
                  },
                }}
              >
                Clear All Data
              </Button>

              <Divider sx={{ my: 1 }}>
                <Chip label="Export/Import Options" size="small" />
              </Divider>

              <Button
                variant="contained"
                color="secondary"
                onClick={exportGeoJSON}
                startIcon={<FileDownloadIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  boxShadow: 2,
                  "&:hover": {
                    boxShadow: 4,
                  },
                }}
              >
                Export as GeoJSON
              </Button>

              <Button
                variant="outlined"
                component="label"
                startIcon={<FileUploadIcon />}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  borderWidth: "1.5px",
                  borderColor: "primary.main",
                  "&:hover": {
                    borderWidth: "1.5px",
                    backgroundColor: alpha("#1976d2", 0.04),
                  },
                }}
              >
                Import GeoJSON File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".geojson,.json"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: alpha("#f5f5f5", 0.7),
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Data Summary
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-around",
                  textAlign: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {markers.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Markers
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="h6" color="secondary.main">
                    {polygons.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Polygons
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                  <Typography variant="h6" color="success.main">
                    {totalVertices}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Vertices
                  </Typography>
                </Box>
              </Box>

              {drawingMode && currentPolygonPoints.length > 0 && (
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #ccc" }}>
                  <Typography variant="body2" color="text.secondary">
                    Current Drawing
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Typography
                      variant="h6"
                      color="success.main"
                      sx={{ mr: 1 }}
                    >
                      {currentPolygonPoints.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      points in current polygon
                    </Typography>
                    {currentPolygonPoints.length >= 3 && (
                      <Chip
                        label="Ready"
                        color="success"
                        size="small"
                        sx={{ ml: "auto", height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: alpha("#e8f5e9", 0.7),
                borderRadius: 2,
                border: "1px solid #c8e6c9",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "success.main" }}
              >
                Auto-Save Active
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All markers and polygons are automatically saved to your
                browser's storage
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default Sidebar;
