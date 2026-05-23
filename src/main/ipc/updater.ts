import { ipcMain, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { is } from '@electron-toolkit/utils'
import log from 'electron-log/main'

function broadcast(channel: string, ...args: unknown[]): void {
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send(channel, ...args))
}

export function registerUpdaterHandlers(): void {
  // skip auto-updater in dev — no GitHub release to check against
  if (is.dev) {
    ipcMain.handle('update:check', () => ({ ok: true, skipped: true }))
    ipcMain.handle('update:install', () => ({ ok: true, skipped: true }))
    ipcMain.handle('releaseNotes:get', () => ({ ok: true, notes: null }))
    return
  }

  autoUpdater.logger = log
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => broadcast('updater:checking'))

  autoUpdater.on('update-available', (info) => broadcast('updater:available', info))

  autoUpdater.on('update-downloaded', (info) => broadcast('updater:downloaded', info))

  autoUpdater.on('error', (err) => log.error('autoUpdater error', err))

  ipcMain.handle('update:check', async () => {
    try {
      await autoUpdater.checkForUpdates()
      return { ok: true }
    } catch (err: unknown) {
      log.warn('update:check failed', err)
      return { ok: false }
    }
  })

  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall()
    return { ok: true }
  })

  ipcMain.handle('releaseNotes:get', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      const notes = result?.updateInfo?.releaseNotes ?? null
      return { ok: true, notes }
    } catch (err: unknown) {
      log.warn('releaseNotes:get failed', err)
      return { ok: false, notes: null }
    }
  })

  // check on startup (30s delay to avoid slowing app launch)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => log.warn('startup update check failed', err))
  }, 30_000)
}
