/* Sample workspace data + markdown content for the prototype */

const ICON = {
  folder: (open) => (
    <svg
      className="ico"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="M2 5.5a1 1 0 0 1 1-1h2.5l1.4 1.4H13a1 1 0 0 1 1 1V7H2V5.5Z" />
          <path
            d="M2.2 7h11.6l-1 4.3a1.2 1.2 0 0 1-1.17.95H3.37A1.2 1.2 0 0 1 2.2 11.3L2.2 7Z"
            fill="currentColor"
            fillOpacity="0.10"
          />
        </>
      ) : (
        <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h2.3a1 1 0 0 1 .78.38L7.5 5.4h5A1.5 1.5 0 0 1 14 6.9v4.6A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-6Z" />
      )}
    </svg>
  ),
  file: (
    <svg
      className="ico"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M9.5 1.8H4.3a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h7.4a1 1 0 0 0 1-1V5L9.5 1.8Z" />
      <path d="M9.5 1.8V5h3.2" />
    </svg>
  ),
  md: (
    <svg
      className="ico"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect x="1.5" y="3.8" width="13" height="8.4" rx="1.6" />
      <path d="M3.8 10V6l1.9 2.4L7.6 6v4" />
      <path d="M10.4 6v4" />
      <path d="M9 8.6L10.4 10L11.8 8.6" />
    </svg>
  ),
  chevron: (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 3L7.5 6L4.5 9" />
    </svg>
  ),
  search: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7" cy="7" r="4" />
      <path d="M10 10L13 13" />
    </svg>
  ),
  plus: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  ),
  more: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3.5" cy="8" r="1.1" />
      <circle cx="8" cy="8" r="1.1" />
      <circle cx="12.5" cy="8" r="1.1" />
    </svg>
  ),
  gear: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2.2v1.5M8 12.3v1.5M13.8 8h-1.5M3.7 8H2.2M12.1 3.9l-1.05 1.05M4.95 11.05L3.9 12.1M12.1 12.1l-1.05-1.05M4.95 4.95L3.9 3.9" />
    </svg>
  ),
  sun: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="2.4" />
      <path d="M8 2.2v1.5M8 12.3v1.5M13.8 8h-1.5M3.7 8H2.2M12.1 3.9l-1.05 1.05M4.95 11.05L3.9 12.1M12.1 12.1l-1.05-1.05M4.95 4.95L3.9 3.9" />
    </svg>
  ),
  moon: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M13 9.2A5.2 5.2 0 0 1 6.8 3a5.5 5.5 0 1 0 6.2 6.2Z" />
    </svg>
  ),
  close: (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M3 3l6 6M9 3l-6 6" />
    </svg>
  ),
  clock: (
    <svg
      className="ico"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="5.8" />
      <path d="M8 4.6V8l2.2 1.4" />
    </svg>
  ),
  panelRight: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    >
      <rect x="2" y="3.2" width="12" height="9.6" rx="1.6" />
      <path d="M10.2 3.2v9.6" />
    </svg>
  ),
  panelLeft: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    >
      <rect x="2" y="3.2" width="12" height="9.6" rx="1.6" />
      <path d="M5.8 3.2v9.6" />
    </svg>
  ),
  split: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
      <path d="M8 3.5v9" />
    </svg>
  ),
  eye: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.6 8s2.4-4.4 6.4-4.4S14.4 8 14.4 8 12 12.4 8 12.4 1.6 8 1.6 8Z" />
      <circle cx="8" cy="8" r="1.8" />
    </svg>
  ),
  pencil: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M11.5 2L14 4.5L5.4 13.1L2.5 13.5L2.9 10.6L11.5 2Z" />
      <path d="M10 3.5L12.5 6" />
    </svg>
  ),
  list: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M3 4.5h10M3 8h10M3 11.5h6" />
    </svg>
  )
}

