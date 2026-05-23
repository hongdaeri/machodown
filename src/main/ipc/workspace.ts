import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { WorkspaceService } from '../services/WorkspaceService'
import type { Folder } from '../../renderer/src/stores/types'

export function registerWorkspaceHandlers(): void {
  ipcMain.handle('workspace:getFolders', async () => {
    try {
      const folders = await WorkspaceService.getFolders()
      return { ok: true, folders }
    } catch (err: unknown) {
      log.error('workspace:getFolders failed', err)
      return { ok: false, folders: [], message: (err as Error).message }
    }
  })

  ipcMain.handle('workspace:addFolder', async (_, args: { folder: Folder }) => {
    try {
      const folders = await WorkspaceService.addFolder(args.folder)
      return { ok: true, folders }
    } catch (err: unknown) {
      log.error('workspace:addFolder failed', err)
      return { ok: false, message: (err as Error).message }
    }
  })

  ipcMain.handle('workspace:removeFolder', async (_, args: { id: string }) => {
    try {
      const folders = await WorkspaceService.removeFolder(args.id)
      return { ok: true, folders }
    } catch (err: unknown) {
      log.error('workspace:removeFolder failed', err)
      return { ok: false, message: (err as Error).message }
    }
  })
}
