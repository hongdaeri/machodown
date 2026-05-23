import { useEffect, useState } from 'react'

export function useNativeTheme(): { isDark: boolean } {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    void window.api.invoke('nativeTheme:get').then((res) => {
      const r = res as { ok: boolean; dark: boolean }
      if (r.ok) setIsDark(r.dark)
    })

    const unsub = window.api.on('theme:nativeChanged', (payload) => {
      const { dark } = payload as { dark: boolean }
      setIsDark(dark)
    })

    return unsub
  }, [])

  return { isDark }
}
