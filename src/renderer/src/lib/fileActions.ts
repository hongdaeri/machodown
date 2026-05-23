import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { useWorkspaceStore } from '../stores/workspaceStore'
import { Encoding, EOL, Folder } from '../stores/types'

interface ReadFileResult {
  ok: true
  content: string
  encoding: Encoding
  eol: EOL
  mtime: number
}

interface ReadFileError {
  ok: false
  code?: string
  message: string
}

interface OpenFileResult {
  ok: true
  canceled: boolean
  paths: string[]
}

export async function openFileByPath(path: string): Promise<void> {
  const result = (await window.api.invoke('fs:readFile', { path })) as
    | ReadFileResult
    | ReadFileError

  if (!result.ok) {
    const message =
      result.code === 'ENOENT'
        ? '파일을 찾을 수 없습니다.'
        : result.code === 'EACCES'
          ? '파일에 접근할 수 없습니다.'
          : `파일을 열 수 없습니다: ${result.message}`
    useUiStore.getState().pushToast({ type: 'error', message })
    return
  }

  useEditorStore.getState().openTab({
    path,
    content: result.content,
    encoding: result.encoding,
    eol: result.eol,
    mtime: result.mtime
  })
  useWorkspaceStore.getState().pushRecent(path)
}

export async function openFileAction(): Promise<void> {
  const dialogResult = (await window.api.invoke('dialog:openFile')) as OpenFileResult

  if (!dialogResult.ok || dialogResult.canceled || dialogResult.paths.length === 0) return

  const path = dialogResult.paths[0]

  const result = (await window.api.invoke('fs:readFile', { path })) as
    | ReadFileResult
    | ReadFileError

  if (!result.ok) {
    const message =
      result.code === 'ENOENT'
        ? '파일을 찾을 수 없습니다.'
        : result.code === 'EACCES'
          ? '파일에 접근할 수 없습니다.'
          : `파일을 열 수 없습니다: ${result.message}`
    useUiStore.getState().pushToast({ type: 'error', message })
    return
  }

  useEditorStore.getState().openTab({
    path,
    content: result.content,
    encoding: result.encoding,
    eol: result.eol,
    mtime: result.mtime
  })
  useWorkspaceStore.getState().pushRecent(path)
}

export async function openFolderAction(): Promise<void> {
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
  await useWorkspaceStore.getState().addFolder(folder)
}

export async function saveFileAction(tabId: string): Promise<void> {
  try {
    await useEditorStore.getState().saveTab(tabId)
    useUiStore.getState().pushToast({ type: 'success', message: '저장되었습니다.' })
  } catch {
    useUiStore.getState().pushToast({ type: 'error', message: '저장에 실패했습니다.' })
  }
}

export async function saveAllAction(): Promise<void> {
  try {
    await useEditorStore.getState().saveAllDirty()
    useUiStore.getState().pushToast({ type: 'success', message: '모두 저장되었습니다.' })
  } catch {
    useUiStore.getState().pushToast({ type: 'error', message: '저장에 실패했습니다.' })
  }
}
