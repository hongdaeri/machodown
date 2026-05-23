import { ipcMain, app } from 'electron';
import fs from 'fs/promises';
import log from 'electron-log/main';
import { BackupService } from '../services/BackupService';
function getService() {
    return BackupService.getInstance(app.getPath('userData'));
}
export function registerBackupHandlers() {
    void getService()
        .cleanup()
        .catch((err) => log.warn('backup cleanup on startup failed', err));
    ipcMain.handle('backup:createAuto', async (_, args) => {
        try {
            const meta = await getService().createBackup({
                type: 'auto',
                originalPath: args.path,
                content: args.content,
                encoding: args.encoding,
                isDirty: args.isDirty
            });
            return { ok: true, meta };
        }
        catch (err) {
            log.error('backup:createAuto failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('backup:createPreSave', async (_, args) => {
        try {
            const meta = await getService().createBackup({
                type: 'pre-save',
                originalPath: args.path,
                content: args.content,
                encoding: args.encoding,
                isDirty: true
            });
            return { ok: true, meta };
        }
        catch (err) {
            log.error('backup:createPreSave failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('backup:createManual', async (_, args) => {
        try {
            let content;
            try {
                content = await fs.readFile(args.path, 'utf-8');
            }
            catch (err) {
                return { ok: false, message: err.message };
            }
            const meta = await getService().createBackup({
                type: 'manual',
                originalPath: args.path,
                content,
                encoding: 'utf-8',
                isDirty: false
            });
            return { ok: true, meta };
        }
        catch (err) {
            log.error('backup:createManual failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('backup:list', async (_, args) => {
        try {
            const service = getService();
            await service.init();
            const backups = service.listBackups(args?.path);
            return { ok: true, backups };
        }
        catch (err) {
            log.error('backup:list failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('backup:recover', async (_, args) => {
        try {
            const result = await getService().recoverBackup(args.id);
            if (!result)
                return { ok: false, message: 'backup not found' };
            return { ok: true, ...result };
        }
        catch (err) {
            log.error('backup:recover failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('backup:delete', async (_, args) => {
        try {
            await getService().deleteBackup(args.id);
            return { ok: true };
        }
        catch (err) {
            log.error('backup:delete failed', err);
            return { ok: false, message: err.message };
        }
    });
    ipcMain.handle('backup:clearAll', async () => {
        try {
            await getService().clearAll();
            return { ok: true };
        }
        catch (err) {
            log.error('backup:clearAll failed', err);
            return { ok: false, message: err.message };
        }
    });
}
