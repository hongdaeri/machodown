import { contextBridge, ipcRenderer } from 'electron'
const ALLOWED_INVOKE_CHANNELS = [
  'fs:readFile',
  'fs:writeFile',
  'fs:createFile',
  'fs:rename',
  'fs:trash',
  'fs:readDirectory',
  'fs:stat',
  'fs:mkdir',
  'fs:scanMdFolders',
  'fs:searchFiles',
  'dialog:openFile',
  'dialog:openDirectory',
  'dialog:saveFile',
  'watch:add',
  'watch:remove',
  'settings:get',
  'settings:set',
  'session:get',
  'session:save',
  'backup:list',
  'backup:recover',
  'backup:delete',
  'backup:clearAll',
  'backup:createManual',
  'backup:createAuto',
  'backup:createPreSave',
  'diagnostics:collect',
  'app:launchType',
  'app:getVersion',
  'app:reportError',
  'shell:openExternal',
  'workspace:getFolders',
  'workspace:addFolder',
  'workspace:removeFolder',
  'recent:getFiles',
  'recent:addFile',
  'nativeTheme:get'
]
const ALLOWED_ON_CHANNELS = [
  'menu:newFile',
  'menu:openFile',
  'menu:openFolder',
  'menu:save',
  'menu:saveAs',
  'menu:saveAll',
  'menu:shortcuts',
  'menu:toggleSidebar',
  'menu:togglePreview',
  'menu:closeTab',
  'menu:settings',
  'watch:changed',
  'watch:added',
  'watch:removed',
  'backup:recoveryAvailable',
  'theme:nativeChanged'
]
const api = {
  invoke: (channel, ...args) => {
    if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
      return Promise.reject(new Error(`IPC channel not allowed: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },
  on: (channel, listener) => {
    if (!ALLOWED_ON_CHANNELS.includes(channel)) {
      throw new Error(`IPC channel not allowed: ${channel}`)
    }
    const wrapped = (_event, ...args) => listener(...args)
    ipcRenderer.on(channel, wrapped)
    return () => ipcRenderer.removeListener(channel, wrapped)
  },
  once: (channel, listener) => {
    if (!ALLOWED_ON_CHANNELS.includes(channel)) {
      throw new Error(`IPC channel not allowed: ${channel}`)
    }
    ipcRenderer.once(channel, (_event, ...args) => listener(...args))
  }
}
contextBridge.exposeInMainWorld('api', api)
