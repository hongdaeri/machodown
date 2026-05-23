/* Editor view: tabs, gutter, syntax-highlighted code, minimap */

function renderTokens(text) {
  /* hand-rolled markdown highlighter for the visible sample */
  if (!text) return <span>&nbsp;</span>

  // fenced TS code block content
  if (
    text.startsWith('type ') ||
    text.startsWith('export ') ||
    (text.includes(':') && text.match(/^\s*(sidebar|editor|preview|toc):/))
  ) {
    return tokenizeTS(text)
  }
  return tokenizeMD(text)
}

function tokenizeMD(text) {
  // headings
  const h = text.match(/^(#{1,6})\s+(.*)$/)
  if (h) {
    return (
      <>
        <span className="tok-h-mark">{h[1]} </span>
        <span className="tok-h">{h[2]}</span>
      </>
    )
  }
  // frontmatter delimiter
  if (text === '---' || text.match(/^[a-zA-Z][\w-]*:\s/)) {
    if (text === '---') return <span className="tok-front">{text}</span>
    const m = text.match(/^([a-zA-Z][\w-]*):\s*(.*)$/)
    if (m)
      return (
        <>
          <span className="tok-attr">{m[1]}</span>
          <span className="tok-front">: </span>
          <span className="tok-str">{m[2]}</span>
        </>
      )
  }
  // task list
  const task = text.match(/^(\s*-\s+)\[(x| )\]\s+(.*)$/)
  if (task) {
    return (
      <>
        <span className="tok-list">{task[1]}</span>
        <span className="tok-h-mark">[{task[2]}] </span>
        {inlineMD(task[3])}
      </>
    )
  }
  // list item
  const li = text.match(/^(\s*-\s+)(.*)$/)
  if (li)
    return (
      <>
        <span className="tok-list">{li[1]}</span>
        {inlineMD(li[2])}
      </>
    )

  // blockquote
  if (text.startsWith('>')) {
    const rest = text.replace(/^>\s?/, '')
    return (
      <>
        <span className="tok-q">&gt; </span>
        {inlineMD(rest)}
      </>
    )
  }
  // fence open / close
  if (text.startsWith('```')) {
    const lang = text.replace(/^```/, '')
    return (
      <>
        <span className="tok-fence">```</span>
        <span className="tok-lang">{lang}</span>
      </>
    )
  }
  return inlineMD(text)
}

function inlineMD(text) {
  /* Splits inline markdown into spans:
     bold **x**, em *x*, code `x`, links [a](b) */
  const out = []
  let i = 0,
    key = 0
  const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) out.push(<span key={key++}>{text.slice(i, m.index)}</span>)
    const tok = m[0]
    if (tok.startsWith('**')) {
      out.push(
        <span key={key++} className="tok-bold">
          {tok}
        </span>
      )
    } else if (tok.startsWith('*')) {
      out.push(
        <span key={key++} className="tok-em">
          {tok}
        </span>
      )
    } else if (tok.startsWith('`')) {
      out.push(
        <span key={key++} className="tok-code">
          {tok}
        </span>
      )
    } else if (tok.startsWith('[')) {
      const lm = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      out.push(
        <span key={key++}>
          <span className="tok-h-mark">[</span>
          <span className="tok-link">{lm[1]}</span>
          <span className="tok-h-mark">](</span>
          <span className="tok-url">{lm[2]}</span>
          <span className="tok-h-mark">)</span>
        </span>
      )
    }
    i = m.index + tok.length
  }
  if (i < text.length) out.push(<span key={key++}>{text.slice(i)}</span>)
  return out.length ? out : <span>{text}</span>
}

function tokenizeTS(text) {
  // very small TS-ish highlighter
  const keywords = /\b(type|export|const|let|var|interface|return|function)\b/g
  const strings = /"[^"]*"/g
  const nums = /\b\d+\b/g
  const comments = /\/\/.*$/

  // comment wins
  const cm = text.match(/^(\s*)(\/\/.*)$/)
  if (cm)
    return (
      <>
        <span>{cm[1]}</span>
        <span className="tok-com">{cm[2]}</span>
      </>
    )

  // walk: replace tokens by markers, then split
  const parts = []
  let rest = text,
    key = 0
  const re =
    /("[^"]*")|(\/\/.*$)|(\b(?:type|export|const|let|var|interface|return|function)\b)|(\b\d+\b)/g
  let lastIdx = 0,
    m
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(<span key={key++}>{text.slice(lastIdx, m.index)}</span>)
    const tok = m[0]
    if (tok.startsWith('"'))
      parts.push(
        <span key={key++} className="tok-str">
          {tok}
        </span>
      )
    else if (tok.startsWith('//'))
      parts.push(
        <span key={key++} className="tok-com">
          {tok}
        </span>
      )
    else if (/^\d/.test(tok))
      parts.push(
        <span key={key++} className="tok-num">
          {tok}
        </span>
      )
    else
      parts.push(
        <span key={key++} className="tok-kw">
          {tok}
        </span>
      )
    lastIdx = m.index + tok.length
  }
  if (lastIdx < text.length) parts.push(<span key={key++}>{text.slice(lastIdx)}</span>)
  return parts.length ? parts : <span>{text}</span>
}

