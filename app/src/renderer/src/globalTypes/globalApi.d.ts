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
export type AvailableModelsType = {
  model: string
  installed: boolean
}
export type DownloadModelStatusType = {
  model_name: string
  status: number
  message: string
}
export interface WhisperHelpersType {
  type: 'get_available_models' | 'download_model'
  available_models?: AvailableModelsType[]
  download_model_status?: DownloadModelStatusType
}
export type HelperNameType = 'get_available_models' | 'download_model'
export type WhisperModelListType =
  | 'tiny'
  | 'base'
  | 'small'
  | 'medium'
  | 'large-v1'
  | 'large-v2'
  | 'large-v3'
  | 'large'
  | 'large-v3-turbo'
  | 'turbo'
  | 'tiny.en'
  | 'base.en'
  | 'small.en'
  | 'medium.en'
export type ApiResponse<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
export type DurationTimeType = 'unlimited' | 60 | 600 | 1800 | 3600
export interface Api {
  checkDependencies: () => Promise<any>
  whisperHelpers: (
    helperName: HelperNameType,
    model_name?: WhisperModelListType
  ) => Promise<ApiResponse<WhisperHelpersType>>
  startStreaming: (
    device: 'speaker' | 'mic',
    duration: DurationTimeType
  ) => Promise<ApiResponse<StartStreamingType>>
  stopStreaming: () => Promise<ApiResponse<{ status: string }>>
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
