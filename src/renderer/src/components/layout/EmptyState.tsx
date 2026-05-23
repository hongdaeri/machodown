import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import { openFileAction, openFolderAction } from '../../lib/fileActions'
import { Encoding, EOL } from '../../stores/types'

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

async function openRecentFile(path: string): Promise<void> {
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

export function EmptyState(): JSX.Element {
  const recentFiles = useWorkspaceStore((s) => s.recentFiles)
  const openModal = useUiStore((s) => s.openModal)

  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="8" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="28" x2="36" y2="28" stroke="currentColor" strokeWidth="2" />
          <line x1="20" y1="36" x2="30" y2="36" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <h2 className="empty-state__title">마초다운</h2>
      <div className="empty-state__actions">
        <button className="empty-state__cta" onClick={() => openModal('newFile')}>
          새 파일
        </button>
        <button className="empty-state__cta" onClick={() => void openFileAction()}>
          파일 열기
        </button>
        <button className="empty-state__cta" onClick={() => void openFolderAction()}>
          폴더 열기
        </button>
      </div>
      {recentFiles.length > 0 && (
        <div className="empty-state__recent">
          <h3 className="empty-state__recent-title">최근 파일</h3>
          <ul className="empty-state__recent-list">
            {recentFiles.slice(0, 10).map((f) => (
              <li key={f.path}>
                <button
                  className="empty-state__recent-item"
                  onClick={() => void openRecentFile(f.path)}
                  title={f.path}
                >
                  {f.path.split('/').pop() ?? f.path}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="empty-state__hint">
        <kbd>⌘O</kbd> 단축키로도 파일을 열 수 있습니다.
      </p>
    </div>
  )
}
