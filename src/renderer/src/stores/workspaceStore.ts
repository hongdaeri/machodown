import { create } from 'zustand'
import { Folder, FileNode } from './types'

const MAX_RECENT = 30

interface RecentFile {
  path: string
  openedAt: number
}

interface WorkspaceState {
  folders: Folder[]
  recentFiles: RecentFile[]
  treeNodes: Record<string, FileNode[]>
  mdActiveFolders: ReadonlySet<string>
  load: () => Promise<void>
  addFolder: (folder: Folder) => Promise<void>
  removeFolder: (id: string) => Promise<void>
  pushRecent: (path: string) => Promise<void>
  refreshNode: (folderPath: string) => Promise<void>
  setTreeNodes: (folderPath: string, nodes: FileNode[]) => void
  scanMdFolders: (rootPath: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  folders: [],
  recentFiles: [],
  treeNodes: {},
  mdActiveFolders: new Set<string>(),

  load: async () => {
    const [foldersRes, recentRes] = await Promise.all([
      window.api.invoke('workspace:getFolders'),
      window.api.invoke('recent:getFiles')
    ])
    const fr = foldersRes as { ok: boolean; folders: Folder[] }
    const rr = recentRes as { ok: boolean; files: RecentFile[] }
    set({
      folders: fr.ok ? fr.folders : [],
      recentFiles: rr.ok ? rr.files : []
    })
  },

  addFolder: async (folder) => {
    const res = (await window.api.invoke('workspace:addFolder', { folder })) as {
      ok: boolean
      folders: Folder[]
    }
    if (res.ok) set({ folders: res.folders })
  },

  removeFolder: async (id) => {
    const res = (await window.api.invoke('workspace:removeFolder', { id })) as {
      ok: boolean
      folders: Folder[]
    }
    if (res.ok) set({ folders: res.folders })
  },

  pushRecent: async (path) => {
    set((state) => {
      const filtered = state.recentFiles.filter((r) => r.path !== path)
      const updated = [{ path, openedAt: Date.now() }, ...filtered]
      return { recentFiles: updated.slice(0, MAX_RECENT) }
    })
    await window.api.invoke('recent:addFile', { path })
  },

  refreshNode: async (folderPath) => {
    const res = (await window.api.invoke('fs:readDirectory', { path: folderPath })) as {
      ok: boolean
      items: Array<{ name: string; path: string; isDirectory: boolean }>
    }
    if (!res.ok) return
    const nodes = buildFileNodes(res.items, folderPath)
    set((state) => ({ treeNodes: { ...state.treeNodes, [folderPath]: nodes } }))
  },

  setTreeNodes: (folderPath, nodes) => {
    set((state) => ({ treeNodes: { ...state.treeNodes, [folderPath]: nodes } }))
  },

  scanMdFolders: async (rootPath) => {
    const res = (await window.api.invoke('fs:scanMdFolders', { path: rootPath })) as {
      ok: boolean
      folders: string[]
    }
    if (!res.ok) return
    set((state) => {
      const updated = new Set<string>()
      for (const f of state.mdActiveFolders) {
        if (!f.startsWith(rootPath + '/') && f !== rootPath) updated.add(f)
      }
      for (const f of res.folders) updated.add(f)
      return { mdActiveFolders: updated }
    })
  }
}))

function buildFileNodes(
  entries: Array<{ name: string; path: string; isDirectory: boolean }>,
  parentPath: string
): FileNode[] {
  const visible = entries.filter((e) => !e.name.startsWith('.'))
  const mdFiles = visible.filter((e) => !e.isDirectory && e.name.endsWith('.md'))
  const dirs = visible.filter((e) => e.isDirectory)

  const dirNodes: FileNode[] = dirs.map((d) => ({
    id: d.path,
    name: d.name,
    path: d.path,
    type: 'folder' as const,
    parentPath
  }))

  const fileNodes: FileNode[] = mdFiles.map((f) => ({
    id: f.path,
    name: f.name,
    path: f.path,
    type: 'file' as const,
    parentPath
  }))

  return [...dirNodes, ...fileNodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  })
}
