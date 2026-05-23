import { app } from 'electron';
import fs from 'fs/promises';
import { join } from 'path';
import log from 'electron-log/main';
const RECENT_PATH = join(app.getPath('userData'), 'recent-files.json');
const MAX_RECENT = 30;
async function read() {
    try {
        const raw = await fs.readFile(RECENT_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.data ?? [];
    }
    catch {
        return [];
    }
}
async function write(files) {
    const versioned = {
        $schema: 1,
        $updatedAt: Date.now(),
        data: files
    };
    const tmpPath = `${RECENT_PATH}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(versioned, null, 2), 'utf-8');
    await fs.rename(tmpPath, RECENT_PATH);
}
export const RecentFilesService = {
    async getFiles() {
        return read();
    },
    async addFile(path) {
        const files = await read();
        const filtered = files.filter((f) => f.path !== path);
        const updated = [{ path, openedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
        try {
            await write(updated);
        }
        catch (err) {
            log.error('RecentFilesService.addFile failed', err);
        }
        return updated;
    }
};
