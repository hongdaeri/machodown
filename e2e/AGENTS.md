<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# e2e

## Purpose
Playwright 기반 E2E 테스트 스펙. 실제 Electron 앱을 실행해서 사용자 시나리오를 자동으로 검증한다.

## Key Files

| File | Description |
|------|-------------|
| `s1-new-file-save.spec.ts` | 새 파일 생성 및 저장 시나리오 |
| `s2-existing-file-edit.spec.ts` | 기존 파일 열기 및 편집 시나리오 |
| `s5-external-file-change.spec.ts` | 외부 편집기에서 파일 변경 시 충돌 감지 시나리오 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `helpers/` | `launch.ts` — Electron 앱 실행 헬퍼 유틸리티 |

## For AI Agents

### Working In This Directory
- E2E 테스트는 실제 빌드된 앱을 대상으로 실행 — 반드시 `npm run build` 후 실행
- 테스트 실행: `npm run test:e2e`
- 스펙 번호(s1, s2, s5)는 시나리오 ID로 순서가 비연속적일 수 있음
- `helpers/launch.ts`는 Electron 프로세스 시작/종료를 관리하므로 모든 스펙이 공유

### Testing Requirements
- 새 시나리오 추가 시 `helpers/launch.ts`의 앱 실행 함수를 재사용할 것
- 테스트 후 파일 시스템 사이드이펙트(생성된 파일 등)를 정리하는 afterEach 훅 필수

<!-- MANUAL: -->
