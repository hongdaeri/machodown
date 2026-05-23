<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# workflows

## Purpose
GitHub Actions 워크플로우 파일. CI(테스트/빌드 검증)와 릴리즈(패키징/배포) 자동화를 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `ci.yml` | PR/push 시 typecheck + test 실행. master 브랜치 보호의 필수 통과 잡("test") |
| `release.yml` | `v*` 태그 푸시 시 macOS(arm64/x64) + Linux(x64) 빌드 후 GitHub Release에 업로드 |

## For AI Agents

### Working In This Directory
- `ci.yml`의 `jobs.test` 잡 이름은 branch protection rule과 연결되어 있음 — 이름 변경 금지
- `release.yml`은 `GITHUB_TOKEN` (built-in, `contents: write` 권한)을 사용해 Release 에셋 업로드
- Windows 빌드는 타임아웃 이슈로 현재 워크플로우에서 제거됨
- `build-win` 잡을 추가할 경우 `ELECTRON_BUILDER_HTTP_TIMEOUT: 600000` 환경변수 필요
- actions/checkout, actions/setup-node는 v6 사용 중

### Common Patterns
- 멀티 아키텍처 macOS 빌드: `matrix.include`로 arm64/x64 병렬 실행
- 릴리즈 업로드: `electron-builder --publish onTag`

<!-- MANUAL: -->
