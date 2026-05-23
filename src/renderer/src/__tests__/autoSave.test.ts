import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveFileAction, saveAllAction } from '../lib/fileActions'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'

vi.mock('../stores/editorStore', () => ({
  useEditorStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))
vi.mock('../stores/uiStore', () => ({
  useUiStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))
vi.mock('../stores/workspaceStore', () => ({
  useWorkspaceStore: Object.assign(vi.fn(), { getState: vi.fn() })
}))

beforeEach(() => {
  vi.resetAllMocks()
})

function setupStores(opts: { saveTabError?: Error; saveAllError?: Error } = {}) {
  const mockSaveTab = opts.saveTabError
    ? vi.fn().mockRejectedValue(opts.saveTabError)
    : vi.fn().mockResolvedValue(undefined)

  const mockSaveAllDirty = opts.saveAllError
    ? vi.fn().mockRejectedValue(opts.saveAllError)
    : vi.fn().mockResolvedValue(undefined)

  const mockPushToast = vi.fn()

  vi.mocked(useEditorStore.getState).mockReturnValue({
    saveTab: mockSaveTab,
    saveAllDirty: mockSaveAllDirty
  } as unknown as ReturnType<typeof useEditorStore.getState>)

  vi.mocked(useUiStore.getState).mockReturnValue({
    pushToast: mockPushToast
  } as unknown as ReturnType<typeof useUiStore.getState>)

  return { mockSaveTab, mockSaveAllDirty, mockPushToast }
}

describe('saveFileAction', () => {
  it('저장 성공 시 saveTab 호출 후 성공 토스트', async () => {
    const { mockSaveTab, mockPushToast } = setupStores()

    await saveFileAction('tab-1')

    expect(mockSaveTab).toHaveBeenCalledWith('tab-1')
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'success',
      message: '저장되었습니다.'
    })
  })

  it('저장 실패 시 에러 토스트', async () => {
    const { mockSaveTab, mockPushToast } = setupStores({
      saveTabError: new Error('disk full')
    })

    await saveFileAction('tab-2')

    expect(mockSaveTab).toHaveBeenCalledWith('tab-2')
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'error',
      message: '저장에 실패했습니다.'
    })
  })

  it('tabId를 saveTab에 그대로 전달', async () => {
    const { mockSaveTab } = setupStores()

    await saveFileAction('some-specific-tab-id')

    expect(mockSaveTab).toHaveBeenCalledWith('some-specific-tab-id')
    expect(mockSaveTab).toHaveBeenCalledTimes(1)
  })
})

describe('saveAllAction', () => {
  it('전체 저장 성공 시 saveAllDirty 호출 후 성공 토스트', async () => {
    const { mockSaveAllDirty, mockPushToast } = setupStores()

    await saveAllAction()

    expect(mockSaveAllDirty).toHaveBeenCalledTimes(1)
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'success',
      message: '모두 저장되었습니다.'
    })
  })

  it('전체 저장 실패 시 에러 토스트', async () => {
    const { mockSaveAllDirty, mockPushToast } = setupStores({
      saveAllError: new Error('permission denied')
    })

    await saveAllAction()

    expect(mockSaveAllDirty).toHaveBeenCalledTimes(1)
    expect(mockPushToast).toHaveBeenCalledWith({
      type: 'error',
      message: '저장에 실패했습니다.'
    })
  })
})
