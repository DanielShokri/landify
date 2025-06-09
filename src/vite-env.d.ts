/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_API_SERVER_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_PROD_API_URL: string;
  readonly PROD: boolean;
  // Add more environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 