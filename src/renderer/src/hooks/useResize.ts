import { RefObject, useCallback, useEffect, useRef } from 'react'
import { useUiStore } from '../stores/uiStore'

const EDITOR_MIN_WIDTH = 320
const PREVIEW_MIN_WIDTH = 280
const HANDLE_WIDTH = 5

export function useResize(containerRef: RefObject<HTMLDivElement>): RefObject<HTMLDivElement> {
  const setEditorWidth = useUiStore((s) => s.setEditorWidth)
  const handleRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const delta = e.clientX - startX.current
      const containerWidth = containerRef.current.offsetWidth
      const maxWidth = containerWidth - PREVIEW_MIN_WIDTH - HANDLE_WIDTH
      setEditorWidth(Math.max(EDITOR_MIN_WIDTH, Math.min(startWidth.current + delta, maxWidth)))
    },
    [containerRef, setEditorWidth]
  )

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    const handle = handleRef.current
    if (!handle) return

    const onMouseDown = (e: MouseEvent): void => {
      if (!containerRef.current) return
      const editorPane = containerRef.current.querySelector<HTMLElement>('.editor-pane')
      dragging.current = true
      startX.current = e.clientX
      startWidth.current = editorPane?.offsetWidth ?? containerRef.current.offsetWidth / 2
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      e.preventDefault()
    }

    handle.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      handle.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef, onMouseMove, onMouseUp])

  return handleRef
}
