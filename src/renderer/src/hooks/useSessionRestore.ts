import { useEffect } from 'react'
import { useUiStore } from '../stores/uiStore'
import { restoreSessionTabs } from '../lib/sessionActions'

type LaunchType = 'first-launch' | 'normal'

interface LaunchTypeResult {
  ok: true
  type: LaunchType
}

interface LaunchTypeError {
  ok: false
  message: string
}

export async function handleLaunch(): Promise<void> {
  const result = (await window.api.invoke('app:launchType')) as LaunchTypeResult | LaunchTypeError
  if (!result.ok) return

  const { openModal } = useUiStore.getState()

  if (result.type === 'first-launch') {
    openModal('welcome')
    return
  }

  await restoreSessionTabs()
}

export function useSessionRestore(): void {
  useEffect(() => {
    void handleLaunch()
  }, [])
}
