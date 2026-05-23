import { useEffect, useRef, useState, useCallback } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { SearchResult } from '../../stores/types'

interface SearchResponse {
  ok: boolean
  results?: SearchResult[]
  message?: string
}

interface ReadFileResponse {
  ok: boolean
  content?: string
  encoding?: string
}

interface WriteFileResponse {
  ok: boolean
}

interface PreviewItem {
  path: string
  matchCount: number
}

function applyReplace(
  content: string,
  find: string,
  replace: string,
  caseSensitive: boolean,
  useRegex: boolean
): string {
  const flags = caseSensitive ? 'gm' : 'gim'
  let pattern: RegExp
  if (useRegex) {
    pattern = new RegExp(find, flags)
  } else {
    const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    pattern = new RegExp(escaped, flags)
  }
  return content.replace(pattern, replace)
}

export function ReplaceModal(): JSX.Element {
  const closeModal = useUiStore((s) => s.closeModal)
  const pushToast = useUiStore((s) => s.pushToast)
  const folders = useWorkspaceStore((s) => s.folders)
  const tabs = useEditorStore((s) => s.tabs)
  const updateContent = useEditorStore((s) => s.updateContent)

  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [preview, setPreview] = useState<PreviewItem[] | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [regexError, setRegexError] = useState<string | null>(null)

  const findRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    findRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeModal])

  useEffect(() => {
    setPreview(null)
    setRegexError(null)
  }, [find, replace, caseSensitive, useRegex])

  const validatePattern = useCallback((): boolean => {
    if (!useRegex) return true
    try {
      new RegExp(find)
      return true
    } catch (err) {
      setRegexError((err as Error).message)
      return false
    }
  }, [find, useRegex])

  const handlePreview = useCallback(async (): Promise<void> => {
    if (!find.trim()) return
    if (!validatePattern()) return
    setPreviewing(true)
    setRegexError(null)
    try {
      const res = (await window.api.invoke('search:files', {
        folders: folders.map((f) => f.path),
        query: find,
        useRegex,
        caseSensitive
      })) as SearchResponse
      if (!res.ok) {
        setRegexError(res.message ?? '검색 오류')
        setPreview(null)
      } else {
        setPreview((res.results ?? []).map((r) => ({ path: r.path, matchCount: r.matches.length })))
      }
    } finally {
      setPreviewing(false)
    }
  }, [find, replace, caseSensitive, useRegex, folders, validatePattern])

  const handleApply = useCallback(async (): Promise<void> => {
    if (!find.trim() || preview === null || preview.length === 0) return
    if (!validatePattern()) return
    setApplying(true)
    let totalReplaced = 0

    try {
      await Promise.all(
        preview.map(async (item) => {
          const openTab = tabs.find((t) => t.path === item.path)
          if (openTab) {
            const newContent = applyReplace(openTab.content, find, replace, caseSensitive, useRegex)
            updateContent(openTab.id, newContent)
            totalReplaced += item.matchCount
          } else {
            const readRes = (await window.api.invoke('fs:readFile', {
              path: item.path
            })) as ReadFileResponse
            if (!readRes.ok || readRes.content === undefined) return
            const newContent = applyReplace(readRes.content, find, replace, caseSensitive, useRegex)
            const writeRes = (await window.api.invoke('fs:writeFile', {
              path: item.path,
              content: newContent,
              encoding: readRes.encoding ?? 'utf-8'
            })) as WriteFileResponse
            if (writeRes.ok) totalReplaced += item.matchCount
          }
        })
      )
      pushToast({
        type: 'success',
        message: `${totalReplaced}개 항목을 ${preview.length}개 파일에서 교체했습니다.`
      })
      closeModal()
    } catch {
      pushToast({ type: 'error', message: '바꾸기 중 오류가 발생했습니다.' })
    } finally {
      setApplying(false)
    }
  }, [
    find,
    replace,
    caseSensitive,
    useRegex,
    preview,
    tabs,
    updateContent,
    pushToast,
    closeModal,
    validatePattern
  ])

  const canPreview = find.trim().length > 0 && folders.length > 0
  const canApply = preview !== null && preview.length > 0 && !applying
  const totalMatches = preview?.reduce((s, i) => s + i.matchCount, 0) ?? 0

  return (
    <div className="modal-scrim" onMouseDown={closeModal}>
      <div className="modal replace-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>일괄 바꾸기</h3>

        <div className="field">
          <label>찾기</label>
          <input
            ref={findRef}
            type="text"
            value={find}
            placeholder="검색어..."
            spellCheck={false}
            onChange={(e) => setFind(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handlePreview()
            }}
          />
        </div>

        <div className="field">
          <label>바꾸기</label>
          <input
            type="text"
            value={replace}
            placeholder="바꿀 텍스트..."
            spellCheck={false}
            onChange={(e) => setReplace(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handlePreview()
            }}
          />
        </div>

        <div className="replace-options">
          <label className="replace-opt-label">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />
            대/소문자 구분
          </label>
          <label className="replace-opt-label">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
            />
            정규식
          </label>
        </div>

        {regexError && <p className="field-error">{regexError}</p>}

        {preview !== null && (
          <div className="replace-preview">
            {preview.length === 0 ? (
              <p className="replace-preview__empty">검색 결과 없음</p>
            ) : (
              <>
                <p className="replace-preview__summary">
                  {totalMatches}개 항목 · {preview.length}개 파일
                </p>
                <ul className="replace-preview__list">
                  {preview.map((item) => {
                    const name = item.path.split('/').pop() ?? item.path
                    return (
                      <li key={item.path} className="replace-preview__item">
                        <span className="replace-preview__filename">{name}</span>
                        <span className="replace-preview__count">{item.matchCount}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="actions">
          <button className="btn" onClick={closeModal}>
            취소
          </button>
          <button
            className="btn"
            onClick={() => void handlePreview()}
            disabled={!canPreview || previewing}
          >
            {previewing ? '검색 중…' : '미리보기'}
          </button>
          <button className="btn primary" onClick={() => void handleApply()} disabled={!canApply}>
            {applying ? '처리 중…' : '모두 바꾸기'}
          </button>
        </div>
      </div>
    </div>
  )
}
