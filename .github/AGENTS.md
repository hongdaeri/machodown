<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# .github

## Purpose
GitHub Actions CI/CD 워크플로우, Dependabot 설정, 이슈/PR 템플릿을 포함하는 GitHub 메타 디렉토리.

## Key Files

| File | Description |
|------|-------------|
| `dependabot.yml` | npm 의존성 자동 업데이트 설정 |
| `pull_request_template.md` | PR 생성 시 자동 삽입되는 템플릿 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `ISSUE_TEMPLATE/` | bug_report, feature_request 이슈 템플릿 (see `ISSUE_TEMPLATE/AGENTS.md`) |
| `workflows/` | CI 및 릴리즈 자동화 워크플로우 (see `workflows/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- 워크플로우 수정 시 YAML 문법을 반드시 검증할 것 (`yamllint` 또는 GitHub Actions 공식 스키마)
- master 브랜치 보호: "test" 잡이 통과해야만 merge 가능 — `ci.yml`의 job 이름 변경 시 branch protection rule도 함께 수정 필요
- 릴리즈 워크플로우는 `v*` 태그 푸시 시 트리거됨

<!-- MANUAL: -->
