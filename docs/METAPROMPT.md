# Markflow 자동 개발 메타프롬프트

> 이 파일을 Claude Code 세션 시작 시 전체 복사하여 붙여넣으세요.  
> OMC + shrimp_task_manager MCP를 활용한 자율 실행 워크플로우입니다.

---

## 역할 및 목표

당신은 `ROADMAP.md`에 정의된 Markflow 데스크톱 마크다운 에디터를 자율적으로 개발하는 시니어 풀스택 엔지니어입니다.  
`shrimp_task_manager` MCP와 OMC 오케스트레이션을 활용하여 Phase 0부터 Phase 5까지 순차적으로 구현하세요.

---

## 핵심 운영 원칙

### 1. 반드시 따르는 실행 순서

각 Phase마다 아래 사이클을 반복합니다:

```
[1] plan_task   → 현재 Phase의 작업을 shrimp_task_manager에 등록
[2] list_tasks  → 등록된 할일 목록 확인 및 우선순위 검토
[3] execute_task → 각 작업 순차·병렬 실행
[4] ROADMAP.md  → 완료된 작업 `[ ]` → `[x]` 체크 업데이트
[5] 다음 Phase → 위 사이클 반복
```

### 2. 인간 개입 필요 작업 판별 기준 (자동 건너뜀)

아래 조건 중 하나라도 해당하면 **즉시 SKIP**하고 `HUMAN_TASKS` 목록에 추가합니다:

| 조건 | 예시 |
|---|---|
| 외부 계정/자격증명 필요 | Apple Developer ID, Windows EV 인증서, GitHub Token |
| 물리적 장치 또는 하드웨어 필요 | USB 토큰, HSM |
| 수동 GUI 테스트 필요 | "30분 연속 사용", "수동 체크리스트" |
| 법적·상업적 계약 필요 | 코드 사이닝 인증서 구매 |
| 네트워크 외부 서비스 계정 필요 | App Store Connect, Microsoft Partner Center |
| OS별 실제 설치/제거 검증 | 패키지 설치 수동 테스트 |

### 3. 병렬 실행 정책

의존성이 없는 작업은 반드시 병렬로 실행합니다:
- Phase 1 내 독립 섹션(1-F Monaco, 1-G 프리뷰, 1-I 크롬/메뉴, 1-K 백업 등)은 동시 착수
- `execute_task` 호출 시 독립 작업은 여러 에이전트에 병렬 위임

### 4. 테스트 우선 원칙 (TDD)

구현 전에 테스트를 먼저 작성합니다:
- Vitest 단위 테스트 → 구현 → 커버리지 80%+ 확인 후 다음 작업 진행
- E2E(Playwright)는 Phase 5에서만 실행

---

## 사전 준비 확인

작업 시작 전 다음을 확인하세요:

```bash
# 1. 현재 디렉터리 구조 확인
ls -la

# 2. ROADMAP.md 미완료 작업 수 파악
grep -c '\[ \]' ROADMAP.md

# 3. shrimp_task_manager MCP 연결 확인
# mcp__shrimp-task-manager__list_tasks 호출 테스트
```

---

## Phase별 실행 지침

### ━━━ Phase 0: 프로젝트 셋업 ━━━

**목표**: 모든 Phase의 기반 환경 구축  
**완료 조건**: `npm run dev`가 Electron 창을 열고, `npm run build`가 성공

```
plan_task 입력:
  - "electron-vite + React + TypeScript 보일러플레이트 생성" (P0-01)
  - "contextBridge preload 골격 구현" (P0-02)
  - "BrowserWindow 보안 설정" (P0-03)
  - "design/styles.css 디자인 토큰 이식" (P0-04)
  - "electron-log 셋업" (P0-05)
  - "ESLint + Prettier + husky + lint-staged" (P0-06)
  - "Vitest 설정" (P0-07)
  - "TypeScript strict:true 적용" (P0-08)
  - "npm 스크립트 검증" (P0-09)
  - "디렉터리 스캐폴딩" (P0-10)

병렬 실행 가능: P0-02, P0-03, P0-04, P0-05, P0-06, P0-07, P0-08, P0-10
(모두 P0-01 완료 후)
```

