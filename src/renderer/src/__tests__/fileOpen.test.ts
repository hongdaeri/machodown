import { describe, it, expect, vi, beforeEach } from 'vitest'
import { openFileAction } from '../lib/fileActions'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import { useWorkspaceStore } from '../stores/workspaceStore'

vi.mock('../stores/editorStore', () => ({
  useEditorStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))
vi.mock('../stores/uiStore', () => ({
  useUiStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))
vi.mock('../stores/workspaceStore', () => ({
  useWorkspaceStore: Object.assign(vi.fn(), { getState: vi.fn() })
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

function setupStores() {
  const mockOpenTab = vi.fn()
  const mockPushToast = vi.fn()
  const mockPushRecent = vi.fn()

  vi.mocked(useEditorStore.getState).mockReturnValue({
    openTab: mockOpenTab
  } as unknown as ReturnType<typeof useEditorStore.getState>)

  vi.mocked(useUiStore.getState).mockReturnValue({
    pushToast: mockPushToast
  } as unknown as ReturnType<typeof useUiStore.getState>)

  vi.mocked(useWorkspaceStore.getState).mockReturnValue({
    pushRecent: mockPushRecent
  } as unknown as ReturnType<typeof useWorkspaceStore.getState>)

  return { mockOpenTab, mockPushToast, mockPushRecent }
}

describe('openFileAction', () => {
  it('다이얼로그 취소 시 탭을 열지 않음', async () => {
    const { mockOpenTab } = setupStores()
    mockInvoke.mockResolvedValueOnce({ ok: true, canceled: true, paths: [] })

    await openFileAction()

    expect(mockOpenTab).not.toHaveBeenCalled()
  })

  it('다이얼로그 ok:false 시 탭을 열지 않음', async () => {
    const { mockOpenTab } = setupStores()
    mockInvoke.mockResolvedValueOnce({ ok: false })

    await openFileAction()

    expect(mockOpenTab).not.toHaveBeenCalled()
  })

  it('UTF-8 파일 정상 열기', async () => {
    const { mockOpenTab, mockPushRecent } = setupStores()
    mockInvoke
      .mockResolvedValueOnce({ ok: true, canceled: false, paths: ['/docs/readme.md'] })
      .mockResolvedValueOnce({
        ok: true,
        content: '# Hello',
        encoding: 'utf-8',
        eol: 'LF',
        mtime: 1000
      })

    await openFileAction()

    expect(mockOpenTab).toHaveBeenCalledWith({
      path: '/docs/readme.md',
      content: '# Hello',
      encoding: 'utf-8',
      eol: 'LF',
      mtime: 1000
    })
    expect(mockPushRecent).toHaveBeenCalledWith('/docs/readme.md')
  })

  it('UTF-16LE 인코딩 파일 열기', async () => {
    const { mockOpenTab } = setupStores()
    mockInvoke
      .mockResolvedValueOnce({ ok: true, canceled: false, paths: ['/docs/utf16.md'] })
      .mockResolvedValueOnce({
        ok: true,
        content: '# UTF-16',
        encoding: 'utf-16le',
        eol: 'CRLF',
        mtime: 2000
      })

    await openFileAction()

    expect(mockOpenTab).toHaveBeenCalledWith({
      path: '/docs/utf16.md',
      content: '# UTF-16',
      encoding: 'utf-16le',
      eol: 'CRLF',
      mtime: 2000
    })
  })

  it('EUC-KR 인코딩 파일 열기', async () => {
    const { mockOpenTab } = setupStores()
    mockInvoke
      .mockResolvedValueOnce({ ok: true, canceled: false, paths: ['/docs/euckr.md'] })
      .mockResolvedValueOnce({
        ok: true,
        content: '# 한글 문서',
        encoding: 'euc-kr',
        eol: 'LF',
        mtime: 3000
      })

    await openFileAction()

    expect(mockOpenTab).toHaveBeenCalledWith({
      path: '/docs/euckr.md',
      content: '# 한글 문서',
      encoding: 'euc-kr',
      eol: 'LF',
      mtime: 3000
    })
  })

  it('ENOENT → 파일을 찾을 수 없습니다 토스트', async () => {
    const { mockOpenTab, mockPushToast } = setupStores()
    mockInvoke
      .mockResolvedValueOnce({ ok: true, canceled: false, paths: ['/missing.md'] })
      .mockResolvedValueOnce({ ok: false, code: 'ENOENT', message: 'no such file' })

    await openFileAction()

    expect(mockOpenTab).not.toHaveBeenCalled()
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'error',
      message: '파일을 찾을 수 없습니다.'
    })
  })

  it('EACCES → 파일에 접근할 수 없습니다 토스트', async () => {
    const { mockOpenTab, mockPushToast } = setupStores()
    mockInvoke
      .mockResolvedValueOnce({ ok: true, canceled: false, paths: ['/protected.md'] })
      .mockResolvedValueOnce({ ok: false, code: 'EACCES', message: 'permission denied' })

    await openFileAction()

    expect(mockOpenTab).not.toHaveBeenCalled()
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'error',
      message: '파일에 접근할 수 없습니다.'
    })
  })

  it('알 수 없는 에러 → 메시지 포함 토스트', async () => {
    const { mockOpenTab, mockPushToast } = setupStores()
    mockInvoke
      .mockResolvedValueOnce({ ok: true, canceled: false, paths: ['/file.md'] })
      .mockResolvedValueOnce({ ok: false, code: 'UNKNOWN', message: 'disk error' })

    await openFileAction()

    expect(mockOpenTab).not.toHaveBeenCalled()
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'error',
      message: '파일을 열 수 없습니다: disk error'
    })
  })
})
