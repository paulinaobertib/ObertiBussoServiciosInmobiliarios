/// <reference types="vite/client" />
/// <reference types="vitest" />

declare namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL: string; 
      VITE_BASE_URL: string;
    }
  }
  