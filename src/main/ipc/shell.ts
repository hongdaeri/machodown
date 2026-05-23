import { ipcMain, shell } from 'electron'
import log from 'electron-log/main'

export function registerShellHandlers(): void {
  ipcMain.handle('shell:openExternal', async (_, args: { url: string }) => {
    try {
      await shell.openExternal(args.url)
      return { ok: true }
    } catch (err: unknown) {
      log.error('shell:openExternal failed', err)
      return { ok: false, message: (err as Error).message }
    }
  })
}
