import { ipcMain, app } from 'electron'
import fs from 'fs/promises'
import { join } from 'path'
import log from 'electron-log/main'

const FLAG_PATH = join(app.getPath('userData'), '.running')

// P1-53: returns true if the previous session ended abnormally
export async function detectAbnormalShutdown(): Promise<boolean> {
  let wasAbnormal = false
  try {
    await fs.access(FLAG_PATH)
    wasAbnormal = true
  } catch {
    // file doesn't exist → normal
  }
  await fs.writeFile(FLAG_PATH, String(Date.now()), 'utf-8')
  app.on('before-quit', () => {
    fs.unlink(FLAG_PATH).catch(() => {})
  })
  return wasAbnormal
}

type LaunchType = 'first-launch' | 'after-update' | 'normal'

async function detectLaunchType(): Promise<LaunchType> {
  const configPath = join(app.getPath('userData'), 'config.json')
  try {
    const raw = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const savedVersion = parsed.$appVersion as string | undefined
    if (savedVersion !== app.getVersion()) return 'after-update'
    return 'normal'
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return 'first-launch'
    log.warn('detectLaunchType: unexpected error', err)
    return 'normal'
  }
}

export function registerAppHandlers(): void {
  ipcMain.handle('app:getVersion', () => {
    return { ok: true, version: app.getVersion() }
  })

  ipcMain.handle('app:launchType', async () => {
    const type = await detectLaunchType()
    return { ok: true, type }
  })

  ipcMain.handle('app:finishUpdate', async () => {
    const configPath = join(app.getPath('userData'), 'config.json')
    try {
      let config: Record<string, unknown> = {}
      try {
        const raw = await fs.readFile(configPath, 'utf-8')
        config = JSON.parse(raw) as Record<string, unknown>
      } catch {
        // config doesn't exist yet — start fresh
      }
      config.$appVersion = app.getVersion()
      await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
      return { ok: true }
    } catch (err: unknown) {
      log.warn('app:finishUpdate: failed to write config', err)
      return { ok: false, message: 'Failed to update config' }
    }
  })

  ipcMain.handle('app:reportError', (_, args: { message: string; stack?: string }) => {
    log.error('[renderer]', args.message, args.stack)
    return { ok: true }
  })
}
