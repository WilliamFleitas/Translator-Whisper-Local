import { IoCloseSharp } from 'react-icons/io5'
import { GrUpdate } from 'react-icons/gr'
import { IoCheckmarkSharp } from 'react-icons/io5'
import {
  ApiResponse,
  DefaultAudioDeviceType,
  SetVCSetupType
} from '@renderer/globalTypes/globalApi'
import SelectMenu, { MenuOptionType } from '../../../../../components/menu/SelectMenu'
import { useEffect, useState } from 'react'
import { FaRegEdit } from 'react-icons/fa'

interface SecondStepPropsType {
  currentDefaultAudioDevice: DefaultAudioDeviceType | null
  //   currentOption: MenuOptionType
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
  //   currentOption,
  optionsData,
  handleGetDefaultAudioDevice,
  handleGetVCSetupStatus,
  handleCheckIfVoicemeeterIsRunning
}: SecondStepPropsType): React.ReactElement => {
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
        handleGetDefaultAudioDevice()
      } else {
        setVcSetupMessageData({
          device_name: 'none',
          message: response.error
        })
        localStorage.setItem('User_Output_device', JSON.stringify(errorDeviceObj))
        setLockSelectedOutputDevice(errorDeviceObj)
      }
    } catch (error) {
      console.log(error)
      setVcSetupMessageData({
        device_name: 'none',
        message: error as string
      })
      localStorage.setItem('User_Output_device', JSON.stringify(errorDeviceObj))
      setLockSelectedOutputDevice(errorDeviceObj)
    } finally {
      handleGetVCSetupStatus()
    }
  }
  console.log('awewe', optionsData)
  useEffect(() => {
    const getDevice: string | null = localStorage.getItem('User_Output_device')
    const checkUserDevice: LockSelectedDeviceType | null =
      getDevice !== null ? JSON.parse(getDevice) : null
    if (optionsData.length) {
      console.log('asara', checkUserDevice)
      if (checkUserDevice !== null) {
        const findObj = optionsData.find((item) => item.value === checkUserDevice.device_name)
        console.log('asara22', findObj)
        if (findObj) {
          console.log('asara23332')
          setCurrentOption(() => {
            const optionObj = {
              label: findObj.label,
              value: findObj.value,
              id: findObj.id
            }
            handleSetupVCApp(optionObj)
            return optionObj
          })
          // setLockSelectedOutputDevice({
          //   device_name: findObj.value,
          //   lock_status: true
          // })
        }
      }
    }
  }, [optionsData])
  return (
    <div className="bg-zinc-700 w-full flex flex-col py-4 px-6 md:px-10 gap-4">
      {lockSelectedOutputDevice.lock_status ? (
        <section className="flex flex-col text-start items-start justify-start w-full h-fit gap-4">
          <div className="flex flex-row flex-wrap gap-4 text-start items-center justify-between w-full h-fit">
            <strong>Capturing audio from device:</strong>
            <dl className="flex flex-row flex-grow  text-start items-center justify-between bg-[#002634] rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
              <dt className="pl-4 ">
                <span className="">
                  {lockSelectedOutputDevice.device_name
                    ? lockSelectedOutputDevice.device_name
                    : 'none'}
                </span>
              </dt>
              <dd
                className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                  lockSelectedOutputDevice.device_name.length
                    ? 'text-green-400 border-green-400'
                    : 'text-red-400 border-red-400'
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
            <strong>Your actual default audio device is:</strong>
            <dl className="flex flex-row flex-grow  text-start items-center justify-between bg-[#002634] rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
              <dt className="pl-4 ">
                <span className="">
                  {currentDefaultAudioDevice ? currentDefaultAudioDevice.name : 'none'}
                </span>
              </dt>
              <dd
                className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                  currentDefaultAudioDevice?.name ===
                  'Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)'
                    ? 'text-green-400 border-green-400'
                    : 'text-red-400 border-red-400'
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
          <div className="flex flex-row gap-4 text-start items-center justify-between w-full h-fit">
            <strong>
              Please change it to {'"Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)"'} then click
              to update
            </strong>
            <button
              type="button"
              title="Update Default audio device"
              className="flex flex-col text-center items-center justify-start px-6 py-4 rounded-md bg-[#002634] border-2 border-green-600 text-green-600"
              onClick={() => {
                handleGetDefaultAudioDevice()
                handleCheckIfVoicemeeterIsRunning(false)
              }}
            >
              <GrUpdate className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="border px-4 py-2 rounded-md bg-[#686565]"
              onClick={() => {
                setLockSelectedOutputDevice({
                  device_name: lockSelectedOutputDevice.device_name,
                  lock_status: false
                })
              }}
            >
              <FaRegEdit className="w-5 h-5" />
            </button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col w-full h-fit text-start items-center justify-start border-b  border-zinc-600 gap-4">
          <div className="w-full">
            <strong className="text-[1.1rem]">
              {'Start by selecting the output device you want to capture audio from. '}
            </strong>
            <small className="text-[0.9rem]">
              {
                "(The output device is the one through which you're hearing your PC's audio, such as headphones or speakers.)"
              }
            </small>
          </div>
          <div className="flex flex-row flex-wrap w-full h-fit gap-y-2 gap-x-6 text-start items-center justify-between pb-4">
            <strong className="text-[0.9rem]">Output devices:</strong>
            <div className=" flex flex-col flex-grow md:flex-grow-0 md:w-fit">
              <SelectMenu
                viewScroll="initial"
                placeX="left"
                placeY="bottom"
                gap={1}
                shift={0}
                portal={true}
                position="initial"
                optionsData={optionsData ? optionsData : []}
                currentOption={currentOption}
                handleOptionChange={handleSelectedOptionChange}
                disableButton={lockSelectedOutputDevice.lock_status}
                customButton={
                  <span className="bg-[#686565] flex flex-row text-start items-center justify-center w-full h-fit py-2 px-6 rounded-md truncate text-[0.9rem]">
                    {currentOption.label}
                  </span>
                }
              />
            </div>
          </div>
          {currentOption !== null && currentOption.value !== 'none' ? (
            <div className="flex flex-col text-start items-start justify-start w-full h-fit gap-4 pb-4 text-[0.9rem]">
              <div className="flex flex-row w-fit text-start items-center gap-4">
                <button
                  type="button"
                  className="bg-[#686565] hover:bg-zinc-800 flex flex-row text-start items-center justify-start w-fit h-fit py-2 px-6 rounded-md truncate font-bold"
                  onClick={() => handleSetupVCApp()}
                  disabled={lockSelectedOutputDevice.lock_status}
                >
                  Set this devices as Output for VC
                </button>
              </div>
              <small>{vcSetupMessageData?.message}</small>
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
