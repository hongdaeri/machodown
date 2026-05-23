import chokidar, { FSWatcher } from 'chokidar'
import type { BrowserWindow } from 'electron'
import log from 'electron-log/main'

const watchers = new Map<string, FSWatcher>()

export const WatcherService = {
  add(folderPath: string, win: BrowserWindow): void {
    if (watchers.has(folderPath)) return

    const watcher = chokidar.watch(folderPath, {
      ignored: /(^|[/\\])\../,
      persistent: true,
      ignoreInitial: true,
      depth: 10
    })

    watcher
      .on('change', (path) => {
        win.webContents.send('watch:changed', { path, event: 'change' })
      })
      .on('add', (path) => {
        win.webContents.send('watch:added', { path, event: 'add' })
      })
      .on('addDir', (path) => {
        win.webContents.send('watch:added', { path, event: 'addDir' })
      })
      .on('unlink', (path) => {
        win.webContents.send('watch:removed', { path, event: 'unlink' })
      })
      .on('unlinkDir', (path) => {
        win.webContents.send('watch:removed', { path, event: 'unlinkDir' })
      })
      .on('error', (err) => {
        log.error('WatcherService error', folderPath, err)
      })

    watchers.set(folderPath, watcher)
    log.info('WatcherService: watching', folderPath)
  },

  async remove(folderPath: string): Promise<void> {
    const watcher = watchers.get(folderPath)
    if (!watcher) return
    await watcher.close()
    watchers.delete(folderPath)
    log.info('WatcherService: stopped watching', folderPath)
  },

  async removeAll(): Promise<void> {
    await Promise.all([...watchers.keys()].map((p) => WatcherService.remove(p)))
  }
}
