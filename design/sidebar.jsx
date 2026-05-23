/* Sidebar: workspace tree + recent + search */

function TreeNode({ node, depth, openIds, selectedId, onToggle, onSelect }) {
  const { ICON } = window
  const isFolder = node.type === 'folder'
  const isOpen = openIds.has(node.id)
  const isSelected = selectedId === node.id

  return (
    <>
      <div
        className={'tree-row' + (isSelected ? ' selected' : '') + (isFolder ? ' folder' : '')}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => (isFolder ? onToggle(node.id) : onSelect(node.id))}
        title={node.name}
      >
        {isFolder ? (
          <span className={'chev' + (isOpen ? ' open' : '')}>{ICON.chevron}</span>
        ) : (
          <span className="chev" style={{ opacity: 0 }}>
            {ICON.chevron}
          </span>
        )}
        {isFolder ? ICON.folder(isOpen) : node.name.endsWith('.md') ? ICON.md : ICON.file}
        <span className="lbl">{node.name}</span>
        {node.modified && <span className="dot-mod" title="저장되지 않음"></span>}
      </div>
      {isFolder &&
        isOpen &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            openIds={openIds}
            selectedId={selectedId}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </>
  )
}

function Sidebar({ width, selectedId, onSelect, onOpenSettings, theme, onToggleTheme }) {
  const { WORKSPACE, RECENT, ICON } = window
  const [openIds, setOpenIds] = React.useState(() => {
    const initial = new Set()
    const walk = (nodes) =>
      nodes.forEach((n) => {
        if (n.type === 'folder' && n.open) initial.add(n.id)
        if (n.children) walk(n.children)
      })
    walk(WORKSPACE)
    return initial
  })
  const [query, setQuery] = React.useState('')

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="sidebar" style={{ width }}>
      <div className="sidebar-header">
        <span>탐색기</span>
        <div className="actions">
          <button className="icon-btn" aria-label="새 파일">
            {ICON.plus}
          </button>
          <button className="icon-btn" aria-label="더보기">
            {ICON.more}
          </button>
        </div>
      </div>

      <div className="search">
        {ICON.search}
        <input
          type="text"
          placeholder="파일 · 내용 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="검색"
        />
      </div>

      <div className="tree">
        {WORKSPACE.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            openIds={openIds}
            selectedId={selectedId}
            onToggle={toggle}
            onSelect={onSelect}
          />
        ))}

        <div className="sb-section-title">최근 파일</div>
        {RECENT.map((r) => (
          <div
            key={r.id + '-r'}
            className={'tree-row' + (selectedId === r.id ? ' selected' : '')}
            onClick={() => onSelect(r.id)}
            title={r.path + '/' + r.name}
          >
            <span className="chev" style={{ opacity: 0 }}>
              {ICON.chevron}
            </span>
            {ICON.md}
            <span className="lbl">{r.name}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--fg-tertiary)' }}>
              {r.when}
            </span>
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'inline-block'
            }}
          ></span>
          동기화됨
        </span>
        <span className="grow"></span>
        <button className="icon-btn" aria-label="테마 전환" onClick={onToggleTheme}>
          {theme === 'dark' ? ICON.sun : ICON.moon}
        </button>
        <button className="icon-btn" aria-label="설정" onClick={onOpenSettings}>
          {ICON.gear}
        </button>
      </div>
    </div>
  )
}

Object.assign(window, { Sidebar })
