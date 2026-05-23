<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-23 | Updated: 2026-05-23 -->

# brand

## Purpose
Machodown 앱의 브랜드 아이콘 에셋 디렉토리. 각 플랫폼의 패키징에 필요한 형식으로 아이콘이 준비되어 있다.

## Key Files

| File | Description |
|------|-------------|
| `icon.svg` | 벡터 원본 아이콘 |
| `icon.icns` | macOS 앱 아이콘 (electron-builder 사용) |
| `icon.ico` | Windows 앱 아이콘 |
| `png/icon-128.png` | 128px PNG (README, 문서에 사용) |

## For AI Agents

### Working In This Directory
- 아이콘 수정 시 SVG 원본을 편집한 뒤 각 형식으로 재생성해야 함
- `package.json`의 `build.mac.icon`, `build.win.icon` 설정이 이 파일들을 참조함
- PNG 파일은 `brand/png/` 서브디렉토리에 위치

<!-- MANUAL: -->
