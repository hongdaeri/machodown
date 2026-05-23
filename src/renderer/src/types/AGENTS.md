<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# types

## Purpose
renderer 전역에서 공유되는 TypeScript 타입 선언 파일. 도메인 모델과 공통 인터페이스를 정의한다.

## For AI Agents

### Working In This Directory
- 여러 파일에서 공유되는 타입만 이 디렉토리에 배치 — 단일 파일 전용 타입은 해당 파일 내부에 정의
- `src/preload/index.d.ts`의 `window.api` 타입과 중복 정의 주의
- 타입 파일은 `export` 전용 — 런타임 코드(함수, 클래스 인스턴스) 포함 금지

<!-- MANUAL: -->
