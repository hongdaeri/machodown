export type Encoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'euc-kr'

export type EOL = 'LF' | 'CRLF'

export interface Tab {
  id: string
  path: string
  title: string
  content: string
  isDirty: boolean
  encoding: Encoding
  eol: EOL
  mtime: number
  viewState?: unknown
}

export interface Folder {
  id: string
  path: string
  name: string
}

export interface FileNode {
  id: string
  name: string
  path: string
  type: 'file' | 'folder'
  parentPath: string
}

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  type: ToastType
  message: string
  action?: { label: string; onClick: () => void }
}

export type BackupType = 'auto' | 'pre-save' | 'manual'

export interface BackupMetadata {
  id: string
  type: BackupType
  originalPath: string
  backupPath: string
  fileHash: string
  timestamp: number
  size: number
  encoding: Encoding
  isDirty: boolean
}

export type ModalType =
  | null
  | 'newFile'
  | 'newFolder'
  | 'rename'
  | 'confirmDelete'
  | 'shortcuts'
  | 'encoding'
  | 'eol'
  | 'welcome'
  | 'releaseNotes'
  | 'settings'
  | 'recovery'
  | 'commandPalette'
  | 'replace'
  | 'merge'

export interface SearchMatch {
  lineNumber: number
  line: string
}

export interface SearchResult {
  path: string
  matches: SearchMatch[]
}

export interface ModalState {
  type: ModalType
  props?: Record<string, unknown>
}

export interface TocItem {
  level: 1 | 2 | 3
  text: string
  slug: string
}
