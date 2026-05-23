<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# __tests__

## Purpose
Vitest 단위 테스트 모음. renderer의 훅, 유틸리티, 컴포넌트를 독립적으로 테스트한다.

## For AI Agents

### Working In This Directory
- 테스트 실행: `npm test` (프로젝트 루트에서)
- 테스트 파일명: `*.test.ts` 또는 `*.spec.ts`
- `vitest.config.ts`의 설정을 따름 — jsdom 환경에서 실행
- `window.api` 등 Electron 의존성은 `vi.mock()`으로 목(mock) 처리
- AAA 패턴 (Arrange-Act-Assert) 사용

### Testing Requirements
- 새 기능 추가 시 이 디렉토리에 대응하는 테스트 파일 추가
- 커버리지 80% 이상 유지 목표

<!-- MANUAL: -->
