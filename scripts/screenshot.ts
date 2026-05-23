/**
 * 앱 스크린샷 캡처 스크립트
 * 사용: npx tsx scripts/screenshot.ts
 * 사전 조건: npm run build 실행 후 out/main/index.js 존재해야 함
 */
import { _electron as electron } from '@playwright/test'
import { join, resolve } from 'path'
import fs from 'fs/promises'

const OUT_DIR = resolve(__dirname, '../docs/screenshots')

const SAMPLE_MD = `# Machodown

Electron 기반 데스크톱 마크다운 에디터.

## 주요 기능

**굵게**, *기울임*, ~~취소선~~, \`인라인 코드\`

### 코드 블록

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`
}
console.log(greet('Machodown'))
\`\`\`

### 수식 (KaTeX)

인라인: $E = mc^2$

블록:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### 테이블

| 기능 | 지원 |
|------|------|
| GFM 테이블 | ✅ |
| KaTeX 수식 | ✅ |
| 코드 하이라이팅 | ✅ |
| 자동저장 | ✅ |

### 체크리스트

- [x] Monaco Editor 통합
- [x] 실시간 프리뷰
- [x] 다크 테마
- [ ] Homebrew Cask 등록
`

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function main(): Promise<void> {
  await fs.mkdir(OUT_DIR, { recursive: true })

  const app = await electron.launch({
    args: [join(__dirname, '../out/main/index.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })

  const page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  await page.setViewportSize({ width: 1280, height: 800 })
  await sleep(1500)

  // 온보딩 모달이 있으면 닫기
  await page.keyboard.press('Escape')
  await sleep(300)

  // "새 파일" 버튼 클릭으로 에디터 열기
  const newFileBtn = page.locator('button', { hasText: '새 파일' }).first()
  if (await newFileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await newFileBtn.click()
    await sleep(800)
  } else {
    // 이미 에디터가 열려 있으면 Cmd+N
    await page.keyboard.press('Meta+n')
    await sleep(800)
  }

  // Monaco 에디터 inputarea 대기
  const inputarea = page.locator('.monaco-editor .inputarea').first()
  await inputarea.waitFor({ state: 'visible', timeout: 15_000 })
  await sleep(400)

  // 전체 선택 후 샘플 마크다운 입력
  await inputarea.click()
  await sleep(200)
  await page.keyboard.press('Meta+a')
  await sleep(100)
  await page.keyboard.type(SAMPLE_MD, { delay: 2 })
  await sleep(1200)

  // --- 1. 스플릿 뷰 (라이트) ---
  await page.keyboard.press('Meta+Shift+KeyB')
  await sleep(600)
  await page.screenshot({ path: join(OUT_DIR, '01-split-view-light.png') })
  console.log('✓ 01-split-view-light.png')

  // --- 2. 에디터 전용 ---
  await page.keyboard.press('Meta+Shift+KeyE')
  await sleep(400)
  await page.screenshot({ path: join(OUT_DIR, '02-editor-only.png') })
  console.log('✓ 02-editor-only.png')

  // --- 3. 프리뷰 전용 ---
  await page.keyboard.press('Meta+Shift+KeyV')
  await sleep(400)
  await page.screenshot({ path: join(OUT_DIR, '03-preview-only.png') })
  console.log('✓ 03-preview-only.png')

  // --- 다크 테마 전환 ---
  // settings:set IPC는 { settings: Partial<AppSettings> } 형태
  await page.evaluate(async () => {
    await (window.api as any).invoke('settings:set', { settings: { theme: 'dark' } })
  })
  await sleep(1000)

  // --- 4. 다크 스플릿 뷰 ---
  await page.keyboard.press('Meta+Shift+KeyB')
  await sleep(500)
  await page.screenshot({ path: join(OUT_DIR, '04-split-view-dark.png') })
  console.log('✓ 04-split-view-dark.png')

  // --- 5. 다크 프리뷰 전용 ---
  await page.keyboard.press('Meta+Shift+KeyV')
  await sleep(400)
  await page.screenshot({ path: join(OUT_DIR, '05-preview-only-dark.png') })
  console.log('✓ 05-preview-only-dark.png')

  await app.close()
  console.log(`\n스크린샷 저장 완료: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
