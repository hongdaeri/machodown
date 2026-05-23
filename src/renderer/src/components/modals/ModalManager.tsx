import { useUiStore } from '../../stores/uiStore'
import { NewFileModal } from './NewFileModal'
import { NewFolderModal } from './NewFolderModal'
import { RenameModal } from './RenameModal'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'
import { ShortcutsModal } from './ShortcutsModal'
import { EncodingModal } from './EncodingModal'
import { EolModal } from './EolModal'
import { WelcomeModal } from './WelcomeModal'
import { RecoveryDialog } from './RecoveryDialog'
import { CommandPaletteModal } from './CommandPaletteModal'
import { SettingsModal } from './SettingsModal'
import { ReplaceModal } from './ReplaceModal'
import { MergeModal } from './MergeModal'

export function ModalManager(): JSX.Element | null {
  const modal = useUiStore((s) => s.modal)

  if (!modal.type) return null

  switch (modal.type) {
    case 'newFile':
      return <NewFileModal />
    case 'newFolder':
      return <NewFolderModal />
    case 'rename':
      return <RenameModal />
    case 'confirmDelete':
      return <ConfirmDeleteModal />
    case 'shortcuts':
      return <ShortcutsModal />
    case 'encoding':
      return <EncodingModal />
    case 'eol':
      return <EolModal />
    case 'welcome':
      return <WelcomeModal />
    case 'recovery':
      return <RecoveryDialog />
    case 'commandPalette':
      return <CommandPaletteModal />
    case 'settings':
      return <SettingsModal />
    case 'replace':
      return <ReplaceModal />
    case 'merge':
      return <MergeModal />
    default:
      return null
  }
}
