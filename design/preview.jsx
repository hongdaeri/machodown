/* Preview pane + TOC pane */

function Preview({ mode, onModeChange, zoom, onZoom }) {
  const { PreviewBody, ICON } = window
  const paneRef = React.useRef(null)
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    if (!paneRef.current) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setNarrow(e.contentRect.width < 380)
    })
    ro.observe(paneRef.current)
    return () => ro.disconnect()
  }, [])
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
            ></span>
            실시간 동기화
          </span>
        )}
        <span className="seg" role="tablist" aria-label="보기 모드">
          <button
            className={mode === 'preview' ? 'on' : ''}
            onClick={() => onModeChange('preview')}
            aria-pressed={mode === 'preview'}
          >
            프리뷰
          </button>
          <button
            className={mode === 'reading' ? 'on' : ''}
            onClick={() => onModeChange('reading')}
            aria-pressed={mode === 'reading'}
          >
            읽기
          </button>
        </span>
        <span className="spacer"></span>
        <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
          <button className="icon-btn" aria-label="작게" onClick={() => onZoom(-1)}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          <span
            style={{ fontSize: 11, color: 'var(--fg-tertiary)', minWidth: 30, textAlign: 'center' }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button className="icon-btn" aria-label="크게" onClick={() => onZoom(1)}>
            {ICON.plus}
          </button>
        </span>
      </div>
      <div className="preview" style={{ fontSize: 15 * zoom + 'px' }}>
        <PreviewBody />
      </div>
    </div>
  )
}

function TocPane({ activeId, onJump, onClose }) {
  const { TOC, ICON } = window
  return (
    <div className="toc-pane">
      <div className="toc-head">
        <span>목차</span>
        <button className="icon-btn" aria-label="목차 닫기" onClick={onClose}>
          {ICON.close}
        </button>
      </div>
      <div className="toc-list">
        {TOC.map((item) => (
          <a
            key={item.id}
            className={'toc-item l' + item.level + (activeId === item.id ? ' active' : '')}
            href={'#' + item.id}
            onClick={(e) => {
              e.preventDefault()
              onJump(item.id)
            }}
          >
            {item.label}
          </a>
        ))}
        <div
          style={{
            padding: '12px 8px 4px',
            fontSize: 10.5,
            color: 'var(--fg-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600
          }}
        >
          문서 정보
        </div>
        <div
          style={{ padding: '0 8px', fontSize: 11.5, color: 'var(--fg-tertiary)', lineHeight: 1.7 }}
        >
          <div>단어 1,284</div>
          <div>예상 읽기 시간 6분</div>
          <div>최종 수정 2026‑04‑22</div>
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { Preview, TocPane })
