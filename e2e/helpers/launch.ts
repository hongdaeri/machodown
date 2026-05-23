import { _electron as electron, ElectronApplication, Page } from '@playwright/test'
import { join } from 'path'
import fs from 'fs/promises'
import os from 'os'

export interface AppHandle {
  app: ElectronApplication
  page: Page
  tmpDir: string
}

export async function launchApp(): Promise<AppHandle> {
  const app = await electron.launch({
    args: [join(__dirname, '../../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  // wait for Monaco to be ready (editor container visible)
  await page.waitForSelector('.editor-body', { timeout: 15_000 })

  const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'markflow-e2e-'))

  return { app, page, tmpDir }
}

export async function closeApp(handle: AppHandle): Promise<void> {
  await handle.app.close()
  await fs.rm(handle.tmpDir, { recursive: true, force: true })
}

/** Opens a file in the app by invoking the IPC read+tab path directly. */
export async function openFileInApp(page: Page, filePath: string): Promise<void> {
  await page.evaluate(async (path: string) => {
    const res = (await window.api.invoke('fs:readFile', { path })) as {
      ok: boolean
      content: string
      encoding: string
      eol: string
      mtime: number
    }
    if (!res.ok) throw new Error(`fs:readFile failed for ${path}`)

    // inject tab directly into editorStore
    const { useEditorStore } = await import('/src/renderer/src/stores/editorStore.ts')
    const store = useEditorStore.getState()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(store as any).openTab({
      path,
      content: res.content,
      encoding: res.encoding ?? 'utf-8',
      eol: res.eol ?? 'LF',
      mtime: res.mtime
    })
  }, filePath)
  await page.waitForTimeout(300)
}
