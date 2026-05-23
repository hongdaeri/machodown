<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# migrations

## Purpose
앱 업데이트 시 사용자 설정 및 데이터 스키마를 이전 버전에서 현재 버전으로 마이그레이션하는 로직.

## Key Files

| File | Description |
|------|-------------|
| `MigrationRunner.ts` / `MigrationRunner.js` | 마이그레이션 실행 엔진 — 버전별 마이그레이션을 순서대로 실행 |
| `workspacesMigrations.ts` / `workspacesMigrations.js` | 워크스페이스 데이터 마이그레이션 스텝 정의 |

## For AI Agents

### Working In This Directory
- **`.ts`와 `.js` 쌍이 존재** — 반드시 동시에 수정
- 새 마이그레이션 추가 시 버전 번호와 함께 `workspacesMigrations.ts`에 스텝을 추가하고 순서를 보장할 것
- 마이그레이션은 멱등(idempotent)해야 함 — 동일 마이그레이션이 두 번 실행되어도 안전

<!-- MANUAL: -->
