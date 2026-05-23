import { ipcMain, app } from 'electron';
import fs from 'fs/promises';
import { join } from 'path';
import log from 'electron-log/main';
const SESSION_PATH = join(app.getPath('userData'), 'session.json');
const DEFAULT_SESSION = {
    editorWidth: undefined,
    sidebarWidth: 240,
    viewMode: 'split',
    sidebarVisible: true,
    tabs: [],
    activeTabPath: undefined
};
export function registerSessionHandlers() {
    ipcMain.handle('session:get', async () => {
        try {
            const raw = await fs.readFile(SESSION_PATH, 'utf-8');
            const data = JSON.parse(raw);
            return { ok: true, session: { ...DEFAULT_SESSION, ...data } };
        }
        catch {
            return { ok: true, session: DEFAULT_SESSION };
        }
    });
    ipcMain.handle('session:save', async (_, args) => {
        try {
            let current = DEFAULT_SESSION;
            try {
                const raw = await fs.readFile(SESSION_PATH, 'utf-8');
                current = { ...DEFAULT_SESSION, ...JSON.parse(raw) };
            }
            catch {
                // use defaults
            }
            const merged = { ...current, ...args.session };
            const tmpPath = `${SESSION_PATH}.tmp`;
            await fs.writeFile(tmpPath, JSON.stringify(merged, null, 2), 'utf-8');
            await fs.rename(tmpPath, SESSION_PATH);
            return { ok: true };
        }
        catch (err) {
            log.error('session:save failed', err);
            return { ok: false, message: err.message };
        }
    });
}
