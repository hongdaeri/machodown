<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# editor

## Purpose
에디터의 핵심 두 패널 — Monaco Editor 편집창과 마크다운 실시간 프리뷰창.

## Key Files

| File | Description |
|------|-------------|
| `EditorPane.tsx` | Monaco Editor 래퍼 컴포넌트. 폰트, 테마, 언어(markdown) 설정. 편집 내용을 스토어와 동기화 |
| `PreviewPane.tsx` | 마크다운 HTML 렌더링 컴포넌트. `markdown.worker`에서 변환된 HTML을 `dangerouslySetInnerHTML`로 표시. KaTeX, 코드 하이라이팅 포함 |

## For AI Agents

### Working In This Directory
- `EditorPane`은 Monaco의 `onChange` 콜백으로 `editorStore`의 탭 내용 업데이트
- `PreviewPane`은 `dangerouslySetInnerHTML` 사용 — XSS 방지를 위해 HTML은 반드시 worker에서 sanitize된 결과만 사용
- 스크롤 동기화는 `useScrollSync` 훅을 통해 처리 — 이 컴포넌트에서 직접 구현 금지
- Monaco 에디터 옵션 변경 시 `EditorPane`의 `options` prop 참고

### Common Patterns
- Monaco 인스턴스 접근: `useRef`로 editor instance를 보관하고 `onMount` 콜백에서 설정

## Dependencies

### Internal
- `src/stores/editorStore` — 탭 내용 읽기/쓰기
- `src/workers/markdown.worker` — 비동기 마크다운→HTML 변환
- `src/hooks/useScrollSync` — 스크롤 동기화

### External
- `@monaco-editor/react` — Monaco Editor React 래퍼

<!-- MANUAL: -->
