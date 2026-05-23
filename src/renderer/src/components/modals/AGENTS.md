<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# modals

## Purpose
오버레이 다이얼로그 및 모달 컴포넌트 15개. 설정 패널, 명령어 팔레트, 파일 충돌 해소, 업데이트 알림 등.

## Key Files

| File | Description |
|------|-------------|
| `CommandPalette.tsx` | `Cmd+K` 트리거 명령어 팔레트 — 퍼지 검색으로 액션 실행 |
| `SettingsModal.tsx` | 사용자 설정 다이얼로그 (테마, 자동저장 간격, 폰트 등) |
| `FileConflictModal.tsx` | 외부 변경 감지 시 충돌 해소 선택 다이얼로그 |
| `UpdateModal.tsx` | 자동 업데이트 가능 시 표시되는 업데이트 알림 모달 |
| `UnsavedChangesModal.tsx` | 미저장 변경사항 있는 탭 닫기 시 확인 다이얼로그 |

## For AI Agents

### Working In This Directory
- 모달 표시/숨김 상태는 `uiStore`의 `openModal`/`closeModal`로 관리
- 모달은 `React Portal`을 통해 `body`에 직접 렌더링하거나 `AppShell`의 상위에 배치
- 키보드 접근성: `Escape`로 닫기, 포커스 트랩(focus trap) 구현 필수
- 총 15개 모달이 있으므로 새 모달 추가 시 패턴 통일 (열림 상태, 애니메이션, 접근성)

## Dependencies

### Internal
- `src/stores/uiStore` — 모달 열림/닫힘 상태
- `src/hooks/useCommandPalette` — 명령어 팔레트 로직

<!-- MANUAL: -->
