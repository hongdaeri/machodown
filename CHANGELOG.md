# Changelog

All notable changes to Machodown are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.0.0] — 2026-05-23

### Added
- 첫 공식 릴리즈
- GitHub Actions CI/CD 자동 빌드 및 릴리즈 파이프라인
- macOS arm64/x64 코드 서명 및 공증(Notarization)
- Windows x64 NSIS/Portable 빌드
- Linux x64 AppImage/deb 빌드
- electron-updater GitHub Releases 자동 업데이트

---

## [0.1.0] — 2026-05-23

### Added

#### Phase 0 — 프로젝트 설정
- electron-vite 2 + React 18 + TypeScript strict 기반 프로젝트 초기화
- ESLint + Prettier + Husky + lint-staged 설정
- Vitest 단위 테스트 환경 구성
- electron-builder 패키징 설정 (macOS dmg/zip, Windows nsis/portable, Linux AppImage/deb)
- GitHub Actions CI/CD 파이프라인 기반 구성

#### Phase 1 — 핵심 에디터
- Monaco Editor 기반 마크다운 편집기
- 멀티탭 시스템 (열기 / 닫기 / 순서 변경 / 탭 간 전환)
- 실시간 마크다운 프리뷰 (markdown-it + DOMPurify)
- 에디터 / 프리뷰 / 스플릿 뷰 전환
- 파일 열기 · 저장 · 다른 이름으로 저장 IPC
- 자동저장 (500ms debounce, 설정 가능)
- machodown-light / machodown-dark Monaco 커스텀 테마
- 라이트 / 다크 / 시스템 테마
- 앱 메뉴바 및 키보드 단축키
- 상태바 (인코딩 · EOL · 커서 위치)
- 토스트 알림 시스템
- 단축키 모달
- 온보딩(첫 실행) 모달 및 업데이트 릴리스 노트 모달
- 비정상 종료 감지 및 백업 복구
- electron-log 기반 진단 로깅

#### Phase 2 — 워크스페이스
- 폴더 기반 사이드바 파일 탐색기
- 워크스페이스 폴더 추가 / 제거
- 파일 생성 · 이름 변경 · 삭제 (휴지통)
- 최근 파일 목록
- 세션 복원 (앱 재시작 시 마지막 탭 복원)
- 명령어 팔레트
- 설정 모달 (테마 · 폰트 크기 · 자동저장 · 스크롤 싱크 등)
- 인코딩 · EOL 변환 모달

#### Phase 3 — 고급 마크다운
- TOC (Table of Contents) 사이드패널 (H1~H3)
- KaTeX 수식 렌더링 (인라인 `$...$` / 블록 `$$...$$`)
- GFM 테이블 · 체크박스 · 이모지 지원
- 코드 블록 구문 강조 (highlight.js)
- 마크다운 앵커 링크

#### Phase 4 — 검색 & 동기화
- 에디터 내 검색 및 검색+교체 (정규식 지원)
- 에디터→프리뷰 스크롤 싱크 (200ms throttle)
- 프리뷰 헤딩 클릭→에디터 스크롤 싱크
- 외부 파일 변경 감지 (chokidar)
  - clean 탭: 토스트 "다시 불러오기" 알림
  - dirty 탭: 3-way 충돌 해소 모달

#### Phase 5 — 폴리싱 & 배포
- electron-builder 배포 설정 (macOS .dmg/.zip, Windows NSIS/Portable, Linux .AppImage/.deb)
- electron-updater GitHub Releases 자동 업데이트 통합
- 업데이트 알림 토스트 (`update:available`, `update:downloaded`)
- Playwright E2E 테스트 (S1 새 파일 저장, S2 기존 파일 편집, S5 외부 변경 감지)
- README + 키보드 단축키 표

---

[Unreleased]: https://github.com/hongdaeri/machodown/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/hongdaeri/machodown/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/hongdaeri/machodown/releases/tag/v0.1.0
