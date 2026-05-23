import fs from 'fs/promises'
import { join, basename, extname } from 'path'
import { createHash } from 'crypto'
import log from 'electron-log/main'
// P1-52: retention constants
const AUTO_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const PRESAVE_MAX_PER_FILE = 10
const PRESAVE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
export class BackupService {
  backupDir
  autoDir
  versionsDir
  metadataPath
  metadata = []
  initialized = false
  static instance = null
  static getInstance(userData) {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService(userData)
    }
    return BackupService.instance
  }
  constructor(userData) {
    this.backupDir = join(userData, '.backup')
    this.autoDir = join(this.backupDir, 'auto')
    this.versionsDir = join(this.backupDir, 'versions')
    this.metadataPath = join(this.backupDir, 'metadata.json')
  }
  async init() {
    if (this.initialized) return
    await fs.mkdir(this.autoDir, { recursive: true })
    await fs.mkdir(this.versionsDir, { recursive: true })
    await this.loadMetadata()
    this.initialized = true
  }
  async loadMetadata() {
    try {
      const raw = await fs.readFile(this.metadataPath, 'utf-8')
      this.metadata = JSON.parse(raw)
    } catch {
      this.metadata = []
    }
  }
  async saveMetadata() {
    const tmp = `${this.metadataPath}.tmp`
    await fs.writeFile(tmp, JSON.stringify(this.metadata, null, 2), 'utf-8')
    await fs.rename(tmp, this.metadataPath)
  }
  hashPath(originalPath) {
    return createHash('sha1').update(originalPath).digest('hex').slice(0, 12)
  }
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
  async createBackup(args) {
    await this.init()
    const { type, originalPath, content, encoding, isDirty } = args
    const fileHash = this.hashPath(originalPath)
    const timestamp = Date.now()
    const id = this.generateId()
    const ext = extname(originalPath) || '.md'
    const name = basename(originalPath, ext)
    const dir = type === 'auto' ? this.autoDir : this.versionsDir
    const backupPath = join(dir, `${fileHash}-${name}-${timestamp}${ext}`)
    await fs.writeFile(backupPath, content, 'utf-8')
    const meta = {
      id,
      type,
      originalPath,
      backupPath,
      fileHash,
      timestamp,
      size: Buffer.byteLength(content, 'utf-8'),
      encoding,
      isDirty
    }
    this.metadata = [...this.metadata, meta]
    await this.saveMetadata()
    return meta
  }
  listBackups(originalPath) {
    if (!originalPath) return [...this.metadata]
    return this.metadata.filter((m) => m.originalPath === originalPath)
  }
  async recoverBackup(id) {
    await this.init()
    const meta = this.metadata.find((m) => m.id === id)
    if (!meta) return null
    try {
      const content = await fs.readFile(meta.backupPath, 'utf-8')
      return { content, encoding: meta.encoding }
    } catch (err) {
      log.error('BackupService.recoverBackup: read failed', { id, err })
      return null
    }
  }
  async deleteBackup(id) {
    await this.init()
    const idx = this.metadata.findIndex((m) => m.id === id)
    if (idx === -1) return
    const meta = this.metadata[idx]
    try {
      await fs.unlink(meta.backupPath)
    } catch {
      // already gone
    }
    this.metadata = [...this.metadata.slice(0, idx), ...this.metadata.slice(idx + 1)]
    await this.saveMetadata()
  }
  async clearAll() {
    await this.init()
    for (const meta of this.metadata) {
      try {
        await fs.unlink(meta.backupPath)
      } catch {
        // ignore
      }
    }
    this.metadata = []
    await this.saveMetadata()
  }
  // P1-52: enforce retention rules
  async cleanup() {
    await this.init()
    const now = Date.now()
    const toDelete = []
    // auto: max 7 days
    for (const m of this.metadata) {
      if (m.type === 'auto' && now - m.timestamp > AUTO_MAX_AGE_MS) {
        toDelete.push(m.id)
      }
    }
    // pre-save: max 30 days + max 10 per file
    const byFile = new Map()
    for (const m of this.metadata) {
      if (m.type !== 'pre-save') continue
      if (toDelete.includes(m.id)) continue
      if (now - m.timestamp > PRESAVE_MAX_AGE_MS) {
        toDelete.push(m.id)
        continue
      }
      const arr = byFile.get(m.originalPath) ?? []
      arr.push(m)
      byFile.set(m.originalPath, arr)
    }
    for (const entries of byFile.values()) {
      entries.sort((a, b) => b.timestamp - a.timestamp)
      for (const m of entries.slice(PRESAVE_MAX_PER_FILE)) {
        toDelete.push(m.id)
      }
    }
    for (const id of toDelete) {
      await this.deleteBackup(id)
    }
    if (toDelete.length > 0) {
      log.info(`BackupService.cleanup: removed ${toDelete.length} entries`)
    }
  }
}
