import chokidar from 'chokidar';
import log from 'electron-log/main';
const watchers = new Map();
export const WatcherService = {
    add(folderPath, win) {
        if (watchers.has(folderPath))
            return;
        const watcher = chokidar.watch(folderPath, {
            ignored: /(^|[/\\])\../,
            persistent: true,
            ignoreInitial: true,
            depth: 10
        });
        watcher
            .on('change', (path) => {
            win.webContents.send('watch:changed', { path, event: 'change' });
        })
            .on('add', (path) => {
            win.webContents.send('watch:added', { path, event: 'add' });
        })
            .on('unlink', (path) => {
            win.webContents.send('watch:removed', { path, event: 'unlink' });
        })
            .on('error', (err) => {
            log.error('WatcherService error', folderPath, err);
        });
        watchers.set(folderPath, watcher);
        log.info('WatcherService: watching', folderPath);
    },
    async remove(folderPath) {
        const watcher = watchers.get(folderPath);
        if (!watcher)
            return;
        await watcher.close();
        watchers.delete(folderPath);
        log.info('WatcherService: stopped watching', folderPath);
    },
    async removeAll() {
        await Promise.all([...watchers.keys()].map((p) => WatcherService.remove(p)));
    }
};