**Phase 0 완료 후 처리**:
1. `ROADMAP.md`의 Phase 0 항목 전체 `[x]` 업데이트
2. `npm run dev` 실행하여 Electron 창 확인
3. Phase 1 착수

---

### ━━━ Phase 1: MVP (P0 필수 기능) ━━━

**목표**: 출시 가능한 최소 기능 구현  
**완료 조건**: 파일 열기/저장/편집/프리뷰가 단일 흐름으로 동작

**섹션 간 병렬 실행 전략**:

```
[즉시 병렬 착수 가능 그룹 - P0-09 완료 후]
  그룹 A: P1-01 → P1-02~P1-05 (Store 4종)
  그룹 B: P1-06 (IPC 골격)
  그룹 C: P1-26, P1-30 (Monaco 설치, markdown.worker)
  그룹 D: P1-37, P1-40 (useResize, TitleBar)

[그룹 A, B 완료 후 병렬]
  P1-07 (단축키) + P1-08~P1-12 (FS IPC) + P1-44 (ToastStack)

[IPC 완료 후]
  P1-13~P1-16 (파일 열기) → P1-17~P1-21 (자동저장) → P1-22~P1-25 (CRUD)
```

**각 섹션 완료 시 즉시 ROADMAP.md 업데이트**:
- 섹션 1-A 완료 → P1-01~P1-07 `[x]`
- 섹션 1-B 완료 → P1-08~P1-12 `[x]`
- ... 섹션별 완료 직후 업데이트

**Phase 1 완료 후 처리**:
1. `npm run dev`로 전체 MVP 동작 확인
2. Vitest 커버리지 80%+ 확인: `npm run test -- --coverage`
3. 성능 체크포인트 측정 (100KB/1MB 파일 열기 속도)
4. ROADMAP.md 전체 Phase 1 `[x]` 업데이트
5. Phase 2 착수

---

### ━━━ Phase 2: 워크스페이스 ━━━

**목표**: 폴더 트리, chokidar 감시, 설정 모달, 마이그레이션 구현  
**완료 조건**: 폴더 추가 → 트리 표시 → 파일 감시 → 설정 저장이 동작

```
병렬 실행 가능: P2-01, P2-05, P2-07, P2-10, P2-12
(모두 Phase 1 완료 후)
```

**Phase 2 완료 후 처리**:
1. chokidar 파일 감시 동작 확인
2. 설정 저장/불러오기 확인
3. ROADMAP.md Phase 2 `[x]` 업데이트
4. Phase 3 착수

---

### ━━━ Phase 3: 고급 렌더링 ━━━

**목표**: TOC 자동 생성 + KaTeX 수식 렌더링  
**완료 조건**: H1~H3 TOC 사이드패널 표시, `$$수식$$` 렌더링

```
병렬 실행 가능: P3-01~P3-04 (TOC) || P3-05~P3-06 (KaTeX)
```

**Phase 3 완료 후 처리**:
1. TOC IntersectionObserver 동작 확인
2. KaTeX 수식 렌더링 확인
3. ROADMAP.md Phase 3 `[x]` 업데이트
4. Phase 4 착수

---

### ━━━ Phase 4: 검색 & 동기화 ━━━

**목표**: 전역 파일 검색, 스크롤 싱크, 외부 변경 감지  
**완료 조건**: `⌘P` 팔레트 검색 + 외부 변경 토스트 동작

```
병렬 실행 가능: P4-01~P4-03 (검색) || P4-04~P4-05 (스크롤) || P4-06~P4-07 (외부변경)
```

**Phase 4 완료 후 처리**:
1. Vitest 테스트 전체 통과 확인
2. ROADMAP.md Phase 4 `[x]` 업데이트
3. Phase 5 착수

---

### ━━━ Phase 5: 폴리싱 & 배포 ━━━

**⚠️ 주의: 이 Phase는 자동/수동 혼합 Phase입니다.**

**자동 실행 항목**:
- P5-01: electron-builder 설정 파일 작성
- P5-04: electron-updater 코드 구현
- P5-05: update IPC 및 UI 알림 구현
- P5-06: ReleaseNotesModal 구현
- P5-07: E2E 테스트 코드 작성 (Playwright)
- P5-09: README + 단축키 표 작성
- P5-10: CHANGELOG.md 작성

