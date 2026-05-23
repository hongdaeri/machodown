# Machodown 배포 로드맵

오픈소스 공개 및 사용자 배포를 위한 단계별 체크리스트.

---

## Phase 1. GitHub 리포지토리 공개 준비

### 1-1. 리포지토리 정리
- [x] GitHub에 public 리포지토리 생성 (`hongmacho/machodown`)
- [x] `remote` 추가 및 첫 push
- [x] `LICENSE` 파일 추가 (MIT 권장)
- [x] `CONTRIBUTING.md` 작성 (기여 가이드)
- [x] `.github/ISSUE_TEMPLATE/` 이슈 템플릿 추가 (버그 리포트, 기능 제안)
- [x] `.github/pull_request_template.md` 추가

### 1-2. README 보강
- [x] 앱 스크린샷 추가
- [x] 기능 목록 정리
- [x] 설치 방법 (DMG 다운로드 링크 / `brew install` 옵션)
- [x] 개발 환경 세팅 방법 (`git clone` → `npm install` → `npm run dev`)
- [x] 라이선스 배지, 버전 배지 추가

---

## Phase 2. 코드 서명 (Code Signing) ✅ 완료

macOS/Windows 배포 시 "확인되지 않은 개발자" 경고 없애기 위해 필수.

### 2-1. macOS
- [x] Apple Developer Program 가입 ($99/년)
- [x] "Developer ID Application" 인증서 발급 (`Developer ID Application: paul hong (V6C3A7XH38)`)
- [x] `electron-builder` notarize 설정 활성화 (`package.json` → `build.mac.notarize.teamId`)
- [x] `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` 환경변수 설정
- [x] 공증(Notarization) 테스트 빌드 확인 — arm64/x64 모두 `notarization successful`

### 2-2. Windows (선택)
- [ ] Code Signing 인증서 구매 (DigiCert, Sectigo 등)
- [ ] `electron-builder` Windows 서명 설정

---

## Phase 3. GitHub Actions CI/CD 구성

자동화된 빌드 및 릴리즈 파이프라인 구성.

### 3-1. CI 워크플로우 (`.github/workflows/ci.yml`)
- [x] Push/PR 시 자동 실행
  - `npm run typecheck`
  - `npm run lint`
  - `npx vitest run`

### 3-2. Release 워크플로우 (`.github/workflows/release.yml`)
- [x] `v*` 태그 push 시 자동 트리거
- [x] macOS (arm64 + x64) DMG/zip 빌드
- [ ] ~~Windows x64 NSIS/portable 빌드~~ (생략)
- [x] Linux x64 AppImage/deb 빌드
- [x] 빌드 결과물을 GitHub Release에 자동 업로드

```yaml
# 트리거 예시
on:
  push:
    tags:
      - 'v*'
```

### 3-3. 필요한 GitHub Secrets 등록 ✅
- [x] `APPLE_ID`
- [x] `APPLE_APP_SPECIFIC_PASSWORD`
- [x] `APPLE_TEAM_ID`
- [x] `CSC_LINK` (macOS 인증서 base64)
- [x] `CSC_KEY_PASSWORD`
- [x] `GH_TOKEN` (GitHub Release 업로드용)

---

## Phase 4. 자동 업데이트 연동

`electron-updater`가 이미 설치되어 있으므로 설정만 활성화.

- [x] `publish` 설정 확인 (`package.json` → `build.publish`)
- [x] `autoUpdater` 코드 활성화 (`src/main/ipc/updater.ts`)
- [ ] 업데이트 확인 → 다운로드 → 재시작 흐름 UI 테스트
- [x] GitHub Releases의 `latest-mac.yml` / `latest.yml` 자동 생성 확인

---

## Phase 5. 첫 릴리즈 배포

### 5-1. 버전 확정
- [x] `package.json` 버전 `0.1.0` → `1.0.0` 확정
- [x] `CHANGELOG.md` 작성 (변경 내역 정리)

### 5-2. 태그 & 릴리즈
```bash
git tag v1.0.0
git push origin v1.0.0
```
- [x] GitHub Actions Release 워크플로우 실행 확인
- [ ] GitHub Releases 페이지에서 DMG/exe/AppImage 다운로드 검증
- [x] Release Notes 작성

### 5-3. 배포 채널 홍보 (선택)
- [ ] Homebrew Cask 등록 (`brew install --cask machodown`)
- [ ] Product Hunt 등록
- [ ] Reddit r/macapps, r/opensource 공유

---

## Phase 6. 유지보수 체계

- [x] GitHub Issues 라벨 정리 (`bug`, `enhancement`, `good first issue`)
- [ ] 버그 수정 → patch 버전 (`1.0.1`)
- [ ] 기능 추가 → minor 버전 (`1.1.0`)
- [ ] 브레이킹 체인지 → major 버전 (`2.0.0`)
- [x] Dependabot 활성화 (의존성 자동 업데이트 PR)

---

## 우선순위 요약

| 단계 | 필수 여부 | 예상 소요 |
|------|-----------|-----------|
| Phase 1 — GitHub 공개 | 필수 | 1일 |
| Phase 2 — 코드 서명 | 권장 (macOS) | 2~3일 |
| Phase 3 — CI/CD | 필수 | 1일 |
| Phase 4 — 자동 업데이트 | 권장 | 반나절 |
| Phase 5 — 첫 릴리즈 | 필수 | 1일 |
| Phase 6 — 유지보수 | 지속 | 상시 |
