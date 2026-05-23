import { useCallback, useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { useEditorStore } from '../../stores/editorStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useUiStore } from '../../stores/uiStore'
import type { TocItem } from '../../stores/types'
import { registerPreviewScroll, syncFromPreview } from '../../lib/scrollSync'

const HEADING_RE = /^#{1,6}\s+(.*)/

const RENDER_DEBOUNCE_MS = 80

const ZOOM_MIN = 0.5
const ZOOM_MAX = 2.0
const ZOOM_STEP = 0.1

interface WorkerResponse {
  id: number
  html: string
  toc: TocItem[]
}

export let scrollPreviewToSlug: (slug: string) => void = () => {}

export function PreviewPane(): JSX.Element {
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const content = useEditorStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.content ?? '')
  const katexEnabled = useSettingsStore((s) => s.settings.preview.katex)
  const setToc = useUiStore((s) => s.setToc)
  const viewMode = useUiStore((s) => s.viewMode)
  const setViewMode = useUiStore((s) => s.setViewMode)

  const paneRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const msgIdRef = useRef(0)

  const [narrow, setNarrow] = useState(false)
  const [zoom, setZoom] = useState(1.0)

  scrollPreviewToSlug = useCallback((slug: string) => {
    if (!containerRef.current) return
    const el = containerRef.current.querySelector(`#${CSS.escape(slug)}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const el = paneRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setNarrow(entry.contentRect.width < 380)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    registerPreviewScroll((ratio) => {
      const el = containerRef.current
      if (!el) return
      const maxScroll = el.scrollHeight - el.clientHeight
      if (maxScroll <= 0) return
      el.scrollTop = Math.round(ratio * maxScroll)
    })
  }, [])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!useSettingsStore.getState().settings.preview.syncScroll) return
    const el = e.currentTarget
    const maxScroll = el.scrollHeight - el.clientHeight
    if (maxScroll <= 0) return
    syncFromPreview(el.scrollTop / maxScroll)
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL('../../workers/markdown.worker.ts', import.meta.url), {
      type: 'module'
    })
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (!containerRef.current) return
      containerRef.current.innerHTML = DOMPurify.sanitize(e.data.html)
      setToc(e.data.toc)
    }
    workerRef.current = worker
    return () => worker.terminate()
  }, [setToc])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      workerRef.current?.postMessage({
        id: ++msgIdRef.current,
        markdown: content,
        katexEnabled
      })
    }, RENDER_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [content, katexEnabled])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (e.target as HTMLElement).closest('a')
    if (anchor) {
      e.preventDefault()
      const href = anchor.getAttribute('href') ?? ''
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        void window.api.invoke('shell:openExternal', { url: href })
      }
      return
    }

    const heading = (e.target as HTMLElement).closest('h1,h2,h3,h4,h5,h6')
    if (heading) {
      const headingText = (heading.textContent ?? '').trim()
      const state = useEditorStore.getState()
      const tabContent = state.tabs.find((t) => t.id === state.activeTabId)?.content ?? ''
      const lines = tabContent.split('\n')
      const lineIndex = lines.findIndex((line) => {
        const m = HEADING_RE.exec(line)
        return m !== null && m[1].trim() === headingText
      })
      if (lineIndex >= 0) {
        useUiStore.getState().revealEditorLine?.(lineIndex + 1)
      }
    }
  }, [])

  const handleZoom = useCallback((dir: 1 | -1) => {
    setZoom((prev) => {
      const next = Math.round((prev + dir * ZOOM_STEP) * 10) / 10
      return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    })
  }, [])

  if (!activeTabId) return <div className="preview-pane" ref={paneRef} />

  return (
    <div className="preview-pane" ref={paneRef}>
      <div className="preview-toolbar">
        {!narrow && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              paddingRight: 6,
              whiteSpace: 'nowrap'
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'inline-block'
              }}
            />
            실시간 동기화
          </span>
        )}
        <span className="seg" role="tablist" aria-label="보기 모드">
          <button
            className={viewMode === 'editor' ? 'on' : ''}
            aria-pressed={viewMode === 'editor'}
            onClick={() => setViewMode('editor')}
          >
            편집
          </button>
          <button
            className={viewMode === 'preview' ? 'on' : ''}
            aria-pressed={viewMode === 'preview'}
            onClick={() => setViewMode('preview')}
          >
            프리뷰
          </button>
          <button
            className={viewMode === 'split' ? 'on' : ''}
            aria-pressed={viewMode === 'split'}
            onClick={() => setViewMode('split')}
          >
            스플릿
          </button>
        </span>
        <span className="spacer" />
        <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
          <button className="icon-btn" aria-label="작게" onClick={() => handleZoom(-1)}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <span
            style={{ fontSize: 11, color: 'var(--fg-tertiary)', minWidth: 30, textAlign: 'center' }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button className="icon-btn" aria-label="크게" onClick={() => handleZoom(1)}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M6 2v8M2 6h8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </span>
      </div>
      <div
        ref={containerRef}
        className="preview"
        style={{ zoom }}
        onClick={handleClick}
        onScroll={handleScroll}
      />
    </div>
  )
}
