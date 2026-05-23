import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import { Folder } from '../../stores/types'
import { SidebarTree } from './SidebarTree'
import { openFileByPath } from '../../lib/fileActions'

interface SearchResult {
  name: string
  path: string
  dir: string
}

async function pickAndAddFolder(addFolder: (f: Folder) => Promise<void>): Promise<void> {
  const result = (await window.api.invoke('dialog:openDirectory')) as {
    ok: boolean
    canceled: boolean
    paths: string[]
  }
  if (!result.ok || result.canceled || result.paths.length === 0) return
  const path = result.paths[0]
  const folder: Folder = {
    id: path,
    path,
    name: path.split('/').pop() ?? path
  }
  await addFolder(folder)
}

export function Sidebar(): React.ReactElement {
  const folders = useWorkspaceStore((s) => s.folders)
  const addFolder = useWorkspaceStore((s) => s.addFolder)
  const sidebarWidth = useUiStore((s) => s.sidebarWidth)
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const activeTabPath = tabs.find((t) => t.id === activeTabId)?.path

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSearchMode = query.length > 0

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      const roots = folders.map((f) => f.path)
      if (roots.length === 0) {
        setResults([])
        return
      }
      const res = (await window.api.invoke('fs:searchFiles', {
        roots,
        query: query.trim()
      })) as { ok: boolean; files: SearchResult[] }
      if (res.ok) setResults(res.files)
    }, 150)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, folders])

  const handleAddFolder = useCallback((): void => {
    void pickAndAddFolder(addFolder)
  }, [addFolder])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>): void => {
      e.preventDefault()
      Array.from(e.dataTransfer.files).forEach((file) => {
        const path = (file as File & { path: string }).path
        if (!path) return
        const folder: Folder = { id: path, path, name: path.split('/').pop() ?? path }
        void addFolder(folder)
      })
    },
    [addFolder]
  )

  return (
    <aside
      className="sidebar"
      style={{ width: sidebarWidth }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="sb-section-header">
        <div className="sb-section-title-row" style={{ cursor: 'default', paddingLeft: 8 }}>
          <span className="sb-section-name">워크스페이스</span>
        </div>
        <div className="sb-section-actions">
          <button className="icon-btn" title="폴더 열기" onClick={handleAddFolder}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 3.5C1 2.67 1.67 2 2.5 2H5l1.5 1.5H11.5c.83 0 1.5.67 1.5 1.5V7"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="1"
                y="5.5"
                width="8"
                height="7"
                rx="1"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M5 7.5v3M3.5 9h3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="sb-search-wrap">
        <svg className="sb-search-ico" width="11" height="11" viewBox="0 0 12 12" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          className="sb-search-input"
          placeholder="파일 · 내용 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="sb-search-clear" onClick={() => setQuery('')}>
            ×
          </button>
        )}
      </div>

      {isSearchMode ? (
        <div className="tree">
          {results.length === 0 ? (
            <p className="sb-search-empty">결과 없음</p>
          ) : (
            results.map((r) => (
              <div
                key={r.path}
                className="sb-file-row"
                onClick={() => void openFileByPath(r.path)}
                title={r.path}
              >
                <span className="sb-file-name">{r.name}</span>
                <span className="sb-file-dir">{r.dir.split('/').pop()}</span>
                {activeTabPath === r.path && <span className="dot-active" />}
              </div>
            ))
          )}
        </div>
      ) : folders.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '0 16px',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--fg-tertiary)', margin: 0, lineHeight: 1.5 }}>
            폴더를 추가하거나 여기에 드래그하세요
          </p>
          <button
            className="icon-btn"
            style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
            onClick={handleAddFolder}
          >
            폴더 열기
          </button>
        </div>
      ) : (
        <div className="tree">
          {folders.map((folder) => (
            <SidebarTree key={folder.id} folder={folder} />
          ))}
        </div>
      )}
    </aside>
  )
}
