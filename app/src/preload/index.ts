import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface AudioDeviceDataType {
  name: string
  id: number
}

interface DefaultAudioDeviceType {
  name: string
  id: string
}

interface CheckVoicemeeterIsRunningType {
  active: boolean
  message: string
}

interface VCSettingsStatusType {
  strip_A1: boolean
  strip_B1: boolean
  bus_0_name: string
}

interface SetVCSetupType {
  device_name: string
  message: string
}

interface StartStreamingType {
  sentence: string
  words: { word: string }[]
  channel_info: {
    is_final: boolean
    speech_final: boolean
    from_finalize: boolean
  }
}

export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

export interface Api {
  startStreaming: (
    device: 'speaker' | 'mic',
    durationTime: 'unlimited' | 60 | 600 | 1800 | 3600
  ) => Promise<ApiResponse<StartStreamingType>>
  stopStreaming: () => Promise<ApiResponse<{ status: string }>>
  getAudioDevices: () => Promise<ApiResponse<AudioDeviceDataType[]>>
  getDefaultAudioDevice: () => Promise<ApiResponse<DefaultAudioDeviceType>>
  getVoicemeeterApiCalls: (
    queryType: 'isRunning' | 'open' | 'close'
  ) => Promise<ApiResponse<CheckVoicemeeterIsRunningType>>
  getVCSettingsStatus: () => Promise<ApiResponse<VCSettingsStatusType>>
  setVCSetup: (device_name: string) => Promise<ApiResponse<SetVCSetupType>>

  on: (event: string, listener: (event: Electron.IpcRendererEvent, data: any) => void) => void
  removeListener: (
    event: string,
    listener: (event: Electron.IpcRendererEvent, data: any) => void
  ) => void
}

const api: Api = {
  startStreaming: async (device, durationTime) => {
    return await ipcRenderer.invoke('start-streaming', device, durationTime)
  },
  stopStreaming: async () => {
    return await ipcRenderer.invoke('stop-streaming')
  },
  getAudioDevices: async () => {
    return await ipcRenderer.invoke('find-audio-devices')
  },
  getDefaultAudioDevice: async () => {
    return await ipcRenderer.invoke('find_default_audio_device')
  },
  getVoicemeeterApiCalls: async (queryType) => {
    return await ipcRenderer.invoke('voicemeeter-api-calls', queryType)
  },
  getVCSettingsStatus: async () => {
    return await ipcRenderer.invoke('get_VC_settings_status')
  },
  setVCSetup: async (device_name) => {
    return await ipcRenderer.invoke('set_VC_setup', device_name)
  },

  on: (event, listener) => {
    ipcRenderer.on(event, listener)
  },
  removeListener: (event, listener) => {
    ipcRenderer.removeListener(event, listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
