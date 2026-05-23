import { useEditorStore } from '../../stores/editorStore'

export function TabBar(): JSX.Element | null {
  const tabs = useEditorStore((s) => s.tabs)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const setActiveTab = useEditorStore((s) => s.setActiveTab)
  const closeTab = useEditorStore((s) => s.closeTab)

  if (tabs.length === 0) return null

  return (
    <div className="tabbar" role="tablist">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeTabId}
          className={`tab${tab.id === activeTabId ? ' active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab__title">{tab.title}</span>
          {tab.isDirty && <span className="tab__dirty" aria-hidden="true" />}
          <button
            className="close"
            aria-label={`${tab.title} 탭 닫기`}
            onClick={(e) => {
              e.stopPropagation()
              void closeTab(tab.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
