import { useEffect } from 'react'
import { useWorkspaceStore } from '../stores/workspaceStore'

function findRootFolder(path: string): string | null {
  const folders = useWorkspaceStore.getState().folders
  const match = folders.find((f) => path.startsWith(f.path + '/') || path === f.path)
  return match?.path ?? null
}

export function useWorkspaceWatcher(): void {
  useEffect(() => {
    const unsubChanged = window.api.on('watch:changed', (payload) => {
      const { path } = payload as { path: string }
      const parentPath = path.substring(0, path.lastIndexOf('/'))
      useWorkspaceStore.getState().refreshNode(parentPath)
    })

    const unsubAdded = window.api.on('watch:added', (payload) => {
      const { path } = payload as { path: string }
      const parentPath = path.substring(0, path.lastIndexOf('/'))
      useWorkspaceStore.getState().refreshNode(parentPath)
      if (path.endsWith('.md')) {
        const root = findRootFolder(path)
        if (root) void useWorkspaceStore.getState().scanMdFolders(root)
      }
    })

    const unsubRemoved = window.api.on('watch:removed', (payload) => {
      const { path } = payload as { path: string }
      const parentPath = path.substring(0, path.lastIndexOf('/'))
      useWorkspaceStore.getState().refreshNode(parentPath)
      if (path.endsWith('.md')) {
        const root = findRootFolder(path)
        if (root) void useWorkspaceStore.getState().scanMdFolders(root)
      }
    })

    return () => {
      unsubChanged()
      unsubAdded()
      unsubRemoved()
    }
  }, [])
}
