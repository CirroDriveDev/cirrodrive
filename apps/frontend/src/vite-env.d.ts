/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRPC_SERVER_URL: string;
  readonly VITE_TRPC_SERVER_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
