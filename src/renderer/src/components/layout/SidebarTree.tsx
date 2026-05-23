import React, { useState, useEffect, useCallback } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { FileNode, Folder } from '../../stores/types'
import { openFileByPath } from '../../lib/fileActions'

interface Props {
  folder: Folder
}

interface NodeRowProps {
  node: FileNode
  depth: number
  activeTabPath: string | undefined
  onContextMenu: (e: React.MouseEvent, node: FileNode) => void
}

interface ContextMenuState {
  x: number
  y: number
  node: FileNode
}

interface StatResult {
  ok: boolean
}

interface ReadFileResult {
  ok: boolean
  content?: string
}

interface CreateFileResult {
  ok: boolean
  message?: string
}

function ChevronIcon({ open }: { open: boolean }): React.ReactElement {
  return (
    <span className={`chev ${open ? 'open' : ''}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M3 2l4 3-4 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function FolderIcon(): React.ReactElement {
  return (
    <svg className="ico" viewBox="0 0 14 14" fill="currentColor">
      <path d="M1 3.5C1 2.67 1.67 2 2.5 2H5l1.5 1.5H11.5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5h-9C1.67 11.5 1 10.83 1 10V3.5z" />
    </svg>
  )
}

function FileIcon(): React.ReactElement {
  return (
    <svg className="ico" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 5h6M4 7h6M4 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function FolderPlusIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path
        d="M1 3.5C1 2.67 1.67 2 2.5 2H5l1.5 1.5H11.5c.83 0 1.5.67 1.5 1.5V7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="1" y="5.5" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 7.5v3M3.5 9h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function RefreshIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M10 6a4 4 0 1 1-1-2.65"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M10 2v2.5H7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NodeRow({ node, depth, activeTabPath, onContextMenu }: NodeRowProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false)
  const treeNodes = useWorkspaceStore((s) => s.treeNodes)
  const mdActiveFolders = useWorkspaceStore((s) => s.mdActiveFolders)
  const children = treeNodes[node.path]
  const isSelected = node.path === activeTabPath
  const isFolder = node.type === 'folder'
  const isDimmed = isFolder && !mdActiveFolders.has(node.path)

  const handleClick = (): void => {
    if (isFolder) {
      if (!expanded && !children) {
        void useWorkspaceStore.getState().refreshNode(node.path)
      }
      setExpanded((v) => !v)
    } else {
      void openFileByPath(node.path)
    }
  }

  return (
    <>
      <div
        className={`tree-row${isFolder ? ' folder' : ''}${isSelected ? ' selected' : ''}${isDimmed ? ' dimmed' : ''}`}
        style={{ paddingLeft: `${4 + depth * 14}px` }}
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, node)}
        title={node.path}
      >
        {isFolder ? <ChevronIcon open={expanded} /> : <span style={{ width: 12, flexShrink: 0 }} />}
        {isFolder ? <FolderIcon /> : <FileIcon />}
        <span className="lbl">{node.name}</span>
        {isSelected && !isFolder && <span className="dot-active" />}
      </div>
      {expanded &&
        isFolder &&
        children &&
        children.map((child) => (
          <NodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            activeTabPath={activeTabPath}
            onContextMenu={onContextMenu}
          />
        ))}
    </>
  )
}

export function SidebarTree({ folder }: Props): React.ReactElement {
  const treeNodes = useWorkspaceStore((s) => s.treeNodes)
  const rootNodes = treeNodes[folder.path] ?? []
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const activeTabPath = tabs.find((t) => t.id === activeTabId)?.path
  const openModal = useUiStore((s) => s.openModal)
  const pushToast = useUiStore((s) => s.pushToast)

  const [collapsed, setCollapsed] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [wsContextMenu, setWsContextMenu] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    void useWorkspaceStore.getState().refreshNode(folder.path)
    void useWorkspaceStore.getState().scanMdFolders(folder.path)
    void window.api.invoke('watch:add', { path: folder.path })
    return () => {
      void window.api.invoke('watch:remove', { path: folder.path })
    }
  }, [folder.path])

  useEffect(() => {
    if (!contextMenu && !wsContextMenu) return
    const close = (): void => {
      setContextMenu(null)
      setWsContextMenu(null)
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [contextMenu, wsContextMenu])

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileNode): void => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }, [])

  const handleWsContextMenu = useCallback((e: React.MouseEvent): void => {
    e.preventDefault()
    setWsContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const handleRemoveWorkspace = (): void => {
    setWsContextMenu(null)
    void useWorkspaceStore.getState().removeFolder(folder.id)
  }

  const handleRename = (): void => {
    if (!contextMenu) return
    openModal('rename', { path: contextMenu.node.path })
    setContextMenu(null)
  }

  const handleDelete = (): void => {
    if (!contextMenu) return
    openModal('confirmDelete', { path: contextMenu.node.path })
    setContextMenu(null)
  }

  const handleDuplicate = async (): Promise<void> => {
    if (!contextMenu) return
    const { node } = contextMenu
    setContextMenu(null)

    const dir = node.path.substring(0, node.path.lastIndexOf('/'))
    const ext = node.name.includes('.') ? node.name.substring(node.name.lastIndexOf('.')) : ''
    const base = ext ? node.name.substring(0, node.name.lastIndexOf('.')) : node.name

    const candidates = [
      `${dir}/${base} copy${ext}`,
      ...Array.from({ length: 9 }, (_, i) => `${dir}/${base} copy ${i + 2}${ext}`)
    ]

    let newPath: string | null = null
    for (const candidate of candidates) {
      const stat = (await window.api.invoke('fs:stat', { path: candidate })) as StatResult
      if (!stat.ok) {
        newPath = candidate
        break
      }
    }

    if (!newPath) {
      pushToast({ type: 'error', message: '복제 파일 이름을 찾을 수 없습니다.' })
      return
    }

    const read = (await window.api.invoke('fs:readFile', { path: node.path })) as ReadFileResult
    if (!read.ok) {
      pushToast({ type: 'error', message: '파일을 읽을 수 없습니다.' })
      return
    }

    const create = (await window.api.invoke('fs:createFile', { path: newPath })) as CreateFileResult
    if (!create.ok) {
      pushToast({ type: 'error', message: '파일을 복제할 수 없습니다.' })
      return
    }

    await window.api.invoke('fs:writeFile', { path: newPath, content: read.content ?? '' })
    void useWorkspaceStore.getState().refreshNode(dir)
  }

  return (
    <>
      <div className="sb-section-header" onContextMenu={handleWsContextMenu}>
        <div
          className="sb-section-title-row"
          onClick={() => setCollapsed((v) => !v)}
          title={folder.path}
        >
          <span className={`chev ${collapsed ? '' : 'open'}`}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M3 2l4 3-4 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="sb-section-name">{folder.name}</span>
        </div>
        <div className="sb-section-actions">
          <button
            className="icon-btn"
            title="새 파일"
            onClick={() => openModal('newFile', { dir: folder.path })}
          >
            <PlusIcon />
          </button>
          <button
            className="icon-btn"
            title="새 폴더"
            onClick={() => openModal('newFolder', { dir: folder.path })}
          >
            <FolderPlusIcon />
          </button>
          <button
            className="icon-btn"
            title="새로 고침"
            onClick={() => void useWorkspaceStore.getState().refreshNode(folder.path)}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>
      {!collapsed &&
        rootNodes.map((node) => (
          <NodeRow
            key={node.id}
            node={node}
            depth={0}
            activeTabPath={activeTabPath}
            onContextMenu={handleContextMenu}
          />
        ))}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="context-menu-item" onClick={handleRename}>
            이름 바꾸기
          </button>
          {contextMenu.node.type === 'file' && (
            <>
              <div className="context-menu-divider" />
              <button className="context-menu-item" onClick={() => void handleDuplicate()}>
                복제
              </button>
            </>
          )}
          <div className="context-menu-divider" />
          <button className="context-menu-item danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      )}
      {wsContextMenu && (
        <div
          className="context-menu"
          style={{ left: wsContextMenu.x, top: wsContextMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button className="context-menu-item danger" onClick={handleRemoveWorkspace}>
            워크스페이스 제거
          </button>
        </div>
      )}
    </>
  )
}
