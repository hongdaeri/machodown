import fs from 'fs/promises';
import log from 'electron-log/main';
export async function runMigrations(filePath, migrations) {
    let raw;
    try {
        raw = await fs.readFile(filePath, 'utf-8');
    }
    catch {
        return;
    }
    let versioned;
    try {
        const parsed = JSON.parse(raw);
        versioned = {
            $schema: typeof parsed['$schema'] === 'number' ? parsed['$schema'] : 0,
            $updatedAt: typeof parsed['$updatedAt'] === 'number' ? parsed['$updatedAt'] : 0,
            data: parsed['data'] ?? parsed
        };
    }
    catch {
        log.warn('MigrationRunner: failed to parse', filePath);
        return;
    }
    const pending = migrations
        .filter((m) => m.version > versioned.$schema)
        .sort((a, b) => a.version - b.version);
    if (pending.length === 0)
        return;
    let data = versioned.data;
    let currentVersion = versioned.$schema;
    for (const migration of pending) {
        try {
            data = migration.migrate(data);
            currentVersion = migration.version;
            log.info(`MigrationRunner: applied v${migration.version} to ${filePath}`);
        }
        catch (err) {
            log.error(`MigrationRunner: migration v${migration.version} failed for ${filePath}`, err);
            return;
        }
    }
    const updated = {
        $schema: currentVersion,
        $updatedAt: Date.now(),
        data
    };
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(updated, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
}
