import { registerFsHandlers } from './fs'
import { registerDialogHandlers } from './dialog'
import { registerSettingsHandlers } from './settings'
import { registerSessionHandlers } from './session'
import { registerAppHandlers } from './app'
import { registerShellHandlers } from './shell'
import { registerWatchHandlers } from './watch'
import { registerBackupHandlers } from './backup'
import { registerDiagnosticsHandlers } from './diagnostics'
import { registerWorkspaceHandlers } from './workspace'
import { registerRecentHandlers } from './recent'
import { registerThemeHandlers } from './theme'
import { registerSearchHandlers } from './search'
export function registerIpcHandlers() {
  registerFsHandlers()
  registerDialogHandlers()
  registerSettingsHandlers()
  registerSessionHandlers()
  registerAppHandlers()
  registerShellHandlers()
  registerWatchHandlers()
  registerBackupHandlers()
  registerDiagnosticsHandlers()
  registerWorkspaceHandlers()
  registerRecentHandlers()
  registerThemeHandlers()
  registerSearchHandlers()
}
