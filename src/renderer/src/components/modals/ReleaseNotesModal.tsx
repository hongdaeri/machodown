import { useState, useEffect, useCallback } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { restoreSessionTabs } from '../../lib/sessionActions'

interface VersionResult {
  ok: true
  version: string
}

interface VersionError {
  ok: false
  message: string
}

export function ReleaseNotesModal(): JSX.Element {
  const closeModal = useUiStore((s) => s.closeModal)
  const [version, setVersion] = useState('')

  useEffect(() => {
    const fetchVersion = async (): Promise<void> => {
      const result = (await window.api.invoke('app:getVersion')) as VersionResult | VersionError
      if (result.ok) setVersion(result.version)
    }
    void fetchVersion()
  }, [])

  const handleConfirm = useCallback(async (): Promise<void> => {
    await window.api.invoke('app:finishUpdate')
    await restoreSessionTabs()
    closeModal()
  }, [closeModal])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') void handleConfirm()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleConfirm])

  return (
    <div className="modal-scrim">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="release-notes-title">
        <h3 id="release-notes-title">
          {version ? `Machodown v${version} 업데이트` : 'Machodown 업데이트'}
        </h3>
        <ul className="release-notes__list">
          <li>안정성 개선 및 버그 수정</li>
          <li>성능 최적화</li>
        </ul>
        <div className="actions">
          <button className="btn primary" onClick={() => void handleConfirm()}>
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
