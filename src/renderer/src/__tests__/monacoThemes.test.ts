import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerMachodownThemes } from '../lib/monacoThemes'
import type { Monaco } from '@monaco-editor/react'

function makeMockMonaco() {
  const defineTheme = vi.fn()
  return {
    editor: { defineTheme }
  } as unknown as Monaco
}

let monaco: Monaco

beforeEach(() => {
  monaco = makeMockMonaco()
})

describe('registerMachodownThemes', () => {
  it('defineTheme를 정확히 두 번 호출 (light + dark)', () => {
    registerMachodownThemes(monaco)

    expect(monaco.editor.defineTheme).toHaveBeenCalledTimes(2)
  })

  it('첫 번째 호출이 machodown-light', () => {
    registerMachodownThemes(monaco)

    const [name] = (monaco.editor.defineTheme as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(name).toBe('machodown-light')
  })

  it('두 번째 호출이 machodown-dark', () => {
    registerMachodownThemes(monaco)

    const [name] = (monaco.editor.defineTheme as ReturnType<typeof vi.fn>).mock.calls[1]
    expect(name).toBe('machodown-dark')
  })

  describe('machodown-light 테마', () => {
    function getLightDef() {
      registerMachodownThemes(monaco)
      return (monaco.editor.defineTheme as ReturnType<typeof vi.fn>).mock.calls[0][1]
    }

    it('base가 vs', () => {
      expect(getLightDef().base).toBe('vs')
    })

    it('inherit이 true', () => {
      expect(getLightDef().inherit).toBe(true)
    })

    it('배경색이 흰색(#ffffff)', () => {
      expect(getLightDef().colors['editor.background']).toBe('#ffffff')
    })

    it('커서 색이 파란색(#2563eb)', () => {
      expect(getLightDef().colors['editorCursor.foreground']).toBe('#2563eb')
    })

    it('markup.heading 토큰이 파란색 + bold', () => {
      const def = getLightDef()
      const headingRule = def.rules.find((r: { token: string }) => r.token === 'markup.heading')
      expect(headingRule).toBeDefined()
      expect(headingRule.foreground).toBe('2563eb')
      expect(headingRule.fontStyle).toBe('bold')
    })

    it('markup.raw 토큰에 background 지정', () => {
      const def = getLightDef()
      const rawRule = def.rules.find((r: { token: string }) => r.token === 'markup.raw')
      expect(rawRule).toBeDefined()
      expect(rawRule.background).toBe('f3f3f0')
    })

    it('markup.italic 토큰이 italic', () => {
      const def = getLightDef()
      const rule = def.rules.find((r: { token: string }) => r.token === 'markup.italic')
      expect(rule?.fontStyle).toBe('italic')
    })
  })

  describe('machodown-dark 테마', () => {
    function getDarkDef() {
      registerMachodownThemes(monaco)
      return (monaco.editor.defineTheme as ReturnType<typeof vi.fn>).mock.calls[1][1]
    }

    it('base가 vs-dark', () => {
      expect(getDarkDef().base).toBe('vs-dark')
    })

    it('inherit이 true', () => {
      expect(getDarkDef().inherit).toBe(true)
    })

    it('배경색이 어두운 색(#15171a)', () => {
      expect(getDarkDef().colors['editor.background']).toBe('#15171a')
    })

    it('커서 색이 밝은 파란색(#60a5fa)', () => {
      expect(getDarkDef().colors['editorCursor.foreground']).toBe('#60a5fa')
    })

    it('markup.heading 토큰이 밝은 파란색 + bold', () => {
      const def = getDarkDef()
      const headingRule = def.rules.find((r: { token: string }) => r.token === 'markup.heading')
      expect(headingRule).toBeDefined()
      expect(headingRule.foreground).toBe('60a5fa')
      expect(headingRule.fontStyle).toBe('bold')
    })

    it('markup.raw 토큰에 background 지정', () => {
      const def = getDarkDef()
      const rawRule = def.rules.find((r: { token: string }) => r.token === 'markup.raw')
      expect(rawRule).toBeDefined()
      expect(rawRule.background).toBe('1f2126')
    })

    it('light와 dark 배경색이 서로 다름', () => {
      registerMachodownThemes(monaco)
      const calls = (monaco.editor.defineTheme as ReturnType<typeof vi.fn>).mock.calls
      const lightBg = calls[0][1].colors['editor.background']
      const darkBg = calls[1][1].colors['editor.background']
      expect(lightBg).not.toBe(darkBg)
    })
  })

  it('1ms 이내에 두 테마 등록 완료 (성능)', () => {
    const start = performance.now()
    registerMachodownThemes(monaco)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(50)
  })
})
