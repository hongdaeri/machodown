<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# scripts

## Purpose
개발 및 빌드 보조 스크립트. 앱 코드와 무관하게 독립적으로 실행되는 유틸리티들이다.

## Key Files

| File | Description |
|------|-------------|
| `dev-rename.mjs` | 개발 환경에서 앱 이름 변경 유틸리티 (ESM 모듈) |
| `screenshot.ts` | 스크린샷 자동 캡처 스크립트 (docs/screenshots/ 생성용) |

## For AI Agents

### Working In This Directory
- 스크립트는 프로덕션 번들에 포함되지 않음 — package.json의 빌드 타겟에서 제외됨
- `dev-rename.mjs`는 `.mjs` 확장자를 사용하는 ESM 모듈 — `require()` 대신 `import` 사용
- `screenshot.ts`는 ts-node 또는 `npx tsx`로 직접 실행

<!-- MANUAL: -->
