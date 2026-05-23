import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import taskLists from 'markdown-it-task-lists'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from 'highlight.js'
import type { Token } from 'markdown-it'

export interface TocItem {
  level: 1 | 2 | 3
  text: string
  slug: string
}

interface RenderRequest {
  id: number
  markdown: string
  katexEnabled: boolean
}

interface RenderResponse {
  id: number
  html: string
  toc: TocItem[]
}

let currentToc: TocItem[] = []

const mdBase: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, lang): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        // fall through
      }
    }
    return `<pre class="hljs"><code>${mdBase.utils.escapeHtml(code)}</code></pre>`
  }
})
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    callback: (token: Token, { slug, title }: { slug: string; title: string }) => {
      const level = parseInt(token.tag.slice(1), 10)
      if (level >= 1 && level <= 3) {
        currentToc.push({ level: level as 1 | 2 | 3, text: title, slug })
      }
    }
  })
  .use(taskLists, { enabled: true })

const mdKatex: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, lang): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        // fall through
      }
    }
    return `<pre class="hljs"><code>${mdKatex.utils.escapeHtml(code)}</code></pre>`
  }
})
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    callback: (token: Token, { slug, title }: { slug: string; title: string }) => {
      const level = parseInt(token.tag.slice(1), 10)
      if (level >= 1 && level <= 3) {
        currentToc.push({ level: level as 1 | 2 | 3, text: title, slug })
      }
    }
  })
  .use(texmath, { engine: katex, delimiters: 'dollars', katexOptions: { output: 'html' } })
  .use(taskLists, { enabled: true })

self.addEventListener('message', (e: MessageEvent<RenderRequest>) => {
  const { id, markdown, katexEnabled } = e.data
  currentToc = []
  const md = katexEnabled ? mdKatex : mdBase
  const html = md.render(markdown)
  const toc = currentToc
  const response: RenderResponse = { id, html, toc }
  self.postMessage(response)
})
