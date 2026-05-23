/* Markflow — Markdown editor & viewer prototype
   App shell wiring sidebar / editor / preview / toc together. */

const { useState, useEffect, useRef, useCallback } = React

/* ───── Tweak defaults (persisted via host) ───── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  theme: 'dark',
  showSidebar: true,
  showToc: true,
  showMinimap: true,
  compactMode: false,
  fontSize: 13,
  accent: '#3a72d8',
  previewMode: 'preview',
  showPalette: false,
  showModal: false,
  showToast: true,
  responsive: 'wide'
} /*EDITMODE-END*/

const ACCENT_OPTIONS = [
  '#3a72d8', // blue (default)
  '#6c47d6', // violet
  '#1f8a5b', // green
  '#c8542a', // orange
  '#737373' // graphite (neutral)
]

/* ───── Top window chrome ───── */
function TitleBar({ activeFile, modified, compact }) {
  return (
    <div className="titlebar" style={{ height: compact ? 30 : 36 }}>
      <div className="traffic" aria-label="window controls">
        <div className="tl-dot tl-close"></div>
        <div className="tl-dot tl-min"></div>
        <div className="tl-dot tl-max"></div>
      </div>
      <div className="title-center">
        <span style={{ color: 'var(--fg-tertiary)' }}>Markflow — </span>
        {activeFile}
        {modified && <span className="dot-unsaved" aria-label="저장되지 않음"></span>}
      </div>
      <div style={{ width: 60 }}></div>
    </div>
  )
}

function MenuDropdown({ items, onAction, flags }) {
  return (
    <div className="menu-dropdown" role="menu">
      {items.map((it, i) => {
        if (it.sep) return <div key={i} className="menu-sep" role="separator"></div>
        const checked = it.checkable && flags && flags[it.action]
        return (
          <div
            key={i}
            className={'menu-row' + (it.disabled ? ' disabled' : '') + (checked ? ' checked' : '')}
            role="menuitem"
            onMouseDown={(e) => {
              e.preventDefault()
              onAction?.(it)
            }}
          >
            <span className="lbl">{it.label}</span>
            {it.submenu && <span className="submark">›</span>}
            {it.kbd && <span className="kbd">{it.kbd}</span>}
          </div>
        )
      })}
    </div>
  )
}

