# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Electron 앱 개발 서버 시작
npm test             # 전체 테스트 실행 (vitest)
npm run typecheck    # TypeScript 타입 체크 (node + web 양쪽)
npm run lint         # ESLint
npm run build        # typecheck → electron-vite build

# 단일 테스트 파일 실행
npx vitest run src/renderer/src/__tests__/launchFlow.test.ts
```

master 브랜치는 branch protection이 적용되어 있습니다 (`test` CI 통과 필수). 모든 변경사항은 PR을 통해 병합해야 합니다.

## .ts/.js 이중 파일 (중요)

`src/main/` 과 `src/preload/` 에는 동일한 이름의 `.ts`와 `.js` 파일이 공존합니다. electron-vite는 `.js`를 우선 컴파일 소스로 사용하므로 **두 파일을 항상 함께 수정해야 합니다**. `.ts`만 수정하면 런타임에 반영되지 않습니다.

## 아키텍처

### Electron 3-프로세스 구조

```
main (Node.js)          preload (contextBridge)       renderer (React)
src/main/               src/preload/index.ts/.js       src/renderer/src/
  index.ts/.js            → window.api 노출              App.tsx
  menu.ts/.js
  ipc/
    index.ts/.js          ← 채널 화이트리스트 관리
    fs, dialog, settings, session, app, shell,
    watch, backup, diagnostics, workspace,
    recent, theme, search  (각 도메인별 핸들러)
  services/
    BackupService.ts
```

### IPC 패턴

새 IPC 채널 추가 시 반드시 4곳을 수정해야 합니다:
1. `src/main/ipc/<domain>.ts` + `.js` — `ipcMain.handle()` 핸들러 구현
2. `src/main/ipc/index.ts` + `.js` — `register<Domain>Handlers()` 등록
3. `src/preload/index.ts` + `.js` — `ALLOWED_INVOKE_CHANNELS` 또는 `ALLOWED_ON_CHANNELS`에 추가
4. `src/preload/index.d.ts` — TypeScript 타입 선언 추가

렌더러에서는 `window.api.invoke('channel:name', args)` 또는 `window.api.on('channel:name', handler)`로 호출합니다. 화이트리스트에 없는 채널은 즉시 reject됩니다.

### 상태 관리 (Zustand)

| 스토어 | 역할 |
|--------|------|
| `editorStore` | 탭 목록, 활성 탭, 파일 내용, 저장/로드 |
| `uiStore` | viewMode(editor/preview/split), 사이드바, 모달, 토스트 |
| `workspaceStore` | 열린 폴더 목록, 파일 트리 |
| `settingsStore` | 테마, 폰트, 자동저장 등 설정 |

스토어는 React 컴포넌트 외부에서도 `useEditorStore.getState()`로 직접 접근 가능합니다. 이 패턴은 IPC 콜백, 훅 내부 등에서 사용됩니다.

탭은 변경 시마다 `session:save` IPC를 **500ms 디바운스**로 자동 저장합니다(`editorStore` 내 `scheduleTabSave`).

### 앱 부팅 흐름

1. `app:launchType` IPC → `'first-launch'` 또는 `'normal'` 반환
2. `first-launch`: welcome 모달 표시
3. `normal`: `restoreSessionTabs()` — 직전 세션의 탭 파일들을 읽어 복원

### 파일 감시 루프 방지

`lib/selfSaveRegistry.ts` — 앱이 직접 저장한 파일 경로를 단기 등록합니다. `useFileWatcher`에서 `watch:changed` 이벤트 수신 시 이 레지스트리를 확인해 자기 저장에 의한 재로드 루프를 막습니다.

### 마크다운 렌더링

`src/renderer/src/workers/markdown.worker.ts` — markdown-it(GFM, KaTeX, syntax highlight)을 Web Worker에서 실행합니다. UI 스레드 블로킹을 방지하기 위해 렌더링을 오프로드합니다.

### Path Aliases

```
@renderer  → src/renderer/src/
@components → src/renderer/src/components/
@stores    → src/renderer/src/stores/
@hooks     → src/renderer/src/hooks/
@lib       → src/renderer/src/lib/
@styles    → src/renderer/src/styles/
@main      → src/main/
```

## 테스트

테스트 파일은 `src/renderer/src/__tests__/`에 위치합니다. vitest + jsdom 환경이며 `window.api`는 테스트마다 `vi.fn()`으로 목킹합니다. 스토어는 `vi.mock()`으로 격리하고 `getState`를 통해 주입합니다. 커버리지 임계값은 80%입니다.
