import { app } from 'electron';
import fs from 'fs/promises';
import { join } from 'path';
import log from 'electron-log/main';
const WORKSPACES_PATH = join(app.getPath('userData'), 'workspaces.json');
async function read() {
    try {
        const raw = await fs.readFile(WORKSPACES_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.data ?? [];
    }
    catch {
        return [];
    }
}
async function write(folders) {
    const versioned = {
        $schema: 1,
        $updatedAt: Date.now(),
        data: folders
    };
    const tmpPath = `${WORKSPACES_PATH}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(versioned, null, 2), 'utf-8');
    await fs.rename(tmpPath, WORKSPACES_PATH);
}
export const WorkspaceService = {
    async getFolders() {
        return read();
    },
    async addFolder(folder) {
        const folders = await read();
        if (folders.some((f) => f.id === folder.id || f.path === folder.path)) {
            return folders;
        }
        const updated = [...folders, folder];
        await write(updated);
        return updated;
    },
    async removeFolder(id) {
        const folders = await read();
        const updated = folders.filter((f) => f.id !== id);
        try {
            await write(updated);
        }
        catch (err) {
            log.error('WorkspaceService.removeFolder failed', err);
        }
        return updated;
    }
};
