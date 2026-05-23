import React from 'react'
import ReactDOM from 'react-dom/client'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import App from './App'
import 'katex/dist/katex.min.css'
import './styles/globals.css'

window.MonacoEnvironment = {
  getWorker(): Worker {
    return new editorWorker()
  }
}
loader.config({ monaco })

window.addEventListener('error', (e) => {
  window.api.invoke('app:reportError', { message: e.message, stack: e.error?.stack })
})
window.addEventListener('unhandledrejection', (e) => {
  window.api.invoke('app:reportError', { message: String(e.reason), stack: e.reason?.stack })
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
