import { app, Menu, shell, clipboard, BrowserWindow } from 'electron'
import { collectDiagnostics } from './ipc/diagnostics'

export function createMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: 'Machodown',
            submenu: [
              { role: 'about' as const, label: 'Machodown 정보' },
              { type: 'separator' as const },
              {
                label: '설정…',
                accelerator: 'Cmd+,',
                click: (_item: Electron.MenuItem, win: BrowserWindow | undefined) =>
                  win?.webContents.send('menu:settings')
              },
              { type: 'separator' as const },
              { role: 'services' as const, label: '서비스' },
              { type: 'separator' as const },
              { role: 'hide' as const, label: 'Machodown 가리기' },
              { role: 'hideOthers' as const, label: '다른 항목 가리기' },
              { role: 'unhide' as const, label: '모두 보기' },
              { type: 'separator' as const },
              { role: 'quit' as const, label: 'Machodown 종료' }
            ]
          }
        ]
      : []),
    {
      label: '파일',
      submenu: [
        {
          label: '새 파일',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: (_item, win) => win?.webContents.send('menu:newFile')
        },
        {
          label: '파일 열기…',
          accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
          click: (_item, win) => win?.webContents.send('menu:openFile')
        },
        {
          label: '폴더 열기…',
          accelerator: isMac ? 'Cmd+Shift+O' : 'Ctrl+Shift+O',
          click: (_item, win) => win?.webContents.send('menu:openFolder')
        },
        { type: 'separator' },
        {
          label: '저장',
          accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
          click: (_item, win) => win?.webContents.send('menu:save')
        },
        {
          label: '모두 저장',
          accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
          click: (_item, win) => win?.webContents.send('menu:saveAll')
        },
        { type: 'separator' },
        {
          label: '탭 닫기',
          accelerator: isMac ? 'Cmd+W' : 'Ctrl+W',
          click: (_item, win) => win?.webContents.send('menu:closeTab')
        }
      ]
    },
    {
      label: '편집',
      submenu: [
        { role: 'undo', label: '실행 취소' },
        { role: 'redo', label: '다시 실행' },
        { type: 'separator' },
        { role: 'cut', label: '잘라내기' },
        { role: 'copy', label: '복사' },
        { role: 'paste', label: '붙여넣기' },
        ...(isMac
          ? [
              { role: 'pasteAndMatchStyle' as const, label: '스타일에 맞춰 붙여넣기' },
              { role: 'delete' as const, label: '삭제' },
              { role: 'selectAll' as const, label: '전체 선택' },
              { type: 'separator' as const },
              {
                label: '음성',
                submenu: [
                  { role: 'startSpeaking' as const, label: '말하기 시작' },
                  { role: 'stopSpeaking' as const, label: '말하기 중지' }
                ]
              }
            ]
          : [
              { role: 'delete' as const, label: '삭제' },
              { type: 'separator' as const },
              { role: 'selectAll' as const, label: '전체 선택' }
            ])
      ]
    },
    {
      label: '보기',
      submenu: [
        {
          label: '사이드바 토글',
          accelerator: isMac ? 'Cmd+B' : 'Ctrl+B',
          click: (_item, win) => win?.webContents.send('menu:toggleSidebar')
        },
        {
          label: '프리뷰 토글',
          accelerator: isMac ? 'Cmd+Shift+P' : 'Ctrl+Shift+P',
          click: (_item, win) => win?.webContents.send('menu:togglePreview')
        },
        { type: 'separator' },
        { role: 'reload', label: '새로 고침' },
        { role: 'forceReload', label: '강제 새로 고침' },
        { type: 'separator' },
        { role: 'resetZoom', label: '실제 크기' },
        { role: 'zoomIn', label: '확대' },
        { role: 'zoomOut', label: '축소' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '전체 화면' }
      ]
    },
    {
      label: '창',
      submenu: [
        { role: 'minimize', label: '최소화' },
        { role: 'zoom', label: '확대/축소' },
        ...(isMac
          ? [
              { type: 'separator' as const },
              { role: 'front' as const, label: '앞으로 가져오기' },
              { type: 'separator' as const },
              { role: 'window' as const, label: '창' }
            ]
          : [{ role: 'close' as const, label: '닫기' }])
      ]
    },
    {
      role: 'help',
      label: '도움말',
      submenu: [
        {
          label: '단축키',
          accelerator: isMac ? 'Cmd+/' : 'Ctrl+/',
          click: (_item, win) => win?.webContents.send('menu:shortcuts')
        },
        { type: 'separator' },
        {
          label: '로그 폴더 열기',
          click: async () => {
            await shell.openPath(app.getPath('logs'))
          }
        },
        {
          label: '진단 정보 복사',
          click: () => {
            const d = collectDiagnostics()
            const text = [
              `Machodown ${d.appVersion}`,
              `Platform: ${d.platform}`,
              `OS: ${d.osRelease}`,
              `Electron: ${d.electronVersion}`,
              `Node: ${d.nodeVersion}`,
              `userData: ${d.userDataPath}`,
              `logs: ${d.logPath}`,
              `Time: ${d.timestamp}`
            ].join('\n')
            clipboard.writeText(text)
          }
        },
        { type: 'separator' },
        {
          label: 'GitHub',
          click: async () => {
            await shell.openExternal('https://github.com/hongpaul/machodown')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  BrowserWindow.getAllWindows().forEach((win) => {
    win.setMenu(menu)
  })
}
