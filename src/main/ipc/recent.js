import { ipcMain } from 'electron';
import log from 'electron-log/main';
import { RecentFilesService } from '../services/RecentFilesService';
export function registerRecentHandlers() {
    ipcMain.handle('recent:getFiles', async () => {
        try {
            const files = await RecentFilesService.getFiles();
            return { ok: true, files };
        }
        catch (err) {
            log.error('recent:getFiles failed', err);
            return { ok: false, files: [], message: err.message };
        }
    });
    ipcMain.handle('recent:addFile', async (_, args) => {
        try {
            const files = await RecentFilesService.addFile(args.path);
            return { ok: true, files };
        }
        catch (err) {
            log.error('recent:addFile failed', err);
            return { ok: false, message: err.message };
        }
    });
}
