/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SERVER_API_PORT: string;
  readonly CIENT_API_PORT: string;
  readonly BASE_URL_SERVER: string;
  readonly BASE_URL_CLIENT: string;
  readonly NODE_ENV: string;
  readonly MONGO_URI: string;
  readonly JWT_SECRET: string;
  readonly JWT_SECRET_REFRESH: string;
  readonly JWT_EXPIRE_REGISTER: string;
  readonly JWT_EXPIRE_LOGIN: string;
  readonly JWT_EXPIRE_REFRESH: string;
  readonly EMAIL_HOST: string;
  readonly EMAIL_PORT: string;
  readonly EMAIL_USER: string;
  readonly EMAIL_PASS: string;
  readonly EMAIL_FROM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
