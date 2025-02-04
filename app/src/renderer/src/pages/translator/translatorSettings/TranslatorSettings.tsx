import { useEffect, useState } from 'react'
import { MenuOptionType } from '../../../components/menu/SelectMenu'
import {
  ApiResponse,
  CheckVoicemeeterIsRunningType,
  DefaultAudioDeviceType,
  VCSettingsStatusType
} from '../../../globalTypes/globalApi'
import FirstStep from './vcSetup/FirstStep'
import SecondStep from './vcSetup/SecondStep'

const TranslatorSettings: React.FC = () => {
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
    const response: ApiResponse<DefaultAudioDeviceType> = await window.api.getDefaultAudioDevice()

    if (response.success) {
      setCurrentDefaultAudioDevice(response.data)
    } else {
      setCurrentDefaultAudioDevice(null)
    }
  }

  const handleGetVCSetupStatus = async (): Promise<void> => {
    const response: ApiResponse<VCSettingsStatusType> = await window.api.getVCSettingsStatus()
    console.log('responseeee', response)
    if (response.success) {
      setCurrentVCSetup(response.data)
    } else {
      setCurrentVCSetup(null)
    }
  }
  const handleCheckIfVoicemeeterIsRunning = async (updateDevices?: boolean): Promise<void> => {
    const response: ApiResponse<CheckVoicemeeterIsRunningType> =
      await window.api.getVoicemeeterApiCalls('isRunning')

    if (response.success) {
      setVoicemeeterIsRunning(response.data)
      if (updateDevices !== false && response.data.active) {
        handleGetDevices()
      }
    } else {
      setVoicemeeterIsRunning(null)
    }
  }

  const handleOpenOrCloseVCB = async (queryType: 'open' | 'close'): Promise<void> => {
    try {
      const response: ApiResponse<any> = await window.api.getVoicemeeterApiCalls(queryType)
      if (response.success) {
        handleGetDevices()
      }
    } catch (error) {
      console.error('Error handleOpenOrCloseVCB', error)
    } finally {
      handleCheckIfVoicemeeterIsRunning()
    }
  }

  useEffect(() => {
    handleCheckIfVoicemeeterIsRunning()
  }, [])
  return (
    <article className="flex flex-col text-start items-start justify-start w-full h-fit py-6 gap-4">
      <div className="flex flex-col w-full h-fit text-start items-start justify-start px-6 md:px-10 border-b-2 pb-4 border-gray-700">
        <strong className="text-[1.6rem]">
          First we need to setup the Voicemeeter Banana Configuration.
        </strong>
      </div>
      <div className="flex flex-col w-full h-fit text-start items-start justify-start border-b-2 pb-4 border-gray-700">
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
