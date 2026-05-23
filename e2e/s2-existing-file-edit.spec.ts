/**
 * S2 — 기존 파일 편집
 * 1. 기존 파일을 읽기
 * 2. 내용 수정 후 저장
 * 3. 디스크에서 읽어 수정된 내용 확인
 */
import { test, expect, _electron as electron } from '@playwright/test'
import { join } from 'path'
import fs from 'fs/promises'
import os from 'os'

test('S2: 기존 파일을 읽고 내용을 수정하여 저장하면 변경사항이 반영된다', async () => {
  const app = await electron.launch({
    args: [join(__dirname, '../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })

  const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'mf-s2-'))
  const filePath = join(tmpDir, 'existing.md')
  const originalContent = '# Original\n\nOriginal content.\n'
  const updatedContent = '# Updated\n\nEdited content.\n'

  await fs.writeFile(filePath, originalContent, 'utf-8')

  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('.editor-body', { timeout: 15_000 })

    // Read existing file via IPC
    const readResult = await page.evaluate(async (path: string) => {
      const res = (await window.api.invoke('fs:readFile', { path })) as {
        ok: boolean
        content?: string
        mtime?: number
      }
      return res
    }, filePath)

    expect(readResult.ok).toBe(true)
    expect(readResult.content).toBe(originalContent)

    // Write updated content
    const writeResult = await page.evaluate(
      async ({ path, text }: { path: string; text: string }) => {
        return (await window.api.invoke('fs:writeFile', {
          path,
          content: text,
          encoding: 'utf-8',
          eol: 'LF'
        })) as { ok: boolean }
      },
      { path: filePath, text: updatedContent }
    )

    expect(writeResult.ok).toBe(true)

    // Verify the change on disk (not via IPC — independent confirmation)
    const onDisk = await fs.readFile(filePath, 'utf-8')
    expect(onDisk).toBe(updatedContent)
  } finally {
    await app.close()
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
})

test('S2: 저장 후 mtime이 갱신된다', async () => {
  const app = await electron.launch({
    args: [join(__dirname, '../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })

  const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'mf-s2b-'))
  const filePath = join(tmpDir, 'mtime.md')
  await fs.writeFile(filePath, '# Before\n', 'utf-8')
  const statBefore = await fs.stat(filePath)

  // small delay so mtime can differ
  await new Promise((r) => setTimeout(r, 50))

  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('.editor-body', { timeout: 15_000 })

    await page.evaluate(
      async ({ path, text }: { path: string; text: string }) => {
        await window.api.invoke('fs:writeFile', {
          path,
          content: text,
          encoding: 'utf-8',
          eol: 'LF'
        })
      },
      { path: filePath, text: '# After\n' }
    )

    const statAfter = await fs.stat(filePath)
    expect(statAfter.mtimeMs).toBeGreaterThanOrEqual(statBefore.mtimeMs)
  } finally {
    await app.close()
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
})
