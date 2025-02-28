import { IoCloseSharp } from 'react-icons/io5'
import { GrUpdate } from 'react-icons/gr'
import { IoCheckmarkSharp } from 'react-icons/io5'
import {
  ApiResponse,
  DefaultAudioDeviceType,
  SetVCSetupType
} from '@renderer/globalTypes/globalApi'
import SelectMenu, { MenuOptionType } from '../../../../../components/menu/SelectMenu'
import { useContext, useEffect, useState } from 'react'
import { FaRegEdit } from 'react-icons/fa'
import { VCStatusContext } from '@renderer/components/context/VCContext'

interface SecondStepPropsType {
  currentDefaultAudioDevice: DefaultAudioDeviceType | null
  optionsData: MenuOptionType[]
  handleGetDefaultAudioDevice: () => void
  handleGetVCSetupStatus: () => void
  handleCheckIfVoicemeeterIsRunning: (updateDevices: boolean) => void
}

type LockSelectedDeviceType = {
  device_name: string
  lock_status: boolean
}
const SecondStep = ({
  currentDefaultAudioDevice,
  optionsData,
  handleGetDefaultAudioDevice,
  handleGetVCSetupStatus,
  handleCheckIfVoicemeeterIsRunning
}: SecondStepPropsType): React.ReactElement => {
  const { handleUpdateState } = useContext(VCStatusContext)
  const [currentOption, setCurrentOption] = useState<MenuOptionType>({
    label: 'No options',
    value: 'none',
    id: 0
  })
  const [vcSetupMessageData, setVcSetupMessageData] = useState<SetVCSetupType | null>(null)
  const [lockSelectedOutputDevice, setLockSelectedOutputDevice] = useState<LockSelectedDeviceType>({
    device_name: '',
    lock_status: false
  })

  const handleSelectedOptionChange = (data: MenuOptionType): void => {
    setCurrentOption(data)
  }

  const handleSetupVCApp = async (device_data?: MenuOptionType): Promise<void> => {
    const errorDeviceObj = {
      device_name: '',
      lock_status: false
    }
    try {
      const response: ApiResponse<SetVCSetupType> = await window.api.setVCSetup(
        device_data ? device_data.value.toString() : currentOption.value.toString()
      )
      if (response.success) {
        setVcSetupMessageData(response.data)
        localStorage.setItem(
          'User_Output_device',
          JSON.stringify({
            device_name: response.data.device_name,
            lock_status: true
          })
        )
        setLockSelectedOutputDevice({
          device_name: response.data.device_name,
          lock_status: true
        })
        handleUpdateState('lock_status', true)
        handleGetDefaultAudioDevice()
      } else {
        throw Error(response.error)
      }
    } catch (error) {
      setVcSetupMessageData({
        device_name: 'none',
        message: error as string
      })
      localStorage.setItem('User_Output_device', JSON.stringify(errorDeviceObj))
      handleUpdateState('lock_status', false)
      setLockSelectedOutputDevice(errorDeviceObj)
    } finally {
      handleGetVCSetupStatus()
    }
  }
  useEffect(() => {
    const getDevice: string | null = localStorage.getItem('User_Output_device')
    const checkUserDevice: LockSelectedDeviceType | null =
      getDevice !== null ? JSON.parse(getDevice) : null
    if (optionsData.length) {
      if (checkUserDevice !== null) {
        const findObj = optionsData.find((item) => item.value === checkUserDevice.device_name)
        if (findObj) {
          setCurrentOption(() => {
            const optionObj = {
              label: findObj.label,
              value: findObj.value,
              id: findObj.id
            }
            handleSetupVCApp(optionObj)
            return optionObj
          })
        }
      }
    }
  }, [optionsData])
  return (
    <div className="bg-secondary-background w-full flex flex-col py-4 px-6 md:px-8 gap-4">
      {lockSelectedOutputDevice.lock_status ? (
        <section className="flex flex-col text-start items-start justify-start w-full h-fit gap-4">
          <div className="flex flex-row flex-wrap gap-4 text-start items-center justify-between w-full h-fit">
            <strong className="text-xl">Capturing audio from device:</strong>
            <dl className="flex flex-row flex-grow  text-start items-center justify-between bg-primary-button rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
              <dt className="pl-4 flex flex-row justify-between flex-grow gap-4 text-start items-center  truncate text-lg">
                <span className="">
                  {lockSelectedOutputDevice.device_name
                    ? lockSelectedOutputDevice.device_name
                    : 'none'}
                </span>
                <button
                  type="button"
                  title="Update status"
                  className="flex flex-row text-start items-center justify-start border-2 border-success text-success gap-4 w-fit h-fit p-2  rounded-full bg-secondary-background hover:bg-secondary-background-hover cursor-pointer"
                  onClick={() => {
                    setLockSelectedOutputDevice({
                      device_name: lockSelectedOutputDevice.device_name,
                      lock_status: false
                    })
                    handleUpdateState('lock_status', false)
                  }}
                >
                  <FaRegEdit className="w-3 h-3" />
                </button>
              </dt>
              <dd
                className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                  lockSelectedOutputDevice.device_name.length
                    ? 'text-success border-success bg-success/15'
                    : 'text-danger border-danger bg-danger/15'
                }`}
              >
                {lockSelectedOutputDevice.device_name.length ? (
                  <>
                    <IoCheckmarkSharp className="w-5 h-5 " />
                  </>
                ) : (
                  <>
                    <IoCloseSharp className="w-5 h-5 " />
                  </>
                )}
              </dd>
            </dl>
          </div>
          <div className="flex flex-row flex-wrap gap-4 text-start items-center justify-between w-full h-fit">
            <strong className="text-xl">Your actual default audio device is:</strong>
            <dl className="flex flex-row flex-grow  text-start items-center justify-between bg-primary-button rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
              <dt className="pl-4 flex flex-row justify-between flex-grow gap-4 text-start items-center  truncate text-lg">
                <span className="">
                  {currentDefaultAudioDevice ? currentDefaultAudioDevice.name : 'none'}
                </span>
                <button
                  type="button"
                  title="Update status"
                  className="flex flex-row text-start items-center justify-start border-2 border-success text-success gap-4 w-fit h-fit p-2  rounded-full bg-secondary-background hover:bg-secondary-background-hover cursor-pointer"
                  onClick={() => {
                    handleGetDefaultAudioDevice()
                    handleCheckIfVoicemeeterIsRunning(false)
                  }}
                >
                  <GrUpdate className="w-3 h-3" />
                </button>
              </dt>
              <dd
                className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                  currentDefaultAudioDevice?.name ===
                  'Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)'
                    ? 'text-success border-success bg-success/15'
                    : 'text-danger border-danger bg-danger/15'
                }`}
              >
                {currentDefaultAudioDevice?.name ===
                'Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)' ? (
                  <>
                    <IoCheckmarkSharp className="w-5 h-5 " />
                  </>
                ) : (
                  <>
                    <IoCloseSharp className="w-5 h-5 " />
                  </>
                )}
              </dd>
            </dl>
          </div>

          <div className="flex flex-row gap-4 text-center items-center justify-center w-full h-fit">
            <strong
              className={`text-xl ${
                currentDefaultAudioDevice?.name !==
                'Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)'
                  ? 'text-danger'
                  : 'text-success'
              }`}
            >
              {currentDefaultAudioDevice?.name !==
              'Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)'
                ? 'Please change it to Voicemeeter "AUX Input (VB-Audio Voicemeeter VAIO)" then click to update'
                : "Now  you're available to capture audio from speaker"}
            </strong>
          </div>
        </section>
      ) : (
        <section className="flex flex-col w-full h-fit text-start items-center justify-start border-b  border-primary-background gap-4 pb-4">
          <div className="w-full">
            <strong className="text-3xl ">
              Start by selecting the output device you want to capture audio from.
            </strong>
          </div>
          <div className="flex flex-row flex-wrap w-full h-fit gap-y-2 gap-x-6 text-start items-center justify-between pb-4">
            <strong className="text-lg">Output devices:</strong>
            <div className=" flex flex-col flex-grow md:flex-grow-0 md:w-fit">
              <SelectMenu
                viewScroll="close"
                placeX="right"
                placeY="bottom"
                gap={1}
                shift={0}
                portal={false}
                position="anchor"
                enableArrow
                optionsData={optionsData ? optionsData : []}
                currentOption={currentOption}
                handleOptionChange={handleSelectedOptionChange}
                disableButton={lockSelectedOutputDevice.lock_status}
                customButtonClassName={
                  'bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-full h-fit py-2 px-6 rounded-md text-lg font-bold text-white gap-4'
                }
                customButtonContent={currentOption.label}
                customButtonTitle={'Select output device'}
              />
            </div>
          </div>
          {currentOption !== null && currentOption.value !== 'none' ? (
            <div className="flex flex-col text-start items-start justify-start w-full h-fit gap-4 pb-4 text-lg">
              <div className="flex flex-row w-fit text-start items-center gap-4">
                <button
                  type="button"
                  className="bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-start w-fit h-fit py-2 px-6 rounded-md truncate font-bold text-lg"
                  onClick={() => handleSetupVCApp()}
                  disabled={lockSelectedOutputDevice.lock_status}
                >
                  Set this devices as Output for VC
                </button>
              </div>
              <small className="text-base">{vcSetupMessageData?.message}</small>
            </div>
          ) : (
            <></>
          )}
        </section>
      )}
    </div>
  )
}

export default SecondStep
