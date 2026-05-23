<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# shortcuts

## Purpose
키보드 단축키 레지스트리. 앱의 모든 전역 단축키 바인딩을 한 곳에서 정의한다.

## Key Files

| File | Description |
|------|-------------|
| `registry.ts` | 단축키 → 액션 매핑 테이블. `useKeyboardShortcuts` 훅이 이를 참조해 이벤트 리스너 등록 |

## For AI Agents

### Working In This Directory
- 새 단축키 추가 시 `registry.ts`에만 추가 — 이벤트 리스너 직접 추가 금지
- `Cmd/Ctrl` 크로스 플랫폼 처리는 레지스트리 내부에서 `metaKey`/`ctrlKey` 조건으로 처리
- 단축키 충돌 여부를 확인한 뒤 등록 (특히 Monaco 에디터 기본 단축키와의 충돌)

## Dependencies

### Internal
- `src/hooks/useKeyboardShortcuts.ts` — 레지스트리를 소비해 이벤트 리스너 등록

<!-- MANUAL: -->
