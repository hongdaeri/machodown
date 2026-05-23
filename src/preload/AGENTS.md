<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# preload

## Purpose
Electron preload 스크립트. 메인 프로세스와 renderer 사이의 보안 브릿지 역할을 하며 `contextBridge.exposeInMainWorld`로 renderer에서 사용할 `window.api`를 안전하게 노출한다.

## Key Files

| File | Description |
|------|-------------|
| `index.ts` / `index.js` | contextBridge 설정 — `window.api` 객체 노출 |
| `index.d.ts` | renderer에서 참조하는 `window.api` TypeScript 타입 선언 |

## For AI Agents

### Working In This Directory
- **`.ts`와 `.js` 파일 쌍이 존재함** — 반드시 동시에 수정
- `index.d.ts`는 renderer의 `src/renderer/src/env.d.ts`에서 import되어 타입 체크에 사용됨
- 새 API 노출 시 3곳을 동시 수정: `index.ts`(구현) + `index.js`(구현) + `index.d.ts`(타입)
- contextBridge 내부에서는 Node.js API 직접 사용 불가 — ipcRenderer를 통해 메인에 위임

### Common Patterns
```typescript
// 새 채널 노출 패턴
contextBridge.exposeInMainWorld('api', {
  someAction: (arg: string) => ipcRenderer.invoke('some-action', arg),
})
```

## Dependencies

### Internal
- `src/main/ipc/` — 채널명이 일치해야 함
- `src/renderer/src/env.d.ts` — `index.d.ts` 타입을 참조

<!-- MANUAL: -->