function Editor({ currentLine, hideTabs, showMinimap, fontSize, showRule, onCaretLine }) {
  const { OPEN_TABS, EDITOR_LINES, ICON } = window
  const lineRef = React.useRef(null)

  return (
    <div className="editor-pane" style={{ '--editor-fs': fontSize + 'px' }}>
      {!hideTabs && (
        <div className="tabbar">
          {OPEN_TABS.map((t) => (
            <div key={t.id} className={'tab' + (t.active ? ' active' : '')}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{ICON.md}</span>
              <span>{t.name}</span>
              {t.modified ? (
                <span className="dot-mod" title="저장되지 않음"></span>
              ) : (
                <span className="close" aria-label="닫기">
                  {ICON.close}
                </span>
              )}
            </div>
          ))}
          <div style={{ flex: 1, borderBottom: '1px solid var(--divider)' }}></div>
        </div>
      )}

      <div className="breadcrumb">
        <span className="crumb">design-notes</span>
        <span className="sep">›</span>
        <span className="crumb">inbox</span>
        <span className="sep">›</span>
        <span className="crumb current">editor-spec.md</span>
        <span style={{ flex: 1 }}></span>
        <span style={{ color: 'var(--fg-tertiary)' }}>UTF-8 · LF · Markdown</span>
      </div>

      <div className="editor-body" style={{ fontSize: fontSize + 'px' }}>
        <div className="gutter" style={{ fontSize: fontSize - 0.5 + 'px' }}>
          {EDITOR_LINES.map((_, i) => (
            <div key={i} className={i + 1 === currentLine ? 'current' : ''}>
              {i + 1}
            </div>
          ))}
        </div>

        <div className="code" ref={lineRef} style={{ fontSize: fontSize + 'px' }}>
          {EDITOR_LINES.map((ln, i) => {
            const isCurrent = i + 1 === currentLine
            const isCaret = i + 1 === currentLine
            return (
              <span
                key={i}
                className={'ln' + (isCurrent ? ' current' : '')}
                onClick={() => onCaretLine?.(i + 1)}
              >
                {renderTokens(ln.v)}
                {isCaret ? <span className="caret"></span> : null}
                {'\n'}
              </span>
            )
          })}
          {/* highlight current line ruler */}
          {showRule && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                pointerEvents: 'none'
              }}
            />
          )}
        </div>

        {showMinimap && <Minimap currentLine={currentLine} total={EDITOR_LINES.length} />}
      </div>
    </div>
  )
}

function Minimap({ currentLine, total }) {
  const { EDITOR_LINES } = window
  // viewport indicator
  const vpHeight = 18 // 18 lines shown
  const top = ((currentLine - vpHeight / 2) / total) * 100
  return (
    <div className="minimap">
      {EDITOR_LINES.map((ln, i) => {
        const widthCls =
          ln.t === 'h1'
            ? 'long'
            : ln.t === 'h2'
              ? 'med'
              : ln.t === 'h3'
                ? 'sht'
                : ln.t === 'li'
                  ? 'med'
                  : ln.t === 'blank'
                    ? 'xs'
                    : ln.t.startsWith('fence')
                      ? 'sht'
                      : ln.t === 'code'
                        ? 'med'
                        : ln.t === 'quote'
                          ? 'med'
                          : 'long'
        const kindCls =
          ln.t === 'h1' || ln.t === 'h2' || ln.t === 'h3' ? 'h' : ln.t === 'code' ? 'c' : ''
        if (ln.t === 'blank')
          return <div key={i} className="minimap-line xs" style={{ opacity: 0 }} />
        return <div key={i} className={`minimap-line ${kindCls} ${widthCls}`} />
      })}
      <div
        className="minimap-vp"
        style={{
          top: Math.max(2, (top / 100) * (EDITOR_LINES.length * 5)) + 'px',
          height: vpHeight * 5 + 'px'
        }}
      />
    </div>
  )
}

Object.assign(window, { Editor })
