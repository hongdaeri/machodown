import { useEffect } from 'react'
import { useEditorStore } from '../stores/editorStore'
import { useUiStore } from '../stores/uiStore'
import type { TocItem } from '../stores/types'

function slugify(text: string): string {
  return encodeURIComponent(String(text).trim().toLowerCase().replace(/\s+/g, '-'))
}

function extractToc(markdown: string): TocItem[] {
  const toc: TocItem[] = []
  for (const line of markdown.split('\n')) {
    const m = /^(#{1,3})\s+(.+)$/.exec(line)
    if (m) {
      const level = m[1].length as 1 | 2 | 3
      const text = m[2].trim()
      toc.push({ level, text, slug: slugify(text) })
    }
  }
  return toc
}

export function useTocExtractor(): void {
  const viewMode = useUiStore((s) => s.viewMode)
  const activeTabId = useEditorStore((s) => s.activeTabId)
  const content = useEditorStore((s) => s.tabs.find((t) => t.id === activeTabId)?.content ?? '')
  const setToc = useUiStore((s) => s.setToc)

  useEffect(() => {
    if (viewMode !== 'editor') return
    setToc(extractToc(content))
  }, [content, viewMode, setToc])
}
