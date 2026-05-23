import { ipcMain, shell } from 'electron';
import log from 'electron-log/main';
export function registerShellHandlers() {
    ipcMain.handle('shell:openExternal', async (_, args) => {
        try {
            await shell.openExternal(args.url);
            return { ok: true };
        }
        catch (err) {
            log.error('shell:openExternal failed', err);
            return { ok: false, message: err.message };
        }
    });
}
