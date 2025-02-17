import { useState } from 'react'
import SelectMenu, { MenuOptionType } from '../../../../../components/menu/SelectMenu'
import { FaPlay, FaStop } from 'react-icons/fa'

import { DurationTimeType } from '@renderer/globalTypes/globalApi'

const audioDevices = [
  {
    label: 'Speaker',
    value: 'speaker',
    id: 0
  },
  {
    label: 'Mic',
    value: 'mic',
    id: 1
  }
]

const timeDurationList = [
  {
    label: 'Unlimited',
    value: 'unlimited',
    id: 0
  },
  {
    label: '60 minutes',
    value: 3600,
    id: 1
  },
  {
    label: '30 minutes',
    value: 1800,
    id: 2
  },
  {
    label: '10 minutes',
    value: 600,
    id: 3
  },
  {
    label: '1 minute',
    value: 60,
    id: 4
  }
]

interface TranslatorControllerPropsType {
  isCapturingAudio: boolean
  setTranscriptionSentence: React.Dispatch<React.SetStateAction<string>>
  setTranscriptionInterim: React.Dispatch<React.SetStateAction<string>>
  setTranscriptionError: React.Dispatch<React.SetStateAction<string | null>>
  setIsCapturingAudio: React.Dispatch<React.SetStateAction<boolean>>
}
const TranslatorController = ({
  isCapturingAudio,
  setTranscriptionSentence,
  setTranscriptionInterim,
  setTranscriptionError,
  setIsCapturingAudio
}: TranslatorControllerPropsType): React.ReactElement => {
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<MenuOptionType>(audioDevices[1])
  const [selectedTimeduration, setSelectedTimeduration] = useState<MenuOptionType>(
    timeDurationList[0]
  )

  const handleSelectedAudioDeviceChange = (resObj: MenuOptionType): void => {
    console.log('selectedaudidevice')
    setSelectedAudioDevice(resObj)
  }
  const handleCaptureTimeChange = (resObj: MenuOptionType): void => {
    console.log('selectedaudidevice')
    setSelectedTimeduration(resObj)
  }

  const handleStartRecording = async (): Promise<void> => {
    try {
      setTranscriptionSentence('')
      setIsCapturingAudio(true)
      const response = await window.api.startStreaming(
        selectedAudioDevice.value as 'mic' | 'speaker',
        selectedTimeduration.value as DurationTimeType
      )
      console.log('resposos', response)
      if (response.success) {
        setTranscriptionSentence((prev) => prev.slice(0, prev.length - 2) + '.')
        setTranscriptionInterim('')
        setIsCapturingAudio(false)
      }
    } catch (err: any) {
      console.log('StartRecording error', err)
      setTranscriptionError(err.message as string)
      setIsCapturingAudio(false)
    }
  }

  const handleStopRecording = async (): Promise<void> => {
    try {
      const response = await window.api.stopStreaming()

      console.log('asdasdasd222', response)
      if (response.success) {
        setIsCapturingAudio(false)
      }
    } catch (error) {
      console.log('Rerereroerororr', error)
    }
  }
  return (
    <nav className="flex flex-row w-full h-fit text-start items-center justify-between bg-[#002634] py-4 px-4 md:px-8 gap-4 min-h-[6rem]">
      <section className="flex flex-row w-fit h-fit text-start items-center justify-start gap-4 text-[0.9rem]">
        <div className="flex flex-row text-start items-center justify-start gap-4 ">
          <strong>Capture audio from:</strong>
          <SelectMenu
            viewScroll="initial"
            placeX="left"
            placeY="bottom"
            gap={1}
            shift={0}
            portal={true}
            position="initial"
            menuType={null}
            optionsData={audioDevices}
            disableButton={isCapturingAudio}
            currentOption={selectedAudioDevice}
            handleOptionChange={handleSelectedAudioDeviceChange}
            customButton={
              <span className="bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-center w-full h-fit py-2 px-6 rounded-md text-[0.9rem] font-bold">
                {selectedAudioDevice.label}
              </span>
            }
          />
        </div>
        <div className="flex flex-row text-start items-center justify-start gap-4">
          <strong>Duration Time:</strong>
          <SelectMenu
            viewScroll="initial"
            placeX="left"
            placeY="bottom"
            gap={1}
            shift={0}
            portal={true}
            position="initial"
            disableButton={isCapturingAudio}
            optionsData={timeDurationList}
            currentOption={selectedTimeduration}
            handleOptionChange={handleCaptureTimeChange}
            customButton={
              <span className="bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-center w-full h-fit py-2 px-6 rounded-md text-[0.9rem] font-bold">
                {selectedTimeduration.label}
              </span>
            }
          />
        </div>
      </section>

      <section className="flex flex-col text-start items-center justify-start w-fit flex-grow shrink ">
        {isCapturingAudio ? (
          <button
            className="bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-center w-full h-fit py-2 px-6 rounded-md text-[0.9rem] font-bold shrink"
            title="Start recording"
            onClick={handleStopRecording}
            type="button"
          >
            <span className="hidden md:flex">{'end'}</span>{' '}
            <FaStop className="w-5 h-5 text-[#002634]" />
          </button>
        ) : (
          <button
            className="bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-center w-full h-fit py-2 px-6 rounded-md text-[0.9rem] font-bold shrink"
            title="Start recording"
            onClick={handleStartRecording}
            type="button"
          >
            <span className="hidden md:flex">{'Start'}</span>{' '}
            <FaPlay className="w-5 h-5 text-[#002634]" />
          </button>
        )}
      </section>
    </nav>
  )
}

export default TranslatorController
