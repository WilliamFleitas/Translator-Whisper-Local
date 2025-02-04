import { IpcRendererEvent } from 'electron'

export interface DefaultAudioDeviceType {
  name: string
  id: string
}

export interface CheckVoicemeeterIsRunningType {
  active: boolean
  message: string
}

export interface VCSettingsStatusType {
  strip_A1: boolean
  strip_B1: boolean
  bus_0_name: string
}

export interface SetVCSetupType {
  device_name: string
  message: string
}

export interface StartStreamingType {
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
  startStreaming: (device: 'speaker' | 'mic') => Promise<ApiResponse<StartStreamingType>>
  getAudioDevices: () => Promise<ApiResponse<DefaultAudioDeviceType[]>>
  setVoicemeeterOutput: (deviceName: string, deviceIndex: number) => Promise<ApiResponse<string>>
  getDefaultAudioDevice: () => Promise<ApiResponse<DefaultAudioDeviceType>>
  getVoicemeeterApiCalls: (
    queryType: 'isRunning' | 'open' | 'close'
  ) => Promise<ApiResponse<CheckVoicemeeterIsRunningType | any>>
  getVCSettingsStatus: () => Promise<ApiResponse<VCSettingsStatusType>>
  setVCSetup: (device_name: string) => Promise<ApiResponse<SetVCSetupType>>

  on: (event: string, listener: (event: IpcRendererEvent, data: any) => void) => void
  removeListener: (event: string, listener: (event: IpcRendererEvent, data: any) => void) => void
}

declare global {
  interface Window {
    api: Api
  }
}