/* ───── workspace tree ───── */
const WORKSPACE = [
  {
    id: 'w1',
    name: 'design-notes',
    open: true,
    type: 'folder',
    children: [
      {
        id: 'f1a',
        name: 'inbox',
        type: 'folder',
        open: true,
        children: [
          { id: 'doc1', name: '2026-04 weekly.md', type: 'md' },
          { id: 'doc2', name: 'editor-spec.md', type: 'md', active: true, modified: true },
          { id: 'doc3', name: 'meeting-2026-04-19.md', type: 'md' }
        ]
      },
      {
        id: 'f1b',
        name: 'projects',
        type: 'folder',
        open: true,
        children: [
          { id: 'doc4', name: 'markflow-roadmap.md', type: 'md', modified: true },
          { id: 'doc5', name: 'theme-tokens.md', type: 'md' },
          {
            id: 'f1b1',
            name: 'archive',
            type: 'folder',
            open: false,
            children: [{ id: 'doc6', name: '2025-q4-retro.md', type: 'md' }]
          }
        ]
      },
      {
        id: 'f1c',
        name: 'reading',
        type: 'folder',
        open: false,
        children: [{ id: 'doc7', name: 'shape-up.md', type: 'md' }]
      },
      { id: 'doc8', name: 'README.md', type: 'md' }
    ]
  },
  {
    id: 'w2',
    name: 'secuware-docs',
    open: false,
    type: 'folder',
    children: [{ id: 'doc9', name: 'overview.md', type: 'md' }]
  }
]

const RECENT = [
  { id: 'doc2', name: 'editor-spec.md', path: 'design-notes/inbox', when: '방금 전' },
  { id: 'doc4', name: 'markflow-roadmap.md', path: 'design-notes/projects', when: '3분 전' },
  { id: 'doc1', name: '2026-04 weekly.md', path: 'design-notes/inbox', when: '1시간 전' },
  { id: 'doc5', name: 'theme-tokens.md', path: 'design-notes/projects', when: '어제' },
  { id: 'doc8', name: 'README.md', path: 'design-notes', when: '2일 전' }
]

const OPEN_TABS = [
  { id: 'doc1', name: '2026-04 weekly.md', modified: false },
  { id: 'doc2', name: 'editor-spec.md', modified: true, active: true },
  { id: 'doc4', name: 'markflow-roadmap.md', modified: true },
  { id: 'doc5', name: 'theme-tokens.md', modified: false }
]

/* ───── editor source (the "raw markdown" we render with syntax highlight) ─── */
/* Each entry is one rendered line in the code view. */
const EDITOR_LINES = [
  { t: 'front', v: '---' },
  { t: 'front', v: 'title: Markflow — Editor Spec' },
  { t: 'front', v: 'author: secuware/design' },
  { t: 'front', v: 'updated: 2026-04-22' },
  { t: 'front', v: '---' },
  { t: 'blank', v: '' },
  { t: 'h1', v: '# Markflow Editor & Viewer' },
  { t: 'blank', v: '' },
  {
    t: 'p',
    v: 'A focused, **keyboard‑first** markdown workspace for designers and engineers who live in plain text.'
  },
  { t: 'blank', v: '' },
  { t: 'h2', v: '## Goals' },
  { t: 'blank', v: '' },
  { t: 'li', v: '- Render markdown faithfully without visual noise' },
  { t: 'li', v: '- Provide *split editor / preview* with synchronized scroll' },
  { t: 'li', v: '- Feel native on macOS, Windows and Linux' },
  { t: 'li', v: '- Stay calm in both [light](#light) and [dark](#dark) themes' },
  { t: 'blank', v: '' },
  { t: 'h2', v: '## Layout' },
  { t: 'blank', v: '' },
  {
    t: 'p',
    v: 'Three resizable columns plus an optional TOC rail. Anything not earning its place gets cut.'
  },
  { t: 'blank', v: '' },
  { t: 'fence-o', v: '```ts' },
  { t: 'code', v: 'type Pane = "sidebar" | "editor" | "preview" | "toc";' },
  { t: 'code', v: '' },
  { t: 'code', v: 'export const layout: Record<Pane, number> = {' },
  { t: 'code', v: '  sidebar: 240,   // resizable, min 160' },
  { t: 'code', v: '  editor:  560,   // grows to fill' },
  { t: 'code', v: '  preview: 560,   // grows to fill' },
  { t: 'code', v: '  toc:     220,   // optional' },
  { t: 'code', v: '};' },
  { t: 'fence-c', v: '```' },
  { t: 'blank', v: '' },
  { t: 'h3', v: '### Shortcuts' },
  { t: 'blank', v: '' },
  { t: 'p', v: 'Use `⌘P` to jump to a file, `⌘\\` to toggle the sidebar, `⌘/` to comment.' },
  { t: 'blank', v: '' },
  { t: 'quote', v: '> **Tip:** Drop a folder onto the sidebar to add it as a workspace.' },
  { t: 'blank', v: '' },
  { t: 'h2', v: '## Open questions' },
  { t: 'blank', v: '' },
  { t: 'li', v: '- [x] Decide on monospace pairing — *JetBrains Mono*' },
  { t: 'li', v: '- [ ] Wire up Monaco for inline syntax tokens' },
  { t: 'li', v: '- [ ] Auto-save debounce (proposed: 800ms)' }
]

