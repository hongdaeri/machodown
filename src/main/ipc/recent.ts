import { ipcMain } from 'electron'
import log from 'electron-log/main'
import { RecentFilesService } from '../services/RecentFilesService'

export function registerRecentHandlers(): void {
  ipcMain.handle('recent:getFiles', async () => {
    try {
      const files = await RecentFilesService.getFiles()
      return { ok: true, files }
    } catch (err: unknown) {
      log.error('recent:getFiles failed', err)
      return { ok: false, files: [], message: (err as Error).message }
    }
  })

  ipcMain.handle('recent:addFile', async (_, args: { path: string }) => {
    try {
      const files = await RecentFilesService.addFile(args.path)
      return { ok: true, files }
    } catch (err: unknown) {
      log.error('recent:addFile failed', err)
      return { ok: false, message: (err as Error).message }
    }
  })
}
