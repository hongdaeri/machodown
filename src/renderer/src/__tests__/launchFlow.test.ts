import { describe, it, expect, vi, beforeEach } from 'vitest'
import { restoreSessionTabs } from '../lib/sessionActions'
import { handleLaunch } from '../hooks/useSessionRestore'
import { useUiStore } from '../stores/uiStore'
import { useEditorStore } from '../stores/editorStore'

vi.mock('../stores/uiStore', () => ({
  useUiStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))

vi.mock('../stores/editorStore', () => ({
  useEditorStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))

const mockInvoke = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  ;(window as Window & typeof globalThis & { api: unknown }).api = {
    invoke: mockInvoke,
    on: vi.fn(),
    once: vi.fn()
  }
})

// ─── restoreSessionTabs ───────────────────────────────────────────────────────

describe('restoreSessionTabs', () => {
  it('반환: 세션 없음', async () => {
    vi.mocked(useUiStore.getState).mockReturnValue({
      loadSession: vi.fn().mockResolvedValue(null)
    } as unknown as ReturnType<typeof useUiStore.getState>)

    await restoreSessionTabs()

    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('반환: 빈 탭 목록', async () => {
    vi.mocked(useUiStore.getState).mockReturnValue({
      loadSession: vi.fn().mockResolvedValue({ tabs: [] })
    } as unknown as ReturnType<typeof useUiStore.getState>)

    await restoreSessionTabs()

    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('반환: 이미 탭이 열려있음', async () => {
    vi.mocked(useUiStore.getState).mockReturnValue({
      loadSession: vi.fn().mockResolvedValue({ tabs: [{ path: '/a.md' }] })
    } as unknown as ReturnType<typeof useUiStore.getState>)

    vi.mocked(useEditorStore.getState).mockReturnValue({
      openTab: vi.fn(),
      setActiveTab: vi.fn(),
      tabs: [{ id: '1', path: '/existing.md' }]
    } as unknown as ReturnType<typeof useEditorStore.getState>)

    await restoreSessionTabs()

    expect(mockInvoke).not.toHaveBeenCalled()
  })

  it('읽기 실패 탭 건너뜀, 성공 탭만 열기', async () => {
    vi.mocked(useUiStore.getState).mockReturnValue({
      loadSession: vi.fn().mockResolvedValue({
        tabs: [{ path: '/a.md' }, { path: '/b.md' }],
        activeTabPath: undefined
      })
    } as unknown as ReturnType<typeof useUiStore.getState>)

    const mockOpenTab = vi.fn()
    vi.mocked(useEditorStore.getState)
      .mockReturnValueOnce({
        openTab: mockOpenTab,
        setActiveTab: vi.fn(),
        tabs: []
      } as unknown as ReturnType<typeof useEditorStore.getState>)
      .mockReturnValueOnce({ tabs: [] } as unknown as ReturnType<typeof useEditorStore.getState>)

    mockInvoke
      .mockResolvedValueOnce({ ok: false, code: 'ENOENT', message: 'not found' })
      .mockResolvedValueOnce({ ok: true, content: '# B', encoding: 'utf-8', eol: 'LF', mtime: 200 })

    await restoreSessionTabs()

    expect(mockOpenTab).toHaveBeenCalledOnce()
    expect(mockOpenTab).toHaveBeenCalledWith({
      path: '/b.md',
      content: '# B',
      encoding: 'utf-8',
      eol: 'LF',
      mtime: 200
    })
  })

  it('모든 탭 복원 후 활성 탭 지정', async () => {
    vi.mocked(useUiStore.getState).mockReturnValue({
      loadSession: vi.fn().mockResolvedValue({
        tabs: [{ path: '/a.md' }, { path: '/b.md' }],
        activeTabPath: '/b.md'
      })
    } as unknown as ReturnType<typeof useUiStore.getState>)

    const mockOpenTab = vi.fn()
    const mockSetActiveTab = vi.fn()
    vi.mocked(useEditorStore.getState)
      .mockReturnValueOnce({
        openTab: mockOpenTab,
        setActiveTab: mockSetActiveTab,
        tabs: []
      } as unknown as ReturnType<typeof useEditorStore.getState>)
      .mockReturnValueOnce({
        tabs: [
          { id: 'tab-a', path: '/a.md' },
          { id: 'tab-b', path: '/b.md' }
        ]
      } as unknown as ReturnType<typeof useEditorStore.getState>)

    mockInvoke
      .mockResolvedValueOnce({ ok: true, content: '# A', encoding: 'utf-8', eol: 'LF', mtime: 1 })
      .mockResolvedValueOnce({ ok: true, content: '# B', encoding: 'utf-8', eol: 'CRLF', mtime: 2 })

    await restoreSessionTabs()

    expect(mockOpenTab).toHaveBeenCalledTimes(2)
    expect(mockSetActiveTab).toHaveBeenCalledWith('tab-b')
  })
})

// ─── handleLaunch (LaunchType 분기) ──────────────────────────────────────────

describe('handleLaunch', () => {
  it('first-launch → welcome 모달 열기', async () => {
    mockInvoke.mockResolvedValueOnce({ ok: true, type: 'first-launch' })
    const mockOpenModal = vi.fn()
    vi.mocked(useUiStore.getState).mockReturnValue({
      openModal: mockOpenModal
    } as unknown as ReturnType<typeof useUiStore.getState>)

    await handleLaunch()

    expect(mockOpenModal).toHaveBeenCalledWith('welcome')
  })

  it('after-update → releaseNotes 모달 열기', async () => {
    mockInvoke.mockResolvedValueOnce({ ok: true, type: 'after-update' })
    const mockOpenModal = vi.fn()
    vi.mocked(useUiStore.getState).mockReturnValue({
      openModal: mockOpenModal
    } as unknown as ReturnType<typeof useUiStore.getState>)

    await handleLaunch()

    expect(mockOpenModal).toHaveBeenCalledWith('releaseNotes')
  })

  it('normal → 세션 탭 복원 시도', async () => {
    mockInvoke.mockResolvedValueOnce({ ok: true, type: 'normal' }).mockResolvedValue(undefined) // fs:readFile calls (no session)

    const mockLoadSession = vi.fn().mockResolvedValue(null)
    vi.mocked(useUiStore.getState).mockReturnValue({
      openModal: vi.fn(),
      loadSession: mockLoadSession
    } as unknown as ReturnType<typeof useUiStore.getState>)

    await handleLaunch()

    expect(mockLoadSession).toHaveBeenCalled()
  })

  it('launchType IPC 실패 시 아무것도 하지 않음', async () => {
    mockInvoke.mockResolvedValueOnce({ ok: false, message: 'ipc error' })
    const mockOpenModal = vi.fn()
    vi.mocked(useUiStore.getState).mockReturnValue({
      openModal: mockOpenModal
    } as unknown as ReturnType<typeof useUiStore.getState>)

    await handleLaunch()

    expect(mockOpenModal).not.toHaveBeenCalled()
  })
})
