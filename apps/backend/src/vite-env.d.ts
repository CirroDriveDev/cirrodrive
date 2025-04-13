/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EC2_PUBLIC_URL: string;
  readonly VITE_CLIENT_PORT: string;
  readonly VITE_SERVER_PORT: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_AWS_S3_BUCKET: string;
  readonly VITE_SES_SOURCE_EMAIL: string;
  readonly VITE_JWT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
