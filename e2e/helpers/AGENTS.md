<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# helpers

## Purpose
E2E 테스트 공통 유틸리티. 모든 Playwright 스펙이 공유하는 Electron 앱 실행/종료 헬퍼를 제공한다.

## Key Files

| File | Description |
|------|-------------|
| `launch.ts` | Electron 앱 프로세스 시작 및 종료 헬퍼 함수 |

## For AI Agents

### Working In This Directory
- `launch.ts`는 `electronPath`와 앱 빌드 경로를 설정해 Playwright의 `_electron.launch()`를 래핑
- 모든 E2E 스펙의 `beforeAll`/`afterAll`에서 이 헬퍼를 사용해 앱 인스턴스를 공유

<!-- MANUAL: -->
