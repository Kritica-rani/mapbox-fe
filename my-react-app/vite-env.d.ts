// vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  // Add more env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
