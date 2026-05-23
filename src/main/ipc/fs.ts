import { ipcMain } from 'electron'
import fs from 'fs/promises'
import { constants } from 'fs'
import log from 'electron-log/main'
import jschardet from 'jschardet'
import iconv from 'iconv-lite'

type Encoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'euc-kr'
type EOL = 'LF' | 'CRLF'

function detectEncoding(buf: Buffer): Encoding {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return 'utf-8'
  if (buf[0] === 0xff && buf[1] === 0xfe) return 'utf-16le'
  if (buf[0] === 0xfe && buf[1] === 0xff) return 'utf-16be'
  const detected = jschardet.detect(buf)
  const enc = (detected?.encoding ?? 'UTF-8').toLowerCase()
  if (enc.includes('euc-kr') || enc.includes('euckr')) return 'euc-kr'
  if (enc.includes('utf-16') && enc.includes('le')) return 'utf-16le'
  if (enc.includes('utf-16') && enc.includes('be')) return 'utf-16be'
  return 'utf-8'
}

export function registerFsHandlers(): void {
  ipcMain.handle('fs:readFile', async (_, args: { path: string }) => {
    try {
      const buf = await fs.readFile(args.path)
      const stat = await fs.stat(args.path)
      const encoding: Encoding = detectEncoding(buf)
      const content = iconv.decode(buf, encoding)
      const eol: EOL = content.includes('\r\n') ? 'CRLF' : 'LF'
      return { ok: true, content, encoding, eol, mtime: stat.mtimeMs }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      log.error('fs:readFile failed', { path: args.path, code })
      return { ok: false, code, message: (err as Error).message }
    }
  })

  ipcMain.handle(
    'fs:writeFile',
    async (_, args: { path: string; content: string; encoding?: BufferEncoding }) => {
      try {
        const tmpPath = `${args.path}.tmp`
        await fs.writeFile(tmpPath, args.content, args.encoding ?? 'utf-8')
        await fs.rename(tmpPath, args.path)
        return { ok: true, mtime: Date.now() }
      } catch (err: unknown) {
        const code = (err as NodeJS.ErrnoException).code
        log.error('fs:writeFile failed', { path: args.path, code })
        return { ok: false, code, message: (err as Error).message }
      }
    }
  )

  ipcMain.handle('fs:createFile', async (_, args: { path: string }) => {
    try {
      await fs.access(args.path, constants.F_OK)
      return { ok: false, code: 'EEXIST', message: '이미 존재합니다.' }
    } catch {
      try {
        await fs.writeFile(args.path, '', 'utf-8')
        return { ok: true }
      } catch (err: unknown) {
        const code = (err as NodeJS.ErrnoException).code
        log.error('fs:createFile failed', { path: args.path, code })
        return { ok: false, code, message: (err as Error).message }
      }
    }
  })

  ipcMain.handle('fs:rename', async (_, args: { oldPath: string; newPath: string }) => {
    try {
      await fs.rename(args.oldPath, args.newPath)
      return { ok: true }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      log.error('fs:rename failed', { oldPath: args.oldPath, newPath: args.newPath, code })
      return { ok: false, code, message: (err as Error).message }
    }
  })

  ipcMain.handle('fs:trash', async (_, args: { path: string }) => {
    try {
      const { shell } = await import('electron')
      await shell.trashItem(args.path)
      return { ok: true }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      log.error('fs:trash failed', { path: args.path, code })
      return { ok: false, code, message: (err as Error).message }
    }
  })

  ipcMain.handle('fs:readDirectory', async (_, args: { path: string }) => {
    try {
      const entries = await fs.readdir(args.path, { withFileTypes: true })
      const items = entries.map((e) => ({
        name: e.name,
        path: `${args.path}/${e.name}`,
        isDirectory: e.isDirectory(),
        isFile: e.isFile()
      }))
      return { ok: true, items }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      log.error('fs:readDirectory failed', { path: args.path, code })
      return { ok: false, code, message: (err as Error).message }
    }
  })

  ipcMain.handle('fs:stat', async (_, args: { path: string }) => {
    try {
      const stat = await fs.stat(args.path)
      return {
        ok: true,
        size: stat.size,
        mtime: stat.mtimeMs,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile()
      }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      log.error('fs:stat failed', { path: args.path, code })
      return { ok: false, code, message: (err as Error).message }
    }
  })

  ipcMain.handle('fs:mkdir', async (_, args: { path: string }) => {
    try {
      await fs.mkdir(args.path, { recursive: true })
      return { ok: true }
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      log.error('fs:mkdir failed', { path: args.path, code })
      return { ok: false, code, message: (err as Error).message }
    }
  })

  ipcMain.handle('fs:searchFiles', async (_, args: { roots: string[]; query: string }) => {
    const files: Array<{ name: string; path: string; dir: string }> = []
    const SKIP_DIRS = new Set(['node_modules'])
    const q = args.query.toLowerCase()

    async function walkSearch(dirPath: string): Promise<void> {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue
          if (SKIP_DIRS.has(entry.name)) continue
          const fullPath = `${dirPath}/${entry.name}`
          if (entry.isDirectory()) {
            await walkSearch(fullPath)
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            if (!q || entry.name.toLowerCase().includes(q)) {
              files.push({ name: entry.name, path: fullPath, dir: dirPath })
            }
          }
        }
      } catch {
        // skip unreadable dirs
      }
    }

    await Promise.all(args.roots.map(walkSearch))
    return { ok: true, files }
  })

  ipcMain.handle('fs:scanMdFolders', async (_, args: { path: string }) => {
    const mdFolders: string[] = []
    const SKIP_DIRS = new Set(['node_modules'])

    async function walk(dirPath: string): Promise<boolean> {
      let hasMd = false
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue
          if (SKIP_DIRS.has(entry.name)) continue
          if (entry.isFile() && entry.name.endsWith('.md')) {
            hasMd = true
          } else if (entry.isDirectory()) {
            const childHas = await walk(`${dirPath}/${entry.name}`)
            if (childHas) hasMd = true
          }
        }
      } catch {
        // unreadable dir — skip
      }
      if (hasMd) mdFolders.push(dirPath)
      return hasMd
    }

    await walk(args.path)
    return { ok: true, folders: mdFolders }
  })
}
