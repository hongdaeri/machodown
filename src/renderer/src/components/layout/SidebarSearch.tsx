import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useUiStore } from '../../stores/uiStore'
import { SearchResult } from '../../stores/types'
import { openFileByPath } from '../../lib/fileActions'

interface SearchResponse {
  ok: boolean
  results?: SearchResult[]
  message?: string
}

function SearchIcon(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function relPath(filePath: string, folders: { path: string }[]): string {
  for (const f of folders) {
    if (filePath.startsWith(f.path + '/')) {
      return filePath.slice(f.path.length + 1)
    }
  }
  return filePath.split('/').pop() ?? filePath
}

interface MatchRowProps {
  line: string
  lineNumber: number
  onClick: () => void
}

function MatchRow({ line, lineNumber, onClick }: MatchRowProps): React.ReactElement {
  return (
    <div className="search-result-match" onClick={onClick} title={`${lineNumber}번째 줄`}>
      <span className="search-result-match__lineno">{lineNumber}</span>
      <span className="search-result-match__text">{line.trim()}</span>
    </div>
  )
}

interface FileGroupProps {
  result: SearchResult
  folders: { path: string }[]
  onMatchClick: (path: string, lineNumber: number) => void
}

function FileGroup({ result, folders, onMatchClick }: FileGroupProps): React.ReactElement {
  const [collapsed, setCollapsed] = useState(false)
  const rel = relPath(result.path, folders)
  const fileName = rel.split('/').pop() ?? rel
  const dirPart = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : ''

  return (
    <div className="search-result-file">
      <div
        className="search-result-file__header"
        onClick={() => setCollapsed((v) => !v)}
        title={result.path}
      >
        <span className={`search-result-file__chev${collapsed ? '' : ' open'}`}>›</span>
        <span className="search-result-file__name">{fileName}</span>
        {dirPart && <span className="search-result-file__dir">{dirPart}</span>}
        <span className="search-result-file__count">{result.matches.length}</span>
      </div>
      {!collapsed &&
        result.matches.map((m) => (
          <MatchRow
            key={m.lineNumber}
            line={m.line}
            lineNumber={m.lineNumber}
            onClick={() => onMatchClick(result.path, m.lineNumber)}
          />
        ))}
    </div>
  )
}

export function SidebarSearch(): React.ReactElement {
  const folders = useWorkspaceStore((s) => s.folders)

  const [query, setQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(
    async (q: string, cs: boolean, rx: boolean): Promise<void> => {
      if (!q.trim() || folders.length === 0) {
        setResults([])
        setError(null)
        return
      }
      setSearching(true)
      setError(null)
      try {
        const res = (await window.api.invoke('search:files', {
          folders: folders.map((f) => f.path),
          query: q,
          useRegex: rx,
          caseSensitive: cs
        })) as SearchResponse
        if (res.ok) {
          setResults(res.results ?? [])
        } else {
          setError(res.message ?? '검색 오류')
          setResults([])
        }
      } catch {
        setError('검색 중 오류가 발생했습니다.')
        setResults([])
      } finally {
        setSearching(false)
      }
    },
    [folders]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void runSearch(query, caseSensitive, useRegex)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, caseSensitive, useRegex, runSearch])

  const handleMatchClick = useCallback(
    async (filePath: string, lineNumber: number): Promise<void> => {
      await openFileByPath(filePath)
      setTimeout(() => {
        useUiStore.getState().revealEditorLine?.(lineNumber)
      }, 80)
    },
    []
  )

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0)

  return (
    <div className="sidebar-search-panel">
      <div className="search">
        <SearchIcon />
        <input
          type="text"
          placeholder="검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          autoFocus
        />
      </div>

      <div className="search-options">
        <button
          className={`icon-btn search-opt-btn${caseSensitive ? ' on' : ''}`}
          title="대/소문자 구분"
          onClick={() => setCaseSensitive((v) => !v)}
        >
          Aa
        </button>
        <button
          className={`icon-btn search-opt-btn${useRegex ? ' on' : ''}`}
          title="정규식"
          onClick={() => setUseRegex((v) => !v)}
        >
          .*
        </button>
      </div>

      {folders.length === 0 && <p className="search-hint">먼저 폴더를 추가하세요.</p>}

      {error && <p className="search-hint search-hint--error">{error}</p>}

      {searching && <p className="search-hint">검색 중…</p>}

      {!searching && !error && query.trim() && results.length === 0 && folders.length > 0 && (
        <p className="search-hint">결과 없음</p>
      )}

      {results.length > 0 && (
        <>
          <div className="search-summary">
            {totalMatches}개 결과 ({results.length}개 파일)
          </div>
          <div className="search-results">
            {results.map((r) => (
              <FileGroup
                key={r.path}
                result={r}
                folders={folders}
                onMatchClick={(path, line) => void handleMatchClick(path, line)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
