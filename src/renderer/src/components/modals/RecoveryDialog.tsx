import { useState, useEffect, useCallback } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import { BackupMetadata, Encoding } from '../../stores/types'

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function detectEol(content: string): 'LF' | 'CRLF' {
  return content.includes('\r\n') ? 'CRLF' : 'LF'
}

function filename(path: string): string {
  return path.split('/').pop() ?? path
}

interface RecoverResult {
  ok: boolean
  content?: string
  encoding?: string
}

interface ReadFileResult {
  ok: boolean
  content?: string
  encoding?: string
  eol?: string
  mtime?: number
}

export function RecoveryDialog(): JSX.Element {
  const modal = useUiStore((s) => s.modal)
  const closeModal = useUiStore((s) => s.closeModal)
  const pushToast = useUiStore((s) => s.pushToast)
  const openTab = useEditorStore((s) => s.openTab)

  const initial = (modal.props?.backups as BackupMetadata[]) ?? []
  const [backups, setBackups] = useState<BackupMetadata[]>(initial)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (backups.length === 0) closeModal()
  }, [backups, closeModal])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeModal])

  const remove = useCallback((id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const handleRecover = useCallback(
    async (backup: BackupMetadata) => {
      setBusy(backup.id)
      try {
        const res = (await window.api.invoke('backup:recover', {
          id: backup.id
        })) as RecoverResult
        if (!res.ok || res.content === undefined) {
          pushToast({ type: 'error', message: '복구 실패: 백업 파일을 읽을 수 없습니다.' })
          return
        }
        openTab({
          path: backup.originalPath,
          content: res.content,
          encoding: (res.encoding as Encoding) ?? backup.encoding,
          eol: detectEol(res.content),
          mtime: backup.timestamp
        })
        remove(backup.id)
        pushToast({ type: 'success', message: `복구됨: ${filename(backup.originalPath)}` })
      } finally {
        setBusy(null)
      }
    },
    [openTab, pushToast, remove]
  )

  const handleOpenOriginal = useCallback(
    async (backup: BackupMetadata) => {
      setBusy(backup.id)
      try {
        const res = (await window.api.invoke('fs:readFile', {
          path: backup.originalPath
        })) as ReadFileResult
        if (!res.ok || res.content === undefined) {
          pushToast({ type: 'error', message: '원본 파일을 열 수 없습니다.' })
          return
        }
        openTab({
          path: backup.originalPath,
          content: res.content,
          encoding: (res.encoding as Encoding) ?? 'utf-8',
          eol: (res.eol as 'LF' | 'CRLF') ?? 'LF',
          mtime: res.mtime ?? Date.now()
        })
        remove(backup.id)
      } finally {
        setBusy(null)
      }
    },
    [openTab, pushToast, remove]
  )

  const handleDelete = useCallback(
    async (backup: BackupMetadata) => {
      setBusy(backup.id)
      try {
        await window.api.invoke('backup:delete', { id: backup.id })
        remove(backup.id)
      } finally {
        setBusy(null)
      }
    },
    [remove]
  )

  const handleDeleteAll = useCallback(async () => {
    for (const b of backups) {
      await window.api.invoke('backup:delete', { id: b.id })
    }
    setBackups([])
  }, [backups])

  return (
    <div className="modal-scrim">
      <div
        className="modal recovery-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recovery-title"
      >
        <h3 id="recovery-title">복구 가능한 파일</h3>
        <p className="recovery-dialog__desc">
          예기치 않게 종료되기 전의 미저장 변경사항이 감지되었습니다.
        </p>
        <ul className="recovery-dialog__list">
          {backups.map((b) => (
            <li key={b.id} className="recovery-dialog__item">
              <div className="recovery-dialog__info">
                <span className="recovery-dialog__name">{filename(b.originalPath)}</span>
                <span className="recovery-dialog__meta">
                  {formatTime(b.timestamp)} &middot; {b.type}
                </span>
                <span className="recovery-dialog__path">{b.originalPath}</span>
              </div>
              <div className="recovery-dialog__actions">
                <button
                  className="btn primary"
                  disabled={busy === b.id}
                  onClick={() => void handleRecover(b)}
                >
                  복구
                </button>
                <button
                  className="btn"
                  disabled={busy === b.id}
                  onClick={() => void handleOpenOriginal(b)}
                >
                  원본 열기
                </button>
                <button
                  className="btn danger"
                  disabled={busy === b.id}
                  onClick={() => void handleDelete(b)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="actions">
          <button className="btn danger" onClick={() => void handleDeleteAll()}>
            모두 삭제
          </button>
          <button className="btn" onClick={closeModal}>
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