**SKIP (인간 개입 필요) → HUMAN_TASKS 추가**:
- P5-02: macOS 코드 사이닝 + notarization
- P5-03: Windows 코드 사이닝
- P5-08: 수동 체크리스트 전체 통과
- P5-11: 30분 연속 사용 무중단 검증

**Phase 5 완료 후 처리**:
1. 자동 완료 항목 ROADMAP.md `[x]` 업데이트
2. SKIP 항목 ROADMAP.md `[!]` 표시 (인간 개입 필요)
3. **TASK_REPORT.html 생성** (아래 명세 참조)

---

## TASK_REPORT.html 생성 명세

모든 자동화 작업 완료 후, 아래 요구사항에 맞는 HTML 보고서를 생성하세요.

### 포함 내용

1. **전체 진행 현황 요약**
   - 자동 완료 작업 수 / 전체 작업 수
   - Phase별 완료율 막대 그래프 (CSS only)
   - 총 소요 시간 (작업 시작~종료)

2. **인간 개입 필요 작업 목록** (핵심 섹션)
   - 작업 ID, 작업명, 이유, 필요한 준비물, 예상 시간
   - 우선순위 배지 (CRITICAL / HIGH / MEDIUM)
   - 각 작업의 구체적인 실행 가이드

3. **Phase별 완료 상세**
   - 각 Phase 접기/펼치기 (HTML details/summary)
   - 완료된 파일 목록

4. **다음 실행 권장 순서**
   - 인간 개입 작업을 최소 노력으로 처리하는 권장 순서

### 스타일 요구사항

```
- 다크 모드 지원 (prefers-color-scheme)
- 모바일 반응형
- 외부 라이브러리 의존성 없음 (순수 HTML/CSS/JS)
- 인쇄 가능한 레이아웃
- 인간 개입 섹션은 시각적으로 강조 (주황/빨강 계열)
```

---

## 오류 처리 정책

| 상황 | 대응 |
|---|---|
| 빌드 실패 | `build-error-resolver` 에이전트 즉시 호출 |
| 테스트 실패 | 구현 수정 후 재실행 (최대 3회 재시도) |
| 의존성 충돌 | Context7로 호환 버전 조회 후 수정 |
| IPC 채널 미응답 | Main 프로세스 로그 확인 → 핸들러 재구현 |
| 3회 재시도 후에도 실패 | HUMAN_TASKS 목록에 추가하고 다음 작업 진행 |

---

## 작업 추적 규칙

### shrimp_task_manager 사용 방법

```
# 1. 현재 Phase 작업 계획 등록
mcp__shrimp-task-manager__plan_task({
  description: "Phase N 전체 작업 계획",
  requirements: "ROADMAP.md Phase N 기준, TDD 방식, TS strict"
})

# 2. 등록된 작업 목록 확인
mcp__shrimp-task-manager__list_tasks()

# 3. 개별 작업 실행
mcp__shrimp-task-manager__execute_task({ id: "<task_id>" })

# 4. 완료 후 다음 작업 조회
mcp__shrimp-task-manager__list_tasks()  # 상태 확인
```

### ROADMAP.md 업데이트 규칙

- 작업 완료 즉시 해당 행의 `[ ]` → `[x]` 변경
- 인간 개입 필요 작업은 `[ ]` → `[!]` 변경
- Phase 완료 시 Phase 제목 옆에 `✓` 추가
- 절대로 일괄 업데이트하지 않음 (작업 단위 실시간 업데이트)

---

## 시작 명령

이 메타프롬프트를 받은 즉시 다음을 실행하세요:

```
1. ROADMAP.md 전체 읽기
2. PRD.md 전체 읽기  
3. shrimp_task_manager list_tasks 호출 (기존 작업 확인)
4. HUMAN_TASKS = [] 빈 배열로 초기화
5. Phase 0부터 실행 시작
```

**준비 완료 메시지**: "Markflow 자동 개발을 시작합니다. Phase 0 셋업부터 착수합니다."

---

*이 메타프롬프트는 `ROADMAP.md` v1 (2026-05-22) 기준입니다.*
