import { ipcMain } from 'electron';
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import log from 'electron-log/main';
const MAX_MATCHES_PER_FILE = 100;
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
async function collectMdFiles(dir, results) {
    let entries;
    try {
        entries = await readdir(dir, { withFileTypes: true });
    }
    catch {
        return;
    }
    for (const entry of entries) {
        if (entry.name.startsWith('.'))
            continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            await collectMdFiles(full, results);
        }
        else if (entry.isFile() && extname(entry.name).toLowerCase() === '.md') {
            results.push(full);
        }
    }
}
function buildPattern(query, useRegex, caseSensitive) {
    const flags = caseSensitive ? 'g' : 'gi';
    if (useRegex) {
        return new RegExp(query, flags);
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, flags);
}
async function searchFile(filePath, pattern) {
    let content;
    try {
        const buf = await readFile(filePath);
        if (buf.byteLength > MAX_FILE_SIZE)
            return [];
        content = buf.toString('utf-8');
    }
    catch {
        return [];
    }
    const matches = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length && matches.length < MAX_MATCHES_PER_FILE; i++) {
        pattern.lastIndex = 0;
        if (pattern.test(lines[i])) {
            matches.push({ lineNumber: i + 1, line: lines[i].slice(0, 200) });
        }
    }
    return matches;
}
export function registerSearchHandlers() {
    ipcMain.handle('search:files', async (_, args) => {
        const { folders, query, useRegex, caseSensitive } = args;
        if (!query.trim())
            return { ok: true, results: [] };
        let pattern;
        try {
            pattern = buildPattern(query, useRegex, caseSensitive);
        }
        catch (err) {
            return { ok: false, message: err.message };
        }
        try {
            const filePaths = [];
            await Promise.all(folders.map((f) => collectMdFiles(f, filePaths)));
            const results = [];
            await Promise.all(filePaths.map(async (fp) => {
                const matches = await searchFile(fp, pattern);
                if (matches.length > 0)
                    results.push({ path: fp, matches });
            }));
            results.sort((a, b) => a.path.localeCompare(b.path));
            return { ok: true, results };
        }
        catch (err) {
            log.error('search:files error', err);
            return { ok: false, message: err.message };
        }
    });
}
