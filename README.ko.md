[English](README.md)

<div align="center">
  <img src="brand/png/icon-128.png" alt="Machodown" width="96" height="96" />
  <h1>Machodown</h1>
  <p>macOS와 Linux를 위한 Monaco Editor 기반 마크다운 에디터.<br/>아름답게 쓰고, 명확하게 생각하세요.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Release](https://img.shields.io/github/v/release/hongmacho/machodown)](https://github.com/hongmacho/machodown/releases)
  [![CI](https://github.com/hongmacho/machodown/actions/workflows/ci.yml/badge.svg)](https://github.com/hongmacho/machodown/actions/workflows/ci.yml)
  [![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey)](https://github.com/hongmacho/machodown/releases)
</div>

---

![Machodown 스플릿 뷰](docs/screenshots/01-split-view-dark.png)

---

## 왜 Machodown인가요?

대부분의 마크다운 에디터는 너무 단순하거나 너무 복잡합니다. Machodown은 **VS Code 수준의 편집 경험** — Monaco Editor, 실시간 프리뷰, 멀티탭 워크스페이스 — 을 데스크톱 앱으로 제공합니다.

구독 없음. 클라우드 동기화 없음. 당신의 파일, 당신의 방식으로.

---

## 기능

| | 기능 | 설명 |
|---|---|---|
| ✍️ | **Monaco Editor** | VS Code 에디터 엔진 — 자동완성, 구문 강조, 정규식 검색 |
| 👁️ | **실시간 프리뷰** | GFM, KaTeX 수식, 코드 하이라이팅, 스크롤 싱크 |
| 🪟 | **유연한 뷰** | 에디터 전용 / 프리뷰 전용 / 스플릿 뷰 즉시 전환 |
| 📑 | **멀티탭** | 여러 파일을 탭으로 동시에 열기, 상태 유지 |
| 💾 | **자동저장** | 설정 가능한 간격 + 비정상 종료 시 복구 |
| 📁 | **워크스페이스** | 폴더 기반 사이드바 파일 탐색기 |
| 🔄 | **파일 감시** | 외부 변경 감지 및 충돌 해소 |
| 🔍 | **검색 & 교체** | 정규식 지원 에디터 내 검색 |
| 🎨 | **테마** | 라이트 / 다크 / 시스템 자동 |
| ⬆️ | **자동 업데이트** | GitHub Releases를 통한 자동 업데이트 |
| 📐 | **KaTeX 수식** | 인라인 및 블록 LaTeX 수식 렌더링 |
| 📋 | **TOC 패널** | 자동 생성 목차 사이드패널 |
| ⌨️ | **명령어 팔레트** | `Cmd+K` 로 모든 기능 접근 |

---

## 설치

### macOS (권장)

[Releases](https://github.com/hongmacho/machodown/releases) 페이지에서 다운로드:

| 칩 | 파일 |
|---|---|
| Apple Silicon (M1/M2/M3) | `Machodown-1.0.0-arm64.dmg` |
| Intel | `Machodown-1.0.0-x64.dmg` |

> Apple 코드 서명 및 공증(Notarization) 완료 — "확인되지 않은 개발자" 경고 없음.

### Linux

| 형식 | 파일 |
|---|---|
| AppImage | `Machodown-1.0.0-x86_64.AppImage` |
| Debian / Ubuntu | `machodown_1.0.0_amd64.deb` |

```bash
# AppImage
chmod +x Machodown-*.AppImage && ./Machodown-*.AppImage

# deb
sudo dpkg -i machodown_*.deb
```

### Homebrew (macOS)

> Homebrew Cask 등록 [심사 중](https://github.com/Homebrew/homebrew-cask/pull/265869). 승인 후:

```bash
brew install --cask machodown
```

---

## 키보드 단축키

### 파일

| 단축키 | 동작 |
|---|---|
| `Cmd/Ctrl + N` | 새 파일 |
| `Cmd/Ctrl + O` | 파일 열기 |
| `Cmd/Ctrl + S` | 저장 |
| `Cmd/Ctrl + Shift + S` | 다른 이름으로 저장 |
| `Cmd/Ctrl + W` | 탭 닫기 |

### 보기

| 단축키 | 동작 |
|---|---|
| `Cmd/Ctrl + \` | 사이드바 토글 |
| `Cmd/Ctrl + Shift + E` | 에디터 전용 |
| `Cmd/Ctrl + Shift + V` | 프리뷰 전용 |
| `Cmd/Ctrl + Shift + B` | 스플릿 뷰 |

### 편집

| 단축키 | 동작 |
|---|---|
| `Cmd/Ctrl + F` | 검색 |
| `Cmd/Ctrl + H` | 검색 & 교체 |
| `Cmd/Ctrl + /` | 행 주석 토글 |
| `Cmd/Ctrl + K` | 명령어 팔레트 |

### 탭

| 단축키 | 동작 |
|---|---|
| `Cmd/Ctrl + 1–9` | 탭 직접 이동 |
| `Cmd/Ctrl + Tab` | 다음 탭 |
| `Cmd/Ctrl + Shift + Tab` | 이전 탭 |

---

## 개발 환경 세팅

```bash
git clone https://github.com/hongmacho/machodown.git
cd machodown
npm install
npm run dev
```

### 주요 명령어

```bash
npm run typecheck   # 타입 체크
npm test            # 단위 테스트
npm run lint        # 린트
npm run build       # 프로덕션 빌드
npm run package     # 현재 OS용 패키지 생성
```

### 기술 스택

- **Electron 28** + **electron-vite 2**
- **React 18** + **TypeScript 5** (strict)
- **Monaco Editor** — 에디터 엔진
- **markdown-it** — 마크다운 파싱
- **KaTeX** — 수식 렌더링
- **Zustand** — 상태 관리
- **Vitest** — 단위 테스트

---

## 시스템 요구사항

| OS | 최소 버전 |
|---|---|
| macOS | 12 Monterey |
| Linux | Ubuntu 20.04 (x64) |

---

## 기여하기

이슈와 PR을 환영합니다. 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

---

## 라이선스

[MIT](LICENSE)
