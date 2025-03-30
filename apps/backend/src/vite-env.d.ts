/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EC2_PUBLIC_URL: string;
  readonly VITE_CLIENT_PORT: string;
  readonly VITE_SERVER_PORT: string;
  readonly VITE_SES_SOURCE_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
