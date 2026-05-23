import { useUiStore } from '../stores/uiStore'
import { useEditorStore } from '../stores/editorStore'
import { Encoding, EOL } from '../stores/types'

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

export async function restoreSessionTabs(): Promise<void> {
  const session = await useUiStore.getState().loadSession()
  if (!session?.tabs?.length) return

  const { openTab, setActiveTab, tabs: currentTabs } = useEditorStore.getState()
  if (currentTabs.length > 0) return

  const activePath: string | undefined = session.activeTabPath

  for (const savedTab of session.tabs) {
    const result = (await window.api.invoke('fs:readFile', {
      path: savedTab.path
    })) as ReadFileResult | ReadFileError

    if (!result.ok) continue

    openTab({
      path: savedTab.path,
      content: result.content,
      encoding: result.encoding,
      eol: result.eol,
      mtime: result.mtime
    })
  }

  if (activePath) {
    const { tabs } = useEditorStore.getState()
    const activeTab = tabs.find((t) => t.path === activePath)
    if (activeTab) setActiveTab(activeTab.id)
  }
}
