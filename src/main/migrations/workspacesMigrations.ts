import type { Migration } from './MigrationRunner'
import type { Folder } from '../../renderer/src/stores/types'

interface FolderV1 {
  path: string
  name: string
}

export const workspacesMigrations: Migration[] = [
  {
    version: 1,
    migrate: (data: unknown): Folder[] => {
      if (!Array.isArray(data)) return []
      return (data as FolderV1[]).map((item) => ({
        id: item.path,
        path: item.path,
        name: item.name ?? item.path.split('/').pop() ?? item.path
      }))
    }
  }
]
