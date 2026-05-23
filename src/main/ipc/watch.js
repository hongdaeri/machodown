import { ipcMain, BrowserWindow } from 'electron';
import log from 'electron-log/main';
import { WatcherService } from '../services/WatcherService';
export function registerWatchHandlers() {
    ipcMain.handle('watch:add', async (_, args) => {
        const win = BrowserWindow.getAllWindows()[0];
        if (!win) {
            log.warn('watch:add: no BrowserWindow available');
            return { ok: false, message: 'no window' };
        }
        try {
            WatcherService.add(args.path, win);
            return { ok: true };
        }
        catch (err) {
            log.error('watch:add failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('watch:remove', async (_, args) => {
        try {
            await WatcherService.remove(args.path);
            return { ok: true };
        }
        catch (err) {
            log.error('watch:remove failed', err);
            return { ok: false, message: err.message };
        }
    });
}
