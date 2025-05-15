
## Current Implementation

- Responsive layout using MUI and Vite.
- Sidebar navigation with Drawer on mobile.
- Map rendering using Mapbox GL.
- Environment variables handled via `.env` (`VITE_MAPBOX_TOKEN`).
- Device-aware zoom level adjustments.
- Error handling for unsupported browsers.
- Support for adding markers on the map.
- Support for adding polygons.
- Used React Context (`MapContext`) for centralized state management across components.
- Toggle between adding a marker or drawing a polygon.

---

##  Future Implementation

- Allow users to draw directly on the map and display the shapes dynamically.
- For polygons: currently, vertices are being updated in state, but the polygon is **not yet displayed** on the map.

---

## ⚙️ Setup Instructions

### Configure .env file
VITE_MAPBOX_TOKEN=your_mapbox_access_token

### 1. Clone the repository

```bash
git clone [https://github.com/Kritica-rani/mapbox-fe](https://github.com/Kritica-rani/mapbox-fe.git)
cd my-react-app
npm install
npm run dev 

