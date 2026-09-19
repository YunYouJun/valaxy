import type { DesktopApi, DesktopState } from '../shared/types'
import { contextBridge, ipcRenderer } from 'electron'

const api: DesktopApi = {
  loginCloudflare: () => ipcRenderer.invoke('desktop:cloudflare-login'),
  connectPublishTarget: (accountId, name) => ipcRenderer.invoke('desktop:publish-target', accountId, name),
  publishSite: () => ipcRenderer.invoke('desktop:publish'),
  openPublishedSite: () => ipcRenderer.invoke('desktop:open-published'),
  createBlog: options => ipcRenderer.invoke('desktop:create-blog', options),
  installDependencies: () => ipcRenderer.invoke('desktop:install'),
  getState: () => ipcRenderer.invoke('desktop:state'),
  openProject: root => ipcRenderer.invoke('desktop:open-project', root),
  startPreview: () => ipcRenderer.invoke('desktop:start-preview'),
  stopPreview: () => ipcRenderer.invoke('desktop:stop-preview'),
  buildSite: () => ipcRenderer.invoke('desktop:build'),
  cancelBuild: () => ipcRenderer.invoke('desktop:cancel-build'),
  openOutput: () => ipcRenderer.invoke('desktop:open-output'),
  openPreview: () => ipcRenderer.invoke('desktop:open-preview'),
  onState(listener) {
    const receive = (_event: Electron.IpcRendererEvent, state: DesktopState) => listener(state)
    ipcRenderer.on('desktop:state', receive)
    return () => ipcRenderer.removeListener('desktop:state', receive)
  },
}
contextBridge.exposeInMainWorld('valaxyDesktop', api)
