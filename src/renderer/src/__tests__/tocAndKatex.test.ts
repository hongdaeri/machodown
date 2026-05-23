import { describe, it, expect, beforeEach } from 'vitest'
import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import type { Token } from 'markdown-it'

interface TocItem {
  level: 1 | 2 | 3
  text: string
  slug: string
}

function buildMd(enableKatex: boolean): { md: MarkdownIt; getToc: () => TocItem[] } {
  let currentToc: TocItem[] = []

  const md = new MarkdownIt({ html: false, linkify: true, typographer: true }).use(
    markdownItAnchor,
    {
      permalink: markdownItAnchor.permalink.headerLink(),
      callback: (token: Token, { slug, title }: { slug: string; title: string }) => {
        const level = parseInt(token.tag.slice(1), 10)
        if (level >= 1 && level <= 3) {
          currentToc.push({ level: level as 1 | 2 | 3, text: title, slug })
        }
      }
    }
  )

  if (enableKatex) {
    md.use(texmath, { engine: katex, delimiters: 'dollars', katexOptions: { output: 'html' } })
  }

  const getToc = (): TocItem[] => currentToc
  const originalRender = md.render.bind(md)
  md.render = (src: string): string => {
    currentToc = []
    return originalRender(src)
  }

  return { md, getToc }
}

describe('TOC 추출', () => {
  let md: MarkdownIt
  let getToc: () => TocItem[]

  beforeEach(() => {
    const built = buildMd(false)
    md = built.md
    getToc = built.getToc
  })

  it('H1~H3 헤딩을 TocItem으로 추출한다', () => {
    md.render('# 제목1\n## 소제목2\n### 세부항목3')
    const toc = getToc()
    expect(toc).toHaveLength(3)
    expect(toc[0]).toMatchObject({ level: 1, text: '제목1' })
    expect(toc[1]).toMatchObject({ level: 2, text: '소제목2' })
    expect(toc[2]).toMatchObject({ level: 3, text: '세부항목3' })
  })

  it('H4 이상은 TOC에 포함하지 않는다', () => {
    md.render('# H1\n## H2\n### H3\n#### H4\n##### H5')
    const toc = getToc()
    expect(toc).toHaveLength(3)
    expect(toc.map((t) => t.level)).toEqual([1, 2, 3])
  })

  it('slug는 헤딩 텍스트 기반으로 생성된다', () => {
    md.render('# Hello World')
    const toc = getToc()
    expect(toc[0].slug).toBe('hello-world')
  })

  it('동일 텍스트 헤딩은 고유 slug를 가진다', () => {
    md.render('# Same\n## Same\n### Same')
    const toc = getToc()
    const slugs = toc.map((t) => t.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('헤딩 없는 마크다운은 빈 TOC 반환', () => {
    md.render('단순 텍스트\n- 목록 아이템\n> 인용구')
    expect(getToc()).toHaveLength(0)
  })

  it('렌더 호출 시마다 TOC가 초기화된다', () => {
    md.render('# 첫번째')
    expect(getToc()).toHaveLength(1)
    md.render('## 두번째\n### 세번째')
    const toc = getToc()
    expect(toc).toHaveLength(2)
    expect(toc[0].level).toBe(2)
  })
})

describe('KaTeX 수식 렌더링', () => {
  let md: MarkdownIt

  beforeEach(() => {
    md = buildMd(true).md
  })

  it('인라인 수식 $...$를 HTML로 렌더링한다', () => {
    const html = md.render('수식: $E = mc^2$')
    expect(html).toContain('katex')
    expect(html).not.toContain('$E = mc^2$')
  })

  it('블록 수식 $$...$$를 HTML로 렌더링한다', () => {
    const html = md.render('$$\n\\int_0^\\infty e^{-x} dx = 1\n$$')
    expect(html).toContain('katex')
    expect(html).toContain('katex-display')
  })

  it('KaTeX 비활성 시 수식을 그대로 출력한다', () => {
    const noKatexMd = buildMd(false).md
    const html = noKatexMd.render('$E = mc^2$')
    expect(html).not.toContain('katex')
    expect(html).toContain('$E = mc^2$')
  })

  it('잘못된 수식도 에러 없이 렌더링된다', () => {
    expect(() => md.render('$\\invalid{')).not.toThrow()
  })
})
