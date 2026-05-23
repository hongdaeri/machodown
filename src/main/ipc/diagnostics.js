import { ipcMain, app } from 'electron';
import os from 'os';
export function collectDiagnostics() {
    return {
        appVersion: app.getVersion(),
        platform: `${process.platform} ${os.arch()}`,
        osRelease: os.release(),
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        userDataPath: app.getPath('userData'),
        logPath: app.getPath('logs'),
        timestamp: new Date().toISOString()
    };
}
export function registerDiagnosticsHandlers() {
    ipcMain.handle('diagnostics:collect', () => {
        return { ok: true, diagnostics: collectDiagnostics() };
    });
}
