import { app } from 'electron'
import fs from 'fs/promises'
import { join } from 'path'
import log from 'electron-log/main'
import type { Folder } from '../../renderer/src/stores/types'

const WORKSPACES_PATH = join(app.getPath('userData'), 'workspaces.json')

interface VersionedWorkspaces {
  $schema: number
  $updatedAt: number
  data: Folder[]
}

async function read(): Promise<Folder[]> {
  try {
    const raw = await fs.readFile(WORKSPACES_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as VersionedWorkspaces
    return parsed.data ?? []
  } catch {
    return []
  }
}

async function write(folders: Folder[]): Promise<void> {
  const versioned: VersionedWorkspaces = {
    $schema: 1,
    $updatedAt: Date.now(),
    data: folders
  }
  const tmpPath = `${WORKSPACES_PATH}.tmp`
  await fs.writeFile(tmpPath, JSON.stringify(versioned, null, 2), 'utf-8')
  await fs.rename(tmpPath, WORKSPACES_PATH)
}

export const WorkspaceService = {
  async getFolders(): Promise<Folder[]> {
    return read()
  },

  async addFolder(folder: Folder): Promise<Folder[]> {
    const folders = await read()
    if (folders.some((f) => f.id === folder.id || f.path === folder.path)) {
      return folders
    }
    const updated = [...folders, folder]
    await write(updated)
    return updated
  },

  async removeFolder(id: string): Promise<Folder[]> {
    const folders = await read()
    const updated = folders.filter((f) => f.id !== id)
    try {
      await write(updated)
    } catch (err) {
      log.error('WorkspaceService.removeFolder failed', err)
    }
    return updated
  }
}
