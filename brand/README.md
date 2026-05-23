# machodown — Brand Assets

`> MD` — 코랄 caret + 화이트 MD, 어두운 squircle.

## 구성

```
brand/
├── machodown-icon.svg     ← 마스터 (벡터, 1024×1024 viewBox)
├── index.html             ← 브랜드 시트 (미리보기)
├── png/
│   ├── icon-1024.png      ← App Store · electron-builder 기본 입력
│   ├── icon-512.png       ← .icns 변환 베이스
│   ├── icon-384.png
│   ├── icon-256.png       ← .ico 최대 사이즈
│   ├── icon-192.png
│   ├── icon-128.png
│   ├── icon-96.png
│   ├── icon-64.png
│   ├── icon-48.png
│   ├── icon-32.png
│   ├── icon-24.png
│   └── icon-16.png
└── README.md
```

## 컬러

| 토큰        | HEX                 | 용도                |
| ----------- | ------------------- | ------------------- |
| Background  | #1A1A1A → #0D0D0D   | 어두운 squircle    |
| Coral       | #D97757             | `>` caret           |
| Off-white   | #F4F1EA             | `MD` 워드마크       |

## 빌드용 변환

### macOS — `.icns`

```bash
# iconset 폴더 준비
mkdir machodown.iconset
cp png/icon-16.png    machodown.iconset/icon_16x16.png
cp png/icon-32.png    machodown.iconset/icon_16x16@2x.png
cp png/icon-32.png    machodown.iconset/icon_32x32.png
cp png/icon-64.png    machodown.iconset/icon_32x32@2x.png
cp png/icon-128.png   machodown.iconset/icon_128x128.png
cp png/icon-256.png   machodown.iconset/icon_128x128@2x.png
cp png/icon-256.png   machodown.iconset/icon_256x256.png
cp png/icon-512.png   machodown.iconset/icon_256x256@2x.png
cp png/icon-512.png   machodown.iconset/icon_512x512.png
cp png/icon-1024.png  machodown.iconset/icon_512x512@2x.png

# 변환
iconutil -c icns machodown.iconset -o machodown.icns
```

### Windows — `.ico`

ImageMagick:

```bash
magick png/icon-16.png png/icon-24.png png/icon-32.png png/icon-48.png \
       png/icon-64.png png/icon-128.png png/icon-256.png \
       machodown.ico
```

### Linux

각 사이즈의 PNG를 그대로 `usr/share/icons/hicolor/<size>x<size>/apps/machodown.png` 로 배치.

## electron-builder 설정 예

`electron-builder.yml`:

```yaml
appId: com.machodown.app
productName: machodown

mac:
  icon: brand/machodown.icns
win:
  icon: brand/machodown.ico
linux:
  icon: brand/png    # 폴더를 가리키면 모든 사이즈 자동 사용
```

## 사용 가이드

- **여백**: 아이콘 가장자리 22.5% 곡률(squircle)이 보존되도록 잘라내거나 마스크 추가 금지.
- **최소 크기**: 16px까지 가독성 유지. 그 이하는 단순화 필요(별도 favicon).
- **단색 변형**: 다크 배경 필요 시 `>` `MD` 모두 `#F4F1EA`로 통일 가능. 라이트 배경에는 권장하지 않음(앱 톤이 다크).
- **금지**:
  - 그라데이션 임의 변경
  - `>` 위치/크기 조정
  - 폰트 교체(JetBrains Mono → SF Mono → ui-monospace 폴백 체인 고정)
  - 다른 색 추가
