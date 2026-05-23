import React, { useEffect, useRef, useState } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useEditorStore } from '../../stores/editorStore'
import { scrollPreviewToSlug } from '../editor/PreviewPane'
import type { TocItem } from '../../stores/types'

function findHeadingLine(content: string, level: number, text: string): number {
  const prefix = '#'.repeat(level) + ' '
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith(prefix) && line.slice(prefix.length).trim() === text) {
      return i + 1
    }
  }
  return 1
}

interface TocItemRowProps {
  item: TocItem
  isActive: boolean
  onClick: (item: TocItem) => void
}

function TocItemRow({ item, isActive, onClick }: TocItemRowProps): React.ReactElement {
  const levelClass = item.level >= 2 ? ` l${item.level}` : ''
  return (
    <div
      className={`toc-item${levelClass}${isActive ? ' active' : ''}`}
      title={item.text}
      onClick={() => onClick(item)}
    >
      {item.text}
    </div>
  )
}

export function TocPane(): React.ReactElement | null {
  const toc = useUiStore((s) => s.toc)
  const tocVisible = useUiStore((s) => s.tocVisible)
  const revealEditorLine = useUiStore((s) => s.revealEditorLine)
  const content = useEditorStore((s) => s.tabs.find((t) => t.id === s.activeTabId)?.content ?? '')

  const [activeSlug, setActiveSlug] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    const previewEl = document.querySelector('.preview')
    if (!previewEl || toc.length === 0) return

    const slugs = toc.map((t) => t.slug)
    const visibleSlugs = new Set<string>()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = entry.target.id
          if (entry.isIntersecting) {
            visibleSlugs.add(slug)
          } else {
            visibleSlugs.delete(slug)
          }
        }
        const firstVisible = slugs.find((s) => visibleSlugs.has(s))
        if (firstVisible) setActiveSlug(firstVisible)
      },
      { root: previewEl, threshold: 0 }
    )

    for (const slug of slugs) {
      const el = previewEl.querySelector(`#${CSS.escape(slug)}`)
      if (el) observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [toc])

  if (!tocVisible || toc.length === 0) return null

  const handleClick = (item: TocItem): void => {
    setActiveSlug(item.slug)
    scrollPreviewToSlug(item.slug)
    if (revealEditorLine) {
      const line = findHeadingLine(content, item.level, item.text)
      revealEditorLine(line)
    }
  }

  return (
    <div className="toc-pane">
      <div className="toc-head">
        <span>목차</span>
        <button
          className="icon-btn"
          aria-label="목차 닫기"
          onClick={() => useUiStore.getState().toggleToc()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="toc-list">
        {toc.map((item) => (
          <TocItemRow
            key={`${item.slug}-${item.level}`}
            item={item}
            isActive={activeSlug === item.slug}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  )
}
