import { execSync } from 'child_process'
import { existsSync, copyFileSync, chmodSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appBundle = join(root, 'node_modules/electron/dist/Electron.app')
const plist = join(appBundle, 'Contents/Info.plist')
const macosDir = join(appBundle, 'Contents/MacOS')
const originalBin = join(macosDir, 'Electron')
const renamedBin = join(macosDir, 'Machodown')

if (process.platform !== 'darwin') process.exit(0)

if (!existsSync(plist)) {
  console.log('Electron.app not found, skipping dev-rename')
  process.exit(0)
}

const pb = (cmd) => execSync(`/usr/libexec/PlistBuddy -c "${cmd}" "${plist}"`)

try {
  pb('Set :CFBundleName Machodown')
  pb('Set :CFBundleDisplayName Machodown')
} catch {
  pb('Add :CFBundleDisplayName string Machodown')
}

// Rename binary so Force Quit dialog shows "Machodown" instead of "Electron"
if (existsSync(originalBin) && !existsSync(renamedBin)) {
  copyFileSync(originalBin, renamedBin)
  chmodSync(renamedBin, 0o755)
}
if (existsSync(renamedBin)) {
  pb('Set :CFBundleExecutable Machodown')
}

console.log('dev-rename: Electron.app patched → Machodown')
