import { useEffect } from 'react'
import { useUiStore } from '../stores/uiStore'
import { BackupMetadata } from '../stores/types'

interface RecoveryAvailablePayload {
  backups: BackupMetadata[]
}

export function useRecoveryDetection(): void {
  useEffect(() => {
    const remove = window.api.on('backup:recoveryAvailable', (payload) => {
      const { backups } = payload as RecoveryAvailablePayload
      if (!backups || backups.length === 0) return
      useUiStore.getState().openModal('recovery', { backups })
    })
    return remove
  }, [])
}
