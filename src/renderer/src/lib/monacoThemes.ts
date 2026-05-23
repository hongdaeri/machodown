import type { Monaco } from '@monaco-editor/react'

const ACCENT_HEX: Record<
  string,
  { light: string; dark: string; lightSel: string; darkSel: string }
> = {
  'macho-claude': { light: 'D97757', dark: 'E8957A', lightSel: '#fde8df', darkSel: '#3d1a0d' },
  blue: { light: '2563eb', dark: '60a5fa', lightSel: '#dbeafe', darkSel: '#1e3a5f' },
  purple: { light: '7c3aed', dark: 'a78bfa', lightSel: '#ede9fe', darkSel: '#2e1065' },
  green: { light: '16a34a', dark: '4ade80', lightSel: '#dcfce7', darkSel: '#052e16' },
  orange: { light: 'ea580c', dark: 'fb923c', lightSel: '#ffedd5', darkSel: '#431407' },
  pink: { light: 'db2777', dark: 'f472b6', lightSel: '#fce7f3', darkSel: '#500724' },
  teal: { light: '0d9488', dark: '2dd4bf', lightSel: '#ccfbf1', darkSel: '#042f2e' }
}

export function registerMachodownThemes(monaco: Monaco, accentKey = 'blue'): void {
  const a = ACCENT_HEX[accentKey] ?? ACCENT_HEX.blue

  monaco.editor.defineTheme('machodown-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: '1a1a1a', background: 'ffffff' },
      { token: 'markup.heading', foreground: a.light, fontStyle: 'bold' },
      { token: 'markup.bold', foreground: '1a1a1a', fontStyle: 'bold' },
      { token: 'markup.italic', foreground: '5a5a55', fontStyle: 'italic' },
      { token: 'markup.underline.link', foreground: a.light },
      { token: 'markup.raw', foreground: 'c2410c', background: 'f3f3f0' },
      { token: 'markup.fenced_code', foreground: 'c2410c' },
      { token: 'markup.quote', foreground: '8a8a83', fontStyle: 'italic' },
      { token: 'comment', foreground: '8a8a83' },
      { token: 'string', foreground: '5a5a55' },
      { token: 'keyword', foreground: a.light },
      { token: 'delimiter', foreground: 'b8b8b0' },
      { token: 'punctuation', foreground: 'b8b8b0' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1a1a1a',
      'editor.lineHighlightBackground': '#f7f7f5',
      'editor.selectionBackground': a.lightSel,
      'editor.inactiveSelectionBackground': '#e3e3df',
      'editorCursor.foreground': '#' + a.light,
      'editorLineNumber.foreground': '#b8b8b0',
      'editorLineNumber.activeForeground': '#5a5a55',
      'editorIndentGuide.background': '#e6e6e0',
      'editorIndentGuide.activeBackground': '#d4d4ce',
      'editorGutter.background': '#ffffff',
      'scrollbar.shadow': '#00000010',
      'scrollbarSlider.background': '#e6e6e080',
      'scrollbarSlider.hoverBackground': '#d4d4ce80',
      'scrollbarSlider.activeBackground': '#b8b8b080'
    }
  })

  monaco.editor.defineTheme('machodown-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e6e7ea', background: '15171a' },
      { token: 'markup.heading', foreground: a.dark, fontStyle: 'bold' },
      { token: 'markup.bold', foreground: 'e6e7ea', fontStyle: 'bold' },
      { token: 'markup.italic', foreground: 'a8acb4', fontStyle: 'italic' },
      { token: 'markup.underline.link', foreground: a.dark },
      { token: 'markup.raw', foreground: 'fb923c', background: '1f2126' },
      { token: 'markup.fenced_code', foreground: 'fb923c' },
      { token: 'markup.quote', foreground: '6e7480', fontStyle: 'italic' },
      { token: 'comment', foreground: '6e7480' },
      { token: 'string', foreground: 'a8acb4' },
      { token: 'keyword', foreground: a.dark },
      { token: 'delimiter', foreground: '4a4f58' },
      { token: 'punctuation', foreground: '4a4f58' }
    ],
    colors: {
      'editor.background': '#15171a',
      'editor.foreground': '#e6e7ea',
      'editor.lineHighlightBackground': '#1b1d21',
      'editor.selectionBackground': a.darkSel,
      'editor.inactiveSelectionBackground': '#353a42',
      'editorCursor.foreground': '#' + a.dark,
      'editorLineNumber.foreground': '#4a4f58',
      'editorLineNumber.activeForeground': '#a8acb4',
      'editorIndentGuide.background': '#2a2d33',
      'editorIndentGuide.activeBackground': '#383c44',
      'editorGutter.background': '#15171a',
      'scrollbar.shadow': '#00000030',
      'scrollbarSlider.background': '#2a2d3380',
      'scrollbarSlider.hoverBackground': '#383c4480',
      'scrollbarSlider.activeBackground': '#4a4f5880'
    }
  })
}
