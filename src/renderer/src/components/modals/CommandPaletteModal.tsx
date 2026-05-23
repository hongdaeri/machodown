import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { openFileByPath } from '../../lib/fileActions'
import { FileNode } from '../../stores/types'

interface ResultItem {
  path: string
  name: string
}

function getAllFiles(treeNodes: Record<string, FileNode[]>): FileNode[] {
  const files: FileNode[] = []
  const seen = new Set<string>()

  const collect = (nodes: FileNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'file' && !seen.has(node.path)) {
        seen.add(node.path)
        files.push(node)
      } else if (node.type === 'folder' && treeNodes[node.path]) {
        collect(treeNodes[node.path])
      }
    }
  }

  Object.values(treeNodes).forEach(collect)
  return files
}

export function CommandPaletteModal(): React.ReactElement {
  const closeModal = useUiStore((s) => s.closeModal)
  const treeNodes = useWorkspaceStore((s) => s.treeNodes)
  const recentFiles = useWorkspaceStore((s) => s.recentFiles) as Array<{ path: string }>

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const allFiles = useMemo(() => getAllFiles(treeNodes), [treeNodes])

  const results = useMemo((): ResultItem[] => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return recentFiles
        .slice(0, 10)
        .map((r) => ({ path: r.path, name: r.path.split('/').pop() ?? r.path }))
    }
    return allFiles
      .filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
      .slice(0, 20)
      .map((f) => ({ path: f.path, name: f.name }))
  }, [query, allFiles, recentFiles])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const selected = listRef.current?.querySelector<HTMLElement>('.cmd-palette__item.selected')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleSelect = (path: string): void => {
    closeModal()
    void openFileByPath(path)
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      closeModal()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = results[selectedIndex]
      if (item) handleSelect(item.path)
    }
  }

  return (
    <div className="modal-scrim" onClick={closeModal}>
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <input
          ref={inputRef}
          className="cmd-palette__input"
          type="text"
          placeholder="파일 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div ref={listRef} className="cmd-palette__list">
          {results.length === 0 ? (
            <div className="cmd-palette__empty">결과 없음</div>
          ) : (
            results.map((item, i) => (
              <div
                key={item.path}
                className={`cmd-palette__item${i === selectedIndex ? ' selected' : ''}`}
                onClick={() => handleSelect(item.path)}
              >
                <span className="cmd-palette__name">{item.name}</span>
                <span className="cmd-palette__path">{item.path}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
