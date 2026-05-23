import { ipcMain, app } from 'electron'
import os from 'os'

export interface Diagnostics {
  appVersion: string
  platform: string
  osRelease: string
  electronVersion: string
  nodeVersion: string
  userDataPath: string
  logPath: string
  timestamp: string
}

export function collectDiagnostics(): Diagnostics {
  return {
    appVersion: app.getVersion(),
    platform: `${process.platform} ${os.arch()}`,
    osRelease: os.release(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    userDataPath: app.getPath('userData'),
    logPath: app.getPath('logs'),
    timestamp: new Date().toISOString()
  }
}

export function registerDiagnosticsHandlers(): void {
  ipcMain.handle('diagnostics:collect', () => {
    return { ok: true, diagnostics: collectDiagnostics() }
  })
}
