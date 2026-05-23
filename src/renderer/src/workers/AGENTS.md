<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# workers

## Purpose
Web Worker 파일. 마크다운 파싱을 메인 스레드에서 분리해 에디터 렌더링 성능을 유지한다.

## Key Files

| File | Description |
|------|-------------|
| `markdown.worker.ts` | `markdown-it` + `katex`를 사용한 마크다운→HTML 변환. 메시지로 입력받아 HTML 결과 반환 |

## For AI Agents

### Working In This Directory
- Worker는 DOM API, `window`, `document` 접근 불가 — 순수 계산만 수행
- Vite의 `?worker` 쿼리로 import: `import MarkdownWorker from './workers/markdown.worker?worker'`
- 파싱 설정(플러그인, KaTeX 옵션) 변경 시 이 파일을 수정

## Dependencies

### External
- `markdown-it` — 마크다운 파싱
- `katex` — LaTeX 수식 렌더링
- `highlight.js` 또는 내장 코드 하이라이팅

<!-- MANUAL: -->
