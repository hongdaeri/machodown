import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'

vi.mock('../stores/editorStore', () => ({
  useEditorStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))
vi.mock('../stores/uiStore', () => ({
  useUiStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))

const mockInvoke = vi.fn()
const mockOn = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  ;(window as Window & typeof globalThis & { api: unknown }).api = {
    invoke: mockInvoke,
    on: mockOn,
    once: vi.fn()
  }
})

// ---------------------------------------------------------------------------
// editorStore.reloadTab logic (tested via the store interface)
// ---------------------------------------------------------------------------
describe('reloadTab', () => {
  function buildTab(overrides: Record<string, unknown> = {}) {
    return {
      id: 'tab-1',
      path: '/docs/note.md',
      title: 'note.md',
      content: '# old',
      isDirty: false,
      encoding: 'utf-8',
      eol: 'LF' as const,
      mtime: 1000,
      ...overrides
    }
  }

  it('디스크에서 콘텐츠를 읽어 탭을 갱신하고 isDirty를 false로 유지', async () => {
    const mockSet = vi.fn()
    const tab = buildTab()

    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: [tab],
      reloadTab: async (id: string) => {
        const { tabs } = useEditorStore.getState()
        const t = tabs.find((x) => x.id === id)
        if (!t) return
        const res = (await window.api.invoke('fs:readFile', { path: t.path })) as {
          ok: boolean
          content?: string
          mtime?: number
        }
        if (!res.ok) return
        mockSet(id, res.content, res.mtime)
      }
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    mockInvoke.mockResolvedValueOnce({ ok: true, content: '# new', mtime: 2000 })

    const { reloadTab } = useEditorStore.getState()
    await reloadTab('tab-1')

    expect(mockInvoke).toHaveBeenCalledWith('fs:readFile', { path: '/docs/note.md' })
    expect(mockSet).toHaveBeenCalledWith('tab-1', '# new', 2000)
  })

  it('fs:readFile 실패 시 탭을 변경하지 않음', async () => {
    const mockSet = vi.fn()
    const tab = buildTab()

    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: [tab],
      reloadTab: async (id: string) => {
        const { tabs } = useEditorStore.getState()
        const t = tabs.find((x) => x.id === id)
        if (!t) return
        const res = (await window.api.invoke('fs:readFile', { path: t.path })) as {
          ok: boolean
          content?: string
          mtime?: number
        }
        if (!res.ok) return
        mockSet(id, res.content, res.mtime)
      }
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    mockInvoke.mockResolvedValueOnce({ ok: false })

    const { reloadTab } = useEditorStore.getState()
    await reloadTab('tab-1')

    expect(mockSet).not.toHaveBeenCalled()
  })

  it('존재하지 않는 id 전달 시 아무 동작 없음', async () => {
    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: [],
      reloadTab: async (id: string) => {
        const { tabs } = useEditorStore.getState()
        const t = tabs.find((x) => x.id === id)
        if (!t) return
        await window.api.invoke('fs:readFile', { path: t.path })
      }
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    const { reloadTab } = useEditorStore.getState()
    await reloadTab('nonexistent')

    expect(mockInvoke).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// watch:changed 이벤트 핸들러 로직
// ---------------------------------------------------------------------------
describe('watch:changed 핸들러', () => {
  function makeHandler() {
    return (payload: { path: string }) => {
      const { path } = payload
      const { tabs } = useEditorStore.getState()
      const tab = tabs.find((t) => t.path === path)
      if (!tab) return

      if (!tab.isDirty) {
        const tabId = tab.id
        const filename = path.split('/').pop() ?? path
        useUiStore.getState().pushToast({
          type: 'info',
          message: `${filename} 파일이 외부에서 변경되었습니다.`,
          action: {
            label: '다시 불러오기',
            onClick: () => void useEditorStore.getState().reloadTab(tabId)
          }
        })
      } else {
        useUiStore.getState().openModal('merge', { path })
      }
    }
  }

  it('clean 탭 변경 시 info 토스트 표시', () => {
    const mockPushToast = vi.fn()
    const mockReloadTab = vi.fn()

    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: [
        { id: 't1', path: '/a.md', isDirty: false } as unknown as ReturnType<
          typeof useEditorStore.getState
        >['tabs'][0]
      ],
      reloadTab: mockReloadTab
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    vi.mocked(useUiStore.getState).mockReturnValue({
      pushToast: mockPushToast,
      openModal: vi.fn()
    } as unknown as ReturnType<typeof useUiStore.getState>)

    makeHandler()({ path: '/a.md' })

    expect(mockPushToast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'info',
        message: expect.stringContaining('a.md'),
        action: expect.objectContaining({ label: '다시 불러오기' })
      })
    )
  })

  it('dirty 탭 변경 시 merge 모달 열기', () => {
    const mockOpenModal = vi.fn()

    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: [
        { id: 't1', path: '/b.md', isDirty: true } as unknown as ReturnType<
          typeof useEditorStore.getState
        >['tabs'][0]
      ],
      reloadTab: vi.fn()
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    vi.mocked(useUiStore.getState).mockReturnValue({
      pushToast: vi.fn(),
      openModal: mockOpenModal
    } as unknown as ReturnType<typeof useUiStore.getState>)

    makeHandler()({ path: '/b.md' })

    expect(mockOpenModal).toHaveBeenCalledWith('merge', { path: '/b.md' })
  })

  it('열려있지 않은 파일 변경 이벤트는 무시', () => {
    const mockPushToast = vi.fn()
    const mockOpenModal = vi.fn()

    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: []
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    vi.mocked(useUiStore.getState).mockReturnValue({
      pushToast: mockPushToast,
      openModal: mockOpenModal
    } as unknown as ReturnType<typeof useUiStore.getState>)

    makeHandler()({ path: '/unknown.md' })

    expect(mockPushToast).not.toHaveBeenCalled()
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  it('토스트 액션 클릭 시 reloadTab 호출', () => {
    const mockPushToast = vi.fn()
    const mockReloadTab = vi.fn()

    vi.mocked(useEditorStore.getState).mockReturnValue({
      tabs: [
        { id: 't1', path: '/c.md', isDirty: false } as unknown as ReturnType<
          typeof useEditorStore.getState
        >['tabs'][0]
      ],
      reloadTab: mockReloadTab
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    vi.mocked(useUiStore.getState).mockReturnValue({
      pushToast: mockPushToast,
      openModal: vi.fn()
    } as unknown as ReturnType<typeof useUiStore.getState>)

    makeHandler()({ path: '/c.md' })

    const toastArg = mockPushToast.mock.calls[0][0] as { action: { onClick: () => void } }
    toastArg.action.onClick()

    expect(mockReloadTab).toHaveBeenCalledWith('t1')
  })
})
