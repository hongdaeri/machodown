import { ipcMain, dialog, BrowserWindow } from 'electron'
import log from 'electron-log/main'
export function registerDialogHandlers() {
  ipcMain.handle('dialog:openFile', async (event, args) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showOpenDialog(win, {
        title: args?.title ?? '파일 열기',
        properties: ['openFile'],
        filters: args?.filters ?? [
          { name: 'Markdown', extensions: ['md', 'markdown', 'txt'] },
          { name: '모든 파일', extensions: ['*'] }
        ]
      })
      if (result.canceled) return { ok: true, canceled: true, paths: [] }
      return { ok: true, canceled: false, paths: result.filePaths }
    } catch (err) {
      log.error('dialog:openFile failed', err)
      return { ok: false, message: err.message }
    }
  })
  ipcMain.handle('dialog:openDirectory', async (event, args) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showOpenDialog(win, {
        title: args?.title ?? '폴더 열기',
        properties: ['openDirectory']
      })
      if (result.canceled) return { ok: true, canceled: true, paths: [] }
      return { ok: true, canceled: false, paths: result.filePaths }
    } catch (err) {
      log.error('dialog:openDirectory failed', err)
      return { ok: false, message: err.message }
    }
  })
  ipcMain.handle('dialog:saveFile', async (event, args) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      const result = await dialog.showSaveDialog(win, {
        title: args?.title ?? '파일 저장',
        defaultPath: args?.defaultPath,
        filters: args?.filters ?? [
          { name: 'Markdown', extensions: ['md', 'markdown'] },
          { name: '모든 파일', extensions: ['*'] }
        ]
      })
      if (result.canceled) return { ok: true, canceled: true, path: undefined }
      return { ok: true, canceled: false, path: result.filePath }
    } catch (err) {
      log.error('dialog:saveFile failed', err)
      return { ok: false, message: err.message }
    }
  })
}
