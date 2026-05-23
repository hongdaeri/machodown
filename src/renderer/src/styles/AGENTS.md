<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# styles

## Purpose
전역 CSS 파일. Tailwind CSS 기반 리셋, CSS 변수(테마 색상), 전역 스타일 정의.

## Key Files

| File | Description |
|------|-------------|
| `globals.css` | Tailwind `@base`/`@components`/`@utilities` directives, CSS 변수, 전역 리셋 |

## For AI Agents

### Working In This Directory
- 컴포넌트 고유 스타일은 `globals.css`가 아닌 컴포넌트 파일의 `className` prop으로 처리
- CSS 변수(`--color-*`, `--font-*`)는 다크/라이트 테마 전환에 사용됨 — 수정 시 양쪽 테마 확인
- Tailwind 커스텀 유틸리티는 `@layer utilities` 블록 내에 추가

<!-- MANUAL: -->
