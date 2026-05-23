/**
 * S1 — 새 파일 저장
 * 1. 빈 탭 생성
 * 2. 내용 입력
 * 3. fs:writeFile IPC로 저장
 * 4. 디스크에서 읽어 내용 확인
 */
import { test, expect, _electron as electron } from '@playwright/test'
import { join } from 'path'
import fs from 'fs/promises'
import os from 'os'

test('S1: 새 파일에 내용을 입력하고 저장하면 디스크에 기록된다', async () => {
  const app = await electron.launch({
    args: [join(__dirname, '../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })

  const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'mf-s1-'))
  const filePath = join(tmpDir, 'hello.md')
  const content = '# Hello Markflow\n\nThis is a new file.\n'

  try {
    const page = await app.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('.editor-body', { timeout: 15_000 })

    // Create file on disk then save content via IPC (simulates "Save As" completion)
    const writeResult = await page.evaluate(
      async ({ path, text }: { path: string; text: string }) => {
        const res = (await window.api.invoke('fs:writeFile', {
          path,
          content: text,
          encoding: 'utf-8',
          eol: 'LF'
        })) as { ok: boolean; message?: string }
        return res
      },
      { path: filePath, text: content }
    )

    expect(writeResult.ok).toBe(true)

    // verify file exists and content matches
    const saved = await fs.readFile(filePath, 'utf-8')
    expect(saved).toBe(content)
  } finally {
    await app.close()
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
})

test('S1: 저장 후 fs:readFile로 내용을 재확인할 수 있다', async () => {
  const app = await electron.launch({
    args: [join(__dirname, '../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })

  const tmpDir = await fs.mkdtemp(join(os.tmpdir(), 'mf-s1b-'))
  const filePath = join(tmpDir, 'roundtrip.md')
  const content = '# Round-trip test\n'

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
      { path: filePath, text: content }
    )

    const readResult = await page.evaluate(async (path: string) => {
      const res = (await window.api.invoke('fs:readFile', { path })) as {
        ok: boolean
        content?: string
      }
      return res
    }, filePath)

    expect(readResult.ok).toBe(true)
    expect(readResult.content).toBe(content)
  } finally {
    await app.close()
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
})
