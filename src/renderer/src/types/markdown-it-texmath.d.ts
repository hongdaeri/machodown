declare module 'markdown-it-texmath' {
  import type MarkdownIt from 'markdown-it'

  interface TexmathOptions {
    engine?: { renderToString: (tex: string, opts?: Record<string, unknown>) => string }
    delimiters?: string | string[]
    katexOptions?: Record<string, unknown>
    outerSpace?: boolean
    macros?: Record<string, string>
  }

  function texmath(md: MarkdownIt, options?: TexmathOptions): void
  export = texmath
}
