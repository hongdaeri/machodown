import { useState, useEffect } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { useSettingsStore } from '../../stores/settingsStore'

type Theme = 'light' | 'dark' | 'system'

const THEMES: { value: Theme; label: string; desc: string }[] = [
  { value: 'light', label: '라이트', desc: '밝은 배경' },
  { value: 'dark', label: '다크', desc: '어두운 배경' },
  { value: 'system', label: '시스템', desc: '운영체제 설정 따르기' }
]

export function WelcomeModal(): JSX.Element {
  const closeModal = useUiStore((s) => s.closeModal)
  const update = useSettingsStore((s) => s.update)
  const currentTheme = useSettingsStore((s) => s.settings.theme)
  const [selected, setSelected] = useState<Theme>(currentTheme)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeModal])

  const handleConfirm = async (): Promise<void> => {
    await update({ theme: selected })
    closeModal()
  }

  return (
    <div className="modal-scrim">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
        <h3 id="welcome-title">Machodown에 오신 것을 환영합니다</h3>
        <p>테마를 선택하세요. 나중에 설정에서 변경할 수 있습니다.</p>
        <div className="picker-list">
          {THEMES.map((t) => (
            <button
              key={t.value}
              className={`picker-row${selected === t.value ? ' selected' : ''}`}
              onClick={() => setSelected(t.value)}
            >
              <span>{t.label}</span>
              <span className="picker-desc">{t.desc}</span>
              {selected === t.value && <span className="picker-check">✓</span>}
            </button>
          ))}
        </div>
        <div className="actions">
          <button className="btn primary" onClick={() => void handleConfirm()}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