/* ───── preview content (renders the doc above as styled HTML) ───── */
function PreviewBody() {
  return (
    <div className="md-doc">
      <h1 id="markflow-editor--viewer">Markflow Editor &amp; Viewer</h1>
      <p>
        A focused, <strong>keyboard-first</strong> markdown workspace for designers and engineers
        who live in plain text.
      </p>

      <h2 id="goals">Goals</h2>
      <ul>
        <li>Render markdown faithfully without visual noise</li>
        <li>
          Provide <em>split editor / preview</em> with synchronized scroll
        </li>
        <li>Feel native on macOS, Windows and Linux</li>
        <li>
          Stay calm in both <a href="#layout">light</a> and <a href="#layout">dark</a> themes
        </li>
      </ul>

      <h2 id="layout">Layout</h2>
      <p>
        Three resizable columns plus an optional TOC rail. Anything not earning its place gets cut.
      </p>

      <pre>
        <span className="pre-lang">TypeScript</span>
        <code>
          {`type Pane = "sidebar" | "editor" | "preview" | "toc";

export const layout: Record<Pane, number> = {
  sidebar: 240,   // resizable, min 160
  editor:  560,   // grows to fill
  preview: 560,   // grows to fill
  toc:     220,   // optional
};`}
        </code>
      </pre>

      <h3 id="shortcuts">Shortcuts</h3>
      <p>
        Use <code>⌘P</code> to jump to a file, <code>⌘\</code> to toggle the sidebar,{' '}
        <code>⌘/</code> to comment.
      </p>

      <blockquote className="callout">
        <div className="ctitle">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M8 5v3.5M8 11h.01"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          Tip
        </div>
        Drop a folder onto the sidebar to add it as a workspace.
      </blockquote>

      <h3 id="key-bindings">Key bindings</h3>
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Mac</th>
            <th>Windows / Linux</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Quick open</td>
            <td>
              <code>⌘ P</code>
            </td>
            <td>
              <code>Ctrl P</code>
            </td>
          </tr>
          <tr>
            <td>Toggle sidebar</td>
            <td>
              <code>⌘ \</code>
            </td>
            <td>
              <code>Ctrl \</code>
            </td>
          </tr>
          <tr>
            <td>Toggle preview</td>
            <td>
              <code>⌘ ⇧ P</code>
            </td>
            <td>
              <code>Ctrl Shift P</code>
            </td>
          </tr>
          <tr>
            <td>Save</td>
            <td>
              <code>⌘ S</code>
            </td>
            <td>
              <code>Ctrl S</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h3 id="image">Visual reference</h3>
      <div className="img-cap">screenshots/main-layout.png</div>

      <h2 id="open-questions">Open questions</h2>
      <ul>
        <li className="task-li">
          <input type="checkbox" defaultChecked readOnly />
          <span>
            Decide on monospace pairing — <em>JetBrains Mono</em>
          </span>
        </li>
        <li className="task-li">
          <input type="checkbox" readOnly />
          <span>Wire up Monaco for inline syntax tokens</span>
        </li>
        <li className="task-li">
          <input type="checkbox" readOnly />
          <span>Auto-save debounce (proposed: 800ms)</span>
        </li>
      </ul>

      <hr />
      <p style={{ color: 'var(--fg-tertiary)', fontSize: 12.5 }}>
        Last updated 2026-04-22 · 1,284 words · ~6 min read
      </p>
    </div>
  )
}

/* ───── table of contents (synced to the preview headings) ───── */
const TOC = [
  { id: 'markflow-editor--viewer', label: 'Markflow Editor & Viewer', level: 1 },
  { id: 'goals', label: 'Goals', level: 2 },
  { id: 'layout', label: 'Layout', level: 2 },
  { id: 'shortcuts', label: 'Shortcuts', level: 3 },
  { id: 'key-bindings', label: 'Key bindings', level: 3 },
  { id: 'image', label: 'Visual reference', level: 3 },
  { id: 'open-questions', label: 'Open questions', level: 2 }
]

