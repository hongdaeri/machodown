import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkspaceStore } from '../stores/workspaceStore'

const mockInvoke = vi.fn()

type ApiWindow = Window & typeof globalThis & { api: unknown }

beforeEach(() => {
  vi.resetAllMocks()
  ;(window as ApiWindow).api = { invoke: mockInvoke, on: vi.fn(), once: vi.fn() }
  useWorkspaceStore.setState({ folders: [], recentFiles: [], treeNodes: {} })
})

describe('workspaceStore.load', () => {
  it('폴더와 최근 파일 목록을 IPC에서 로드', async () => {
    mockInvoke
      .mockResolvedValueOnce({ ok: true, folders: [{ id: '/a', path: '/a', name: 'a' }] })
      .mockResolvedValueOnce({ ok: true, files: [{ path: '/a/file.md', openedAt: 1000 }] })

    await useWorkspaceStore.getState().load()

    const state = useWorkspaceStore.getState()
    expect(state.folders).toEqual([{ id: '/a', path: '/a', name: 'a' }])
    expect(state.recentFiles).toEqual([{ path: '/a/file.md', openedAt: 1000 }])
  })

  it('IPC 실패 시 빈 배열 유지', async () => {
    mockInvoke.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: false })

    await useWorkspaceStore.getState().load()

    const state = useWorkspaceStore.getState()
    expect(state.folders).toEqual([])
    expect(state.recentFiles).toEqual([])
  })
})

describe('workspaceStore.addFolder', () => {
  it('폴더 추가 후 folders 상태 갱신', async () => {
    const folder = { id: '/b', path: '/b', name: 'b' }
    mockInvoke.mockResolvedValueOnce({ ok: true, folders: [folder] })

    await useWorkspaceStore.getState().addFolder(folder)

    expect(useWorkspaceStore.getState().folders).toEqual([folder])
    expect(mockInvoke).toHaveBeenCalledWith('workspace:addFolder', { folder })
  })

  it('IPC ok:false 시 folders 상태 변경 없음', async () => {
    const folder = { id: '/b', path: '/b', name: 'b' }
    mockInvoke.mockResolvedValueOnce({ ok: false })

    await useWorkspaceStore.getState().addFolder(folder)

    expect(useWorkspaceStore.getState().folders).toEqual([])
  })
})

describe('workspaceStore.removeFolder', () => {
  it('폴더 제거 후 folders 상태 갱신', async () => {
    useWorkspaceStore.setState({ folders: [{ id: '/a', path: '/a', name: 'a' }] })
    mockInvoke.mockResolvedValueOnce({ ok: true, folders: [] })

    await useWorkspaceStore.getState().removeFolder('/a')

    expect(useWorkspaceStore.getState().folders).toEqual([])
    expect(mockInvoke).toHaveBeenCalledWith('workspace:removeFolder', { id: '/a' })
  })
})

describe('workspaceStore.pushRecent', () => {
  it('최근 파일 목록 앞에 추가', async () => {
    mockInvoke.mockResolvedValueOnce({})

    await useWorkspaceStore.getState().pushRecent('/new.md')

    const { recentFiles } = useWorkspaceStore.getState()
    expect(recentFiles[0].path).toBe('/new.md')
    expect(mockInvoke).toHaveBeenCalledWith('recent:addFile', { path: '/new.md' })
  })

  it('중복 경로는 기존 항목 제거 후 앞에 추가', async () => {
    useWorkspaceStore.setState({
      recentFiles: [
        { path: '/old.md', openedAt: 100 },
        { path: '/new.md', openedAt: 200 }
      ]
    })
    mockInvoke.mockResolvedValueOnce({})

    await useWorkspaceStore.getState().pushRecent('/old.md')

    const { recentFiles } = useWorkspaceStore.getState()
    expect(recentFiles[0].path).toBe('/old.md')
    expect(recentFiles.filter((r) => r.path === '/old.md')).toHaveLength(1)
  })
})

describe('workspaceStore.refreshNode', () => {
  it('디렉토리 읽기 후 treeNodes 갱신', async () => {
    mockInvoke.mockResolvedValueOnce({
      ok: true,
      items: [
        { name: 'note.md', path: '/a/note.md', isDirectory: false },
        { name: 'sub', path: '/a/sub', isDirectory: true }
      ]
    })

    await useWorkspaceStore.getState().refreshNode('/a')

    const nodes = useWorkspaceStore.getState().treeNodes['/a']
    expect(nodes).toBeDefined()
    expect(nodes.find((n) => n.name === 'note.md')?.type).toBe('file')
    expect(nodes.find((n) => n.name === 'sub')?.type).toBe('folder')
  })

  it('숨김 파일(.으로 시작) 은 포함하지 않음', async () => {
    mockInvoke.mockResolvedValueOnce({
      ok: true,
      items: [
        { name: '.hidden', path: '/a/.hidden', isDirectory: false },
        { name: 'visible.md', path: '/a/visible.md', isDirectory: false }
      ]
    })

    await useWorkspaceStore.getState().refreshNode('/a')

    const nodes = useWorkspaceStore.getState().treeNodes['/a']
    expect(nodes.find((n) => n.name === '.hidden')).toBeUndefined()
    expect(nodes.find((n) => n.name === 'visible.md')).toBeDefined()
  })

  it('.md 확장자가 아닌 파일은 포함하지 않음', async () => {
    mockInvoke.mockResolvedValueOnce({
      ok: true,
      items: [
        { name: 'readme.txt', path: '/a/readme.txt', isDirectory: false },
        { name: 'note.md', path: '/a/note.md', isDirectory: false }
      ]
    })

    await useWorkspaceStore.getState().refreshNode('/a')

    const nodes = useWorkspaceStore.getState().treeNodes['/a']
    expect(nodes.find((n) => n.name === 'readme.txt')).toBeUndefined()
    expect(nodes.find((n) => n.name === 'note.md')).toBeDefined()
  })

  it('ok:false 시 treeNodes 변경 없음', async () => {
    mockInvoke.mockResolvedValueOnce({ ok: false })

    await useWorkspaceStore.getState().refreshNode('/a')

    expect(useWorkspaceStore.getState().treeNodes['/a']).toBeUndefined()
  })
})

describe('workspaceStore.setTreeNodes', () => {
  it('treeNodes 직접 설정', () => {
    const nodes = [
      { id: '/a/x.md', name: 'x.md', path: '/a/x.md', type: 'file' as const, parentPath: '/a' }
    ]

    useWorkspaceStore.getState().setTreeNodes('/a', nodes)

    expect(useWorkspaceStore.getState().treeNodes['/a']).toEqual(nodes)
  })
})
