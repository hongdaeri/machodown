import { describe, it, expect } from 'vitest'
import { FileNode } from '../stores/types'

function getAllFiles(treeNodes: Record<string, FileNode[]>): FileNode[] {
  const files: FileNode[] = []
  const seen = new Set<string>()

  const collect = (nodes: FileNode[]): void => {
    for (const node of nodes) {
      if (node.type === 'file' && !seen.has(node.path)) {
        seen.add(node.path)
        files.push(node)
      } else if (node.type === 'folder' && treeNodes[node.path]) {
        collect(treeNodes[node.path])
      }
    }
  }

  Object.values(treeNodes).forEach(collect)
  return files
}

function filterFiles(
  query: string,
  allFiles: FileNode[],
  recentFiles: Array<{ path: string }>
): Array<{ path: string; name: string }> {
  const q = query.trim().toLowerCase()
  if (!q) {
    return recentFiles
      .slice(0, 10)
      .map((r) => ({ path: r.path, name: r.path.split('/').pop() ?? r.path }))
  }
  return allFiles
    .filter((f) => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
    .slice(0, 20)
    .map((f) => ({ path: f.path, name: f.name }))
}

function makeFile(path: string): FileNode {
  return { id: path, name: path.split('/').pop() ?? path, path, type: 'file', parentPath: '' }
}

function makeFolder(path: string): FileNode {
  return { id: path, name: path.split('/').pop() ?? path, path, type: 'folder', parentPath: '' }
}

describe('getAllFiles', () => {
  it('평탄 트리에서 파일만 수집', () => {
    const treeNodes: Record<string, FileNode[]> = {
      '/a': [makeFile('/a/x.md'), makeFile('/a/y.md')]
    }
    expect(getAllFiles(treeNodes)).toHaveLength(2)
  })

  it('중첩 폴더에서 재귀적으로 파일 수집', () => {
    const treeNodes: Record<string, FileNode[]> = {
      '/a': [makeFolder('/a/sub'), makeFile('/a/root.md')],
      '/a/sub': [makeFile('/a/sub/child.md')]
    }
    const files = getAllFiles(treeNodes)
    expect(files).toHaveLength(2)
    expect(files.map((f) => f.name)).toContain('child.md')
    expect(files.map((f) => f.name)).toContain('root.md')
  })

  it('중복 경로는 한 번만 포함', () => {
    const file = makeFile('/a/dup.md')
    const treeNodes: Record<string, FileNode[]> = {
      '/a': [file],
      '/b': [file]
    }
    const files = getAllFiles(treeNodes)
    expect(files.filter((f) => f.path === '/a/dup.md')).toHaveLength(1)
  })

  it('빈 treeNodes → 빈 배열 반환', () => {
    expect(getAllFiles({})).toEqual([])
  })
})

describe('filterFiles', () => {
  const allFiles = [
    makeFile('/docs/intro.md'),
    makeFile('/docs/api.md'),
    makeFile('/notes/todo.md')
  ]
  const recentFiles = [{ path: '/notes/todo.md' }, { path: '/docs/intro.md' }]

  it('빈 쿼리 시 최근 파일 목록 반환', () => {
    const result = filterFiles('', allFiles, recentFiles)
    expect(result).toHaveLength(2)
    expect(result[0].path).toBe('/notes/todo.md')
  })

  it('파일명으로 필터링', () => {
    const result = filterFiles('intro', allFiles, recentFiles)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('intro.md')
  })

  it('경로로 필터링', () => {
    const result = filterFiles('docs', allFiles, recentFiles)
    expect(result).toHaveLength(2)
  })

  it('대소문자 무시', () => {
    const result = filterFiles('API', allFiles, recentFiles)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('api.md')
  })

  it('매칭 없음 → 빈 배열', () => {
    const result = filterFiles('xyz', allFiles, recentFiles)
    expect(result).toEqual([])
  })

  it('결과 최대 20개로 제한', () => {
    const many = Array.from({ length: 30 }, (_, i) => makeFile(`/a/file${i}.md`))
    const result = filterFiles('file', many, [])
    expect(result).toHaveLength(20)
  })

  it('최근 파일 최대 10개로 제한', () => {
    const recent = Array.from({ length: 15 }, (_, i) => ({ path: `/a/f${i}.md` }))
    const result = filterFiles('', [], recent)
    expect(result).toHaveLength(10)
  })
})
