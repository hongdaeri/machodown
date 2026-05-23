import React from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { openFileByPath } from '../../lib/fileActions'

interface RecentFile {
  path: string
  openedAt: number
}

function basename(p: string): string {
  return p.split('/').pop() ?? p
}

function truncatePath(p: string): string {
  const max = 40
  if (p.length <= max) return p
  const parts = p.split('/')
  if (parts.length <= 3) return p
  return `.../${parts.slice(-2).join('/')}`
}

export function SidebarRecentFiles(): React.ReactElement | null {
  const recentFiles = useWorkspaceStore((s) => s.recentFiles) as RecentFile[]

  if (recentFiles.length === 0) return null

  return (
    <div className="sidebar-recent">
      <div className="sb-section-title">최근 파일</div>
      {recentFiles.slice(0, 10).map((f) => (
        <div
          key={f.path}
          className="recent-row"
          title={f.path}
          onClick={() => void openFileByPath(f.path)}
        >
          <span className="recent-name">{basename(f.path)}</span>
          <span className="recent-path">{truncatePath(f.path)}</span>
        </div>
      ))}
    </div>
  )
}
