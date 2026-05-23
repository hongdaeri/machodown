import { app, BrowserWindow, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log/main'
import { registerIpcHandlers } from './ipc'
import { createMenu } from './menu'
import { detectAbnormalShutdown } from './ipc/app'
import { BackupService } from './services/BackupService'
log.initialize()
log.transports.file.level = 'info'
process.on('uncaughtException', (err) => {
  log.error('uncaughtException', err)
})
process.on('unhandledRejection', (reason) => {
  log.error('unhandledRejection', reason)
})
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })
  win.on('ready-to-show', () => {
    win.show()
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return win
}
app.setName('Machodown')
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.machodown.app')
  app.on('browser-window-created', (_, win) => {
    optimizer.watchWindowShortcuts(win)
  })
  registerIpcHandlers()
  createMenu()
  const win = createWindow()
  detectAbnormalShutdown()
    .then(async (wasAbnormal) => {
      if (!wasAbnormal) return
      const service = BackupService.getInstance(app.getPath('userData'))
      await service.init()
      const dirtyBackups = service.listBackups().filter((b) => b.isDirty)
      if (dirtyBackups.length === 0) return
      win.webContents.once('did-finish-load', () => {
        win.webContents.send('backup:recoveryAvailable', { backups: dirtyBackups })
      })
    })
    .catch((err) => log.error('detectAbnormalShutdown failed', err))
  nativeTheme.on('updated', () => {
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send('theme:nativeChanged', { dark: nativeTheme.shouldUseDarkColors })
    })
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
