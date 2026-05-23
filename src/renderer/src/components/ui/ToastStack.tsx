import { useEffect } from 'react'
import { useUiStore } from '../../stores/uiStore'
import { Toast } from '../../stores/types'

const TOAST_DURATION_MS = 3000

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps): JSX.Element {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className={`toast toast--${toast.type}`} role="alert" aria-live="polite">
      <span className="toast__message">{toast.message}</span>
      {toast.action && (
        <button
          className="toast__action"
          onClick={() => {
            toast.action!.onClick()
            onDismiss(toast.id)
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button className="toast__close" onClick={() => onDismiss(toast.id)} aria-label="알림 닫기">
        ×
      </button>
    </div>
  )
}

export function ToastStack(): JSX.Element {
  const toasts = useUiStore((s) => s.toasts)
  const dismissToast = useUiStore((s) => s.dismissToast)

  return (
    <div className="toast-stack" aria-label="알림" role="region">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