/* ───── menu bar dropdowns ───── */
const MENUS = {
  File: [
    { label: '새 파일', kbd: '⌘ N', action: 'newFile' },
    { label: '새 창', kbd: '⌘ ⇧ N' },
    { sep: true },
    { label: '파일 열기…', kbd: '⌘ O' },
    { label: '폴더 열기…', kbd: '⌘ ⇧ O' },
    { label: '최근 항목 열기', submenu: true },
    { sep: true },
    { label: '저장', kbd: '⌘ S' },
    { label: '다른 이름으로 저장…', kbd: '⌘ ⇧ S' },
    { label: '모두 저장', kbd: '⌘ ⌥ S' },
    { sep: true },
    { label: '내보내기', submenu: true },
    { sep: true },
    { label: '닫기', kbd: '⌘ W' },
    { label: '창 닫기', kbd: '⌘ ⇧ W' }
  ],
  Edit: [
    { label: '실행 취소', kbd: '⌘ Z' },
    { label: '다시 실행', kbd: '⌘ ⇧ Z' },
    { sep: true },
    { label: '잘라내기', kbd: '⌘ X' },
    { label: '복사', kbd: '⌘ C' },
    { label: '붙여넣기', kbd: '⌘ V' },
    { sep: true },
    { label: '찾기', kbd: '⌘ F' },
    { label: '바꾸기', kbd: '⌘ ⌥ F' },
    { label: '파일에서 찾기…', kbd: '⌘ ⇧ F' },
    { sep: true },
    { label: '서식 지우기' },
    { label: '서식 정리', kbd: '⌘ ⇧ I' }
  ],
  Selection: [
    { label: '모두 선택', kbd: '⌘ A' },
    { label: '줄 확장', kbd: '⌘ L' },
    { sep: true },
    { label: '위에 커서 추가', kbd: '⌘ ⌥ ↑' },
    { label: '아래에 커서 추가', kbd: '⌘ ⌥ ↓' },
    { label: '다음 일치 추가', kbd: '⌘ D' },
    { sep: true },
    { label: '대소문자 전환' },
    { label: '들여쓰기', kbd: '⌘ ]' },
    { label: '내어쓰기', kbd: '⌘ [' }
  ],
  View: [
    { label: '명령어 팔레트…', kbd: '⌘ P', action: 'palette' },
    { sep: true },
    { label: '사이드바 표시', kbd: '⌘ \\', action: 'toggleSidebar', checkable: true },
    { label: '미리보기 표시', kbd: '⌘ ⇧ P', action: 'togglePreview', checkable: true },
    { label: '목차(TOC) 표시', kbd: '⌘ ⇧ L', action: 'toggleToc', checkable: true },
    { label: '미니맵 표시', action: 'toggleMinimap', checkable: true },
    { sep: true },
    { label: '확대', kbd: '⌘ +' },
    { label: '축소', kbd: '⌘ -' },
    { label: '기본 크기로', kbd: '⌘ 0' },
    { sep: true },
    { label: '전체화면', kbd: '⌃ ⌘ F' }
  ],
  Go: [
    { label: '파일로 이동…', kbd: '⌘ P' },
    { label: '줄로 이동…', kbd: '⌃ G' },
    { label: '심볼로 이동…', kbd: '⌘ ⇧ O' },
    { sep: true },
    { label: '뒤로', kbd: '⌃ -' },
    { label: '앞으로', kbd: '⌃ ⇧ -' },
    { sep: true },
    { label: '다음 변경', kbd: '⌥ F5' },
    { label: '이전 변경', kbd: '⌥ ⇧ F5' }
  ],
  Help: [
    { label: '시작 화면' },
    { label: '단축키 모음', kbd: '⌘ K ⌘ S' },
    { sep: true },
    { label: '문서' },
    { label: '릴리스 노트' },
    { sep: true },
    { label: '업데이트 확인…' },
    { label: 'Markflow 정보' }
  ]
}

const COMMANDS = [
  { ico: 'pencil', label: 'New file', kbd: '⌘ N' },
  { ico: 'folder', label: 'Add folder to workspace', kbd: '⌘ ⇧ O' },
  { ico: 'search', label: 'Find in files…', kbd: '⌘ ⇧ F' },
  { ico: 'eye', label: 'Toggle preview', kbd: '⌘ ⇧ P' },
  { ico: 'list', label: 'Toggle outline', kbd: '⌘ ⇧ L' },
  { ico: 'moon', label: 'Toggle dark mode', kbd: '⌘ ⇧ D' },
  { ico: 'gear', label: 'Open settings', kbd: '⌘ ,' }
]

Object.assign(window, {
  ICON,
  WORKSPACE,
  RECENT,
  OPEN_TABS,
  EDITOR_LINES,
  PreviewBody,
  TOC,
  COMMANDS,
  MENUS
})