function MenuBar({ theme, onToggleTheme, onPalette, onTogglePreviewSplit, flags, onAction }) {
  const { ICON, MENUS } = window
  const items = ['File', 'Edit', 'Selection', 'View', 'Go', 'Help']
  const [openMenu, setOpenMenu] = useState(null)
  const barRef = useRef(null)

  useEffect(() => {
    if (!openMenu) return
    const onDown = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenMenu(null)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  const handleAction = (it) => {
    setOpenMenu(null)
    onAction?.(it)
  }

  return (
    <div className="menubar" ref={barRef}>
      {items.map((label) => (
        <div
          key={label}
          className={'menu-item' + (openMenu === label ? ' open' : '')}
          onMouseDown={(e) => {
            e.preventDefault()
            setOpenMenu((prev) => (prev === label ? null : label))
          }}
          onMouseEnter={() => {
            if (openMenu) setOpenMenu(label)
          }}
          role="button"
          aria-haspopup="menu"
          aria-expanded={openMenu === label}
        >
          {label}
          {openMenu === label && MENUS[label] && (
            <MenuDropdown items={MENUS[label]} onAction={handleAction} flags={flags} />
          )}
        </div>
      ))}
      <div className="menubar-spacer"></div>
      <button className="menubar-action" aria-label="명령어 팔레트" onClick={onPalette} title="⌘ P">
        {ICON.search}
      </button>
      <button
        className="menubar-action"
        aria-label="분할 보기"
        onClick={onTogglePreviewSplit}
        title="분할"
      >
        {ICON.split}
      </button>
      <button
        className="menubar-action"
        aria-label="테마 전환"
        onClick={onToggleTheme}
        title="테마"
      >
        {theme === 'dark' ? ICON.sun : ICON.moon}
      </button>
      <button className="menubar-action" aria-label="설정" title="설정">
        {ICON.gear}
      </button>
    </div>
  )
}

function StatusBar({ modified, currentLine, totalLines, branch }) {
  return (
    <div className="statusbar" role="status" aria-live="polite">
      <span className="item" title="버전 관리 브랜치">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <circle cx="3" cy="3" r="1.4" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="3" cy="9" r="1.4" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="9" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 4.4v3.2M3 6h3.6" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {branch}
      </span>
      <span className="item">{modified ? '● 저장되지 않음' : '✓ 저장됨'}</span>
      <span className="item">자동 저장 켜짐</span>
      <span className="grow"></span>
      <span className="item">줄 {currentLine}, 칸 12</span>
      <span className="item">{totalLines} 줄</span>
      <span className="item">공백 2</span>
      <span className="item">UTF-8</span>
      <span className="item">LF</span>
      <span className="item">Markdown</span>
    </div>
  )
}

/* ───── Drag resize ───── */
function useResize(initial, min, max) {
  const [w, setW] = useState(initial)
  const dragRef = useRef(null)

  const start = useCallback(
    (e, dir = 'left') => {
      e.preventDefault()
      dragRef.current = { startX: e.clientX, startW: w, dir }
      document.body.style.cursor = 'col-resize'
    },
    [w]
  )

  useEffect(() => {
    const move = (e) => {
      if (!dragRef.current) return
      const d = e.clientX - dragRef.current.startX
      const sign = dragRef.current.dir === 'left' ? 1 : -1
      const next = Math.min(max, Math.max(min, dragRef.current.startW + sign * d))
      setW(next)
    }
    const up = () => {
      if (!dragRef.current) return
      dragRef.current = null
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [min, max])

  return [w, start]
}

/* ───── Toasts ───── */
function ToastStack({ items, onDismiss }) {
  const { ICON } = window
  return (
    <div className="toast-stack">
      {items.map((t) => (
        <div key={t.id} className="toast" role="alert">
          <span className={'ico ' + t.kind}>
            {t.kind === 's' ? '✓' : t.kind === 'w' ? '!' : '×'}
          </span>
          <div style={{ flex: 1 }}>
            <div className="title">{t.title}</div>
            <div className="body">{t.body}</div>
          </div>
          <span className="close-x" onClick={() => onDismiss(t.id)}>
            {ICON.close}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ───── Confirm modal ───── */
function NewFileModal({ onClose, onConfirm }) {
  const [name, setName] = useState('untitled.md')
  const inputRef = useRef(null)
  useEffect(() => {
    inputRef.current?.select()
  }, [])
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">
        <h3 id="m-title">새 마크다운 파일</h3>
        <p>
          현재 폴더{' '}
          <code
            style={{
              background: 'var(--bg-panel)',
              padding: '1px 6px',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 12
            }}
          >
            design-notes/inbox
          </code>
          에 파일을 만듭니다.
        </p>
        <div className="field">
          <label htmlFor="fn">파일 이름</label>
          <input
            id="fn"
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(name)
              if (e.key === 'Escape') onClose()
            }}
          />
        </div>
        <div className="actions">
          <button className="btn" onClick={onClose}>
            취소
          </button>
          <button className="btn primary" onClick={() => onConfirm(name)}>
            만들기
          </button>
        </div>
      </div>
    </div>
  )
}

/* ───── Command palette ───── */
function Palette({ onClose }) {
  const { COMMANDS, ICON } = window
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))

  return (
    <div
      className="modal-scrim"
      style={{ alignItems: 'flex-start' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="palette" role="dialog" aria-modal="true">
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="명령 또는 파일 검색…  (⌘P)"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setSel(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setSel((s) => Math.min(filtered.length - 1, s + 1))
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setSel((s) => Math.max(0, s - 1))
            }
            if (e.key === 'Enter') {
              onClose()
            }
          }}
        />
        <div className="palette-list">
          {filtered.length === 0 && (
            <div className="palette-row" style={{ color: 'var(--fg-tertiary)' }}>
              일치하는 명령이 없습니다.
            </div>
          )}
          {filtered.map((c, i) => (
            <div key={c.label} className={'palette-row' + (i === sel ? ' sel' : '')}>
              <span className="ico">{ICON[c.ico] || ICON.file}</span>
              <span>{c.label}</span>
              <span className="kbd">{c.kbd}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ───── Responsive (small) mode: tabbed editor/preview ───── */
function SmallApp({ tweaks, setTweak }) {
  const { Sidebar, Editor, Preview, ICON, OPEN_TABS } = window
  const [pane, setPane] = useState('editor') // 'editor' | 'preview'
  const [zoom, setZoom] = useState(1)

  const activeTab = OPEN_TABS.find((t) => t.active) || OPEN_TABS[0]

  return (
    <>
      <TitleBar activeFile={activeTab.name} modified={activeTab.modified} compact={true} />
      <div className="menubar" style={{ height: 36 }}>
        <button className="icon-btn" aria-label="사이드바">
          {ICON.panelLeft}
        </button>
        <div style={{ flex: 1, marginLeft: 8 }}>
          <div className="tab-toggle">
            <button className={pane === 'editor' ? 'on' : ''} onClick={() => setPane('editor')}>
              편집
            </button>
            <button className={pane === 'preview' ? 'on' : ''} onClick={() => setPane('preview')}>
              미리보기
            </button>
          </div>
        </div>
        <button
          className="menubar-action"
          onClick={() => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
        >
          {tweaks.theme === 'dark' ? ICON.sun : ICON.moon}
        </button>
      </div>
      <div className="workspace">
        {pane === 'editor' ? (
          <Editor currentLine={9} hideTabs={true} showMinimap={false} fontSize={tweaks.fontSize} />
        ) : (
          <Preview
            mode="preview"
            onModeChange={() => {}}
            zoom={zoom}
            onZoom={(d) => setZoom((z) => Math.max(0.8, Math.min(1.4, z + d * 0.1)))}
          />
        )}
      </div>
      <StatusBar
        modified={true}
        currentLine={9}
        totalLines={window.EDITOR_LINES.length}
        branch="main"
      />
    </>
  )
}

/* ───── App ───── */
function App({ tweaks, setTweak }) {
  /* derived state */
  const [sidebarW, startSidebarDrag] = useResize(240, 160, 360)
  const [editorW, startEditorDrag] = useResize(460, 320, 900)
  const [selectedId, setSelectedId] = useState('doc2')
  const [currentLine, setCurrentLine] = useState(9)
  const [activeToc, setActiveToc] = useState('goals')
  const [previewZoom, setPreviewZoom] = useState(1)

  const [toasts, setToasts] = useState([])
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  /* push the initial toast once when the option is on */
  useEffect(() => {
    if (tweaks.showToast && toasts.length === 0) {
      setToasts([
        {
          id: 't1',
          kind: 's',
          title: '자동 저장됨',
          body: 'editor-spec.md · 방금 전'
        }
      ])
      const t2 = setTimeout(() => {
        setToasts((prev) => [
          ...prev,
          {
            id: 't2',
            kind: 'w',
            title: '외부 변경 감지',
            body: '디스크의 markflow-roadmap.md가 수정되었습니다. 다시 불러올까요?'
          }
        ])
      }, 600)
      return () => clearTimeout(t2)
    }
    if (!tweaks.showToast) setToasts([])
  }, [tweaks.showToast])

  /* apply accent token */
  useEffect(() => {
    const root = document.documentElement
    if (tweaks.accent) {
      root.style.setProperty('--accent', tweaks.accent)
      // soft variant: rgba w/ 0.18 alpha via color-mix
      root.style.setProperty(
        '--accent-soft',
        `color-mix(in oklch, ${tweaks.accent} 18%, transparent)`
      )
    }
  }, [tweaks.accent])

  /* theme class on the window */
  const themeCls = tweaks.theme === 'dark' ? 'theme-dark' : 'theme-light'

  /* compact responsive view */
  if (tweaks.responsive === 'narrow') {
    return (
      <div
        className={'window ' + themeCls}
        style={{
          width: 820,
          height: 720,
          fontSize: tweaks.compactMode ? 13 : 14
        }}
      >
        <SmallApp tweaks={tweaks} setTweak={setTweak} />
      </div>
    )
  }

  const activeTab = window.OPEN_TABS.find((t) => t.active) || window.OPEN_TABS[0]

  return (
    <div
      className={'window ' + themeCls}
      style={{
        width: tweaks.responsive === 'medium' ? 1100 : 1280,
        height: tweaks.responsive === 'medium' ? 760 : 820
      }}
    >
      <TitleBar
        activeFile={activeTab.name}
        modified={activeTab.modified}
        compact={tweaks.compactMode}
      />
      <MenuBar
        theme={tweaks.theme}
        onToggleTheme={() => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
        onPalette={() => setTweak('showPalette', true)}
        onTogglePreviewSplit={() => setTweak('showToc', !tweaks.showToc)}
        flags={{
          toggleSidebar: tweaks.showSidebar,
          togglePreview: true,
          toggleToc: tweaks.showToc,
          toggleMinimap: tweaks.showMinimap
        }}
        onAction={(it) => {
          switch (it.action) {
            case 'newFile':
              setTweak('showModal', true)
              break
            case 'palette':
              setTweak('showPalette', true)
              break
            case 'toggleSidebar':
              setTweak('showSidebar', !tweaks.showSidebar)
              break
            case 'toggleToc':
              setTweak('showToc', !tweaks.showToc)
              break
            case 'toggleMinimap':
              setTweak('showMinimap', !tweaks.showMinimap)
              break
            default:
              break
          }
        }}
      />

      <div className="workspace">
        {tweaks.showSidebar && (
          <>
            <window.Sidebar
              width={sidebarW}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpenSettings={() => setTweak('showModal', true)}
              theme={tweaks.theme}
              onToggleTheme={() => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
            />
            <div
              className="resize"
              onMouseDown={(e) => startSidebarDrag(e, 'left')}
              aria-label="사이드바 너비 조절"
            ></div>
          </>
        )}

        <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          <div style={{ width: editorW, display: 'flex', minWidth: 0 }}>
            <window.Editor
              currentLine={currentLine}
              showMinimap={tweaks.showMinimap}
              fontSize={tweaks.fontSize}
              onCaretLine={setCurrentLine}
            />
          </div>
          <div
            className="resize"
            onMouseDown={(e) => startEditorDrag(e, 'left')}
            aria-label="에디터 너비 조절"
          ></div>
          <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
            <window.Preview
              mode={tweaks.previewMode}
              onModeChange={(m) => setTweak('previewMode', m)}
              zoom={previewZoom}
              onZoom={(d) => setPreviewZoom((z) => Math.max(0.8, Math.min(1.6, z + d * 0.1)))}
            />
          </div>

          {tweaks.showToc && (
            <window.TocPane
              activeId={activeToc}
              onJump={(id) => setActiveToc(id)}
              onClose={() => setTweak('showToc', false)}
            />
          )}
        </div>
      </div>

      <StatusBar
        modified={activeTab.modified}
        currentLine={currentLine}
        totalLines={window.EDITOR_LINES.length}
        branch="design/editor-spec"
      />

      {tweaks.showToast && <ToastStack items={toasts} onDismiss={dismissToast} />}
      {tweaks.showModal && (
        <NewFileModal
          onClose={() => setTweak('showModal', false)}
          onConfirm={(name) => {
            setTweak('showModal', false)
            setToasts((prev) => [
              ...prev,
              {
                id: 't-new-' + Date.now(),
                kind: 's',
                title: '파일 생성',
                body: name + ' 이(가) inbox 폴더에 생성되었습니다.'
              }
            ])
          }}
        />
      )}
      {tweaks.showPalette && <Palette onClose={() => setTweak('showPalette', false)} />}
    </div>
  )
}

/* ───── Tweaks UI ───── */
function TweaksUI({ tweaks, setTweak }) {
  const {
    TweaksPanel,
    TweakSection,
    TweakRadio,
    TweakToggle,
    TweakSlider,
    TweakColor,
    TweakButton
  } = window

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Appearance">
        <TweakRadio
          label="Theme"
          value={tweaks.theme}
          onChange={(v) => setTweak('theme', v)}
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' }
          ]}
        />
        <TweakColor
          label="Accent"
          value={tweaks.accent}
          onChange={(v) => setTweak('accent', v)}
          options={ACCENT_OPTIONS}
        />
        <TweakToggle
          label="Compact density"
          value={tweaks.compactMode}
          onChange={(v) => setTweak('compactMode', v)}
        />
      </TweakSection>

      <TweakSection label="Layout">
        <TweakToggle
          label="Sidebar"
          value={tweaks.showSidebar}
          onChange={(v) => setTweak('showSidebar', v)}
        />
        <TweakToggle
          label="Outline (TOC)"
          value={tweaks.showToc}
          onChange={(v) => setTweak('showToc', v)}
        />
        <TweakToggle
          label="Minimap"
          value={tweaks.showMinimap}
          onChange={(v) => setTweak('showMinimap', v)}
        />
        <TweakRadio
          label="Viewport"
          value={tweaks.responsive}
          onChange={(v) => setTweak('responsive', v)}
          options={[
            { value: 'wide', label: 'Wide' },
            { value: 'medium', label: 'Med' },
            { value: 'narrow', label: 'Narrow' }
          ]}
        />
      </TweakSection>

      <TweakSection label="Editor">
        <TweakSlider
          label="Font size"
          value={tweaks.fontSize}
          min={11}
          max={18}
          step={0.5}
          onChange={(v) => setTweak('fontSize', v)}
          unit="px"
        />
        <TweakRadio
          label="Preview"
          value={tweaks.previewMode}
          onChange={(v) => setTweak('previewMode', v)}
          options={[
            { value: 'preview', label: 'Live' },
            { value: 'reading', label: 'Read' }
          ]}
        />
      </TweakSection>

      <TweakSection label="States">
        <TweakToggle
          label="Toast 알림"
          value={tweaks.showToast}
          onChange={(v) => setTweak('showToast', v)}
        />
        <TweakButton label="새 파일 다이얼로그" onClick={() => setTweak('showModal', true)} />
        <TweakButton label="명령어 팔레트 (⌘P)" onClick={() => setTweak('showPalette', true)} />
      </TweakSection>
    </TweaksPanel>
  )
}

/* ───── Mount ───── */
function Root() {
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS)
  return (
    <>
      <div className="stage" data-screen-label="01 Main editor">
        <App tweaks={tweaks} setTweak={setTweak} />
      </div>
      <TweaksUI tweaks={tweaks} setTweak={setTweak} />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
