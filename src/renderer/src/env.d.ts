/// <reference types="vite/client" />
/// <reference path="../../preload/index.d.ts" />

interface Window {
  MonacoEnvironment?: import('monaco-editor').Environment
}
