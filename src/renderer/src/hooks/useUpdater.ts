import { useEffect } from 'react'
import { useUiStore } from '../stores/uiStore'

interface UpdateInfo {
  version: string
  releaseNotes?: string | null
}

export function useUpdater(): void {
  useEffect(() => {
    const offAvailable = window.api.on('updater:available', (...args: unknown[]) => {
      const info = args[0] as UpdateInfo
      useUiStore.getState().pushToast({
        type: 'info',
        message: `새 버전 ${info.version}을 다운로드 중입니다…`
      })
    })

    const offDownloaded = window.api.on('updater:downloaded', (...args: unknown[]) => {
      const info = args[0] as UpdateInfo
      useUiStore.getState().pushToast({
        type: 'success',
        message: `Machodown ${info.version} 준비 완료`,
        action: {
          label: '지금 재시작',
          onClick: () => void window.api.invoke('update:install')
        }
      })
    })

    return () => {
      offAvailable()
      offDownloaded()
    }
  }, [])
}
