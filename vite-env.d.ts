/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_NANO_BANANA_API_KEY?: string;
  readonly VITE_NANO_BANANA_BASE_URL?: string;
  readonly DEV: boolean;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
