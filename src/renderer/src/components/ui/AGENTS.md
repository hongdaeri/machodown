<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# ui

## Purpose
범용 원자 UI 컴포넌트. 도메인 로직 없이 재사용 가능한 시각적 원시 요소.

## Key Files

| File | Description |
|------|-------------|
| `ToastStack.tsx` | 화면 하단에 쌓이는 토스트 알림 스택. `uiStore`의 토스트 목록을 구독해 렌더링 |

## For AI Agents

### Working In This Directory
- 이 디렉토리의 컴포넌트는 도메인/비즈니스 로직을 포함하면 안 됨 — 순수 표현 계층
- 새 범용 UI 요소(Button, Badge, Tooltip 등) 추가 시 이 디렉토리에 배치
- `ToastStack`은 `uiStore.addToast()`/`uiStore.removeToast()`와 연동됨

## Dependencies

### Internal
- `src/stores/uiStore` — 토스트 메시지 목록

<!-- MANUAL: -->
