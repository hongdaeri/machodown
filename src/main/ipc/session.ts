import { ipcMain, app } from 'electron'
import fs from 'fs/promises'
import { join } from 'path'
import log from 'electron-log/main'

const SESSION_PATH = join(app.getPath('userData'), 'session.json')

export interface SessionTab {
  path: string
  encoding: string
  eol: string
}

export interface SessionData {
  editorWidth: number | undefined
  sidebarWidth: number
  viewMode: 'split' | 'editor' | 'preview'
  sidebarVisible: boolean
  tabs: SessionTab[]
  activeTabPath: string | undefined
}

const DEFAULT_SESSION: SessionData = {
  editorWidth: undefined,
  sidebarWidth: 240,
  viewMode: 'split',
  sidebarVisible: true,
  tabs: [],
  activeTabPath: undefined
}

export function registerSessionHandlers(): void {
  ipcMain.handle('session:get', async () => {
    try {
      const raw = await fs.readFile(SESSION_PATH, 'utf-8')
      const data = JSON.parse(raw) as Partial<SessionData>
      return { ok: true, session: { ...DEFAULT_SESSION, ...data } }
    } catch {
      return { ok: true, session: DEFAULT_SESSION }
    }
  })

  ipcMain.handle('session:save', async (_, args: { session: Partial<SessionData> }) => {
    try {
      let current: SessionData = DEFAULT_SESSION
      try {
        const raw = await fs.readFile(SESSION_PATH, 'utf-8')
        current = { ...DEFAULT_SESSION, ...(JSON.parse(raw) as Partial<SessionData>) }
      } catch {
        // use defaults
      }

      const merged: SessionData = { ...current, ...args.session }
      const tmpPath = `${SESSION_PATH}.tmp`
      await fs.writeFile(tmpPath, JSON.stringify(merged, null, 2), 'utf-8')
      await fs.rename(tmpPath, SESSION_PATH)
      return { ok: true }
    } catch (err: unknown) {
      log.error('session:save failed', err)
      return { ok: false, message: (err as Error).message }
    }
  })
}
