/// <reference types="vite/client" />

// This provides type support for Vite's import.meta.env in your TypeScript code

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
  readonly VITE_APP_PLATFORM: 'electron' | 'web'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}