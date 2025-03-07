import { useContext, useEffect, useState } from 'react'
import { MenuOptionType } from '../../../../components/menu/SelectMenu'
import {
  ApiResponse,
  CheckVoicemeeterIsRunningType,
  DefaultAudioDeviceType,
  VCSettingsStatusType
} from '../../../../globalTypes/globalApi'
import FirstStep from './vcSetup/FirstStep'
import SecondStep from './vcSetup/SecondStep'
import { toast } from 'react-toastify'
import { VCStatusContext } from '../../../../components/context/VCContext'
const TranslatorSettings: React.FC = () => {
  const { handleUpdateState } = useContext(VCStatusContext)

  const [optionsData, setOptionsData] = useState<MenuOptionType[]>([])

  const [currentDefaultAudioDevice, setCurrentDefaultAudioDevice] =
    useState<DefaultAudioDeviceType | null>(null)

  const [voicemeeterIsRunning, setVoicemeeterIsRunning] =
    useState<CheckVoicemeeterIsRunningType | null>(null)

  const [currentVCSetup, setCurrentVCSetup] = useState<VCSettingsStatusType | null>(null)

  const handleGetDevices = async (): Promise<void> => {
    const response = await window.api.getAudioDevices()
    if (response.success) {
      setOptionsData(
        response.data.map((device) => ({
          label: device.name,
          value: device.name,
          id: device.id
        }))
      )
    } else {
      setOptionsData([
        {
          label: 'No options',
          value: 'none',
          id: 0
        }
      ])
    }
  }

  const handleGetDefaultAudioDevice = async (): Promise<void> => {
    try {
      const response: ApiResponse<DefaultAudioDeviceType> = await window.api.getDefaultAudioDevice()

      if (response.success) {
        setCurrentDefaultAudioDevice(response.data)
        handleUpdateState(
          'default_audio_device',
          response.data.name === 'Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)' ? true : false
        )
      } else {
        throw Error(response.error)
      }
    } catch (error) {
      setCurrentDefaultAudioDevice(null)
      handleUpdateState('default_audio_device', false)
    }
  }

  const handleGetVCSetupStatus = async (): Promise<void> => {
    const response: ApiResponse<VCSettingsStatusType> = await window.api.getVCSettingsStatus()
    if (response.success) {
      setCurrentVCSetup(response.data)
    } else {
      setCurrentVCSetup(null)
    }
  }
  const handleCheckIfVoicemeeterIsRunning = async (updateDevices?: boolean): Promise<void> => {
    try {
      const response: ApiResponse<CheckVoicemeeterIsRunningType> =
        await window.api.getVoicemeeterApiCalls('isRunning')
      if (response.success) {
        setVoicemeeterIsRunning(response.data)
        handleUpdateState(
          'is_running',
          response.data.active !== undefined ? response.data.active : false
        )
        if (updateDevices !== false && response.data.active) {
          handleGetDevices()
        }
      } else {
        throw Error(response.error)
      }
    } catch (error: any) {
      toast.error(`${error.message}`, {
        isLoading: false,
        autoClose: 5000
      })
    }
  }

  const handleOpenOrCloseVCB = async (queryType: 'open' | 'close'): Promise<void> => {
    try {
      const response: ApiResponse<any> = await window.api.getVoicemeeterApiCalls(queryType)
      if (response.success) {
        handleGetDevices()
      }
    } catch (error: any) {
      toast.error(`${error.message}`, {
        isLoading: false,
        autoClose: 5000
      })
    } finally {
      handleCheckIfVoicemeeterIsRunning()
    }
  }

  useEffect(() => {
    handleCheckIfVoicemeeterIsRunning()
  }, [])
  return (
    <article className="flex flex-col text-start items-start justify-start w-full h-fit mt-auto py-6 gap-4 bg-secondary-background pb-10">
      <div className="flex flex-col w-full h-fit text-start items-start justify-start px-4 md:px-8 pb-2 ">
        <strong className="text-3xl ">
          Set up Voicemeeter Banana if you want to capture speaker audio.
        </strong>
      </div>
      <div className="flex flex-col w-full h-fit text-start items-start justify-start pb-4">
        <FirstStep
          voicemeeterIsRunning={voicemeeterIsRunning}
          handleCheckIfVoicemeeterIsRunning={handleCheckIfVoicemeeterIsRunning}
          handleOpenOrCloseVCB={handleOpenOrCloseVCB}
          currentVCSetup={currentVCSetup}
        />
      </div>

      {voicemeeterIsRunning === null ||
      (voicemeeterIsRunning !== null && voicemeeterIsRunning.active === false) ? (
        <></>
      ) : (
        <SecondStep
          currentDefaultAudioDevice={currentDefaultAudioDevice}
          optionsData={optionsData}
          handleCheckIfVoicemeeterIsRunning={handleCheckIfVoicemeeterIsRunning}
          handleGetDefaultAudioDevice={handleGetDefaultAudioDevice}
          handleGetVCSetupStatus={handleGetVCSetupStatus}
        />
      )}
    </article>
  )
}

export default TranslatorSettings
