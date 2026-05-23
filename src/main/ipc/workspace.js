import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { WorkspaceService } from '../services/WorkspaceService'
export function registerWorkspaceHandlers() {
  ipcMain.handle('workspace:getFolders', async () => {
    try {
      const folders = await WorkspaceService.getFolders()
      return { ok: true, folders }
    } catch (err) {
      log.error('workspace:getFolders failed', err)
      return { ok: false, folders: [], message: err.message }
    }
  })
  ipcMain.handle('workspace:addFolder', async (_, args) => {
    try {
      const folders = await WorkspaceService.addFolder(args.folder)
      return { ok: true, folders }
    } catch (err) {
      log.error('workspace:addFolder failed', err)
      return { ok: false, message: err.message }
    }
  })
  ipcMain.handle('workspace:removeFolder', async (_, args) => {
    try {
      const folders = await WorkspaceService.removeFolder(args.id)
      return { ok: true, folders }
    } catch (err) {
      log.error('workspace:removeFolder failed', err)
      return { ok: false, message: err.message }
    }
  })
}
