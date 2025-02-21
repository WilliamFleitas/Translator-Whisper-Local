import { useState } from 'react'
import SelectMenu, { MenuOptionType } from '../../../../../components/menu/SelectMenu'
import { FaPlay, FaStop } from 'react-icons/fa'

import {
  AudioLanguageType,
  AvailableModelsType,
  DurationTimeType,
  WhisperModelListType
} from '@renderer/globalTypes/globalApi'
import { toast } from 'react-toastify'

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
const languages = [
  { id: 1, value: 'en', label: 'English' },
  { id: 2, value: 'es', label: 'Spanish' },
  { id: 3, value: 'fr', label: 'French' },
  { id: 4, value: 'de', label: 'German' },
  { id: 5, value: 'it', label: 'Italian' },
  { id: 6, value: 'pt', label: 'Portuguese' },
  { id: 7, value: 'ru', label: 'Russian' },
  { id: 8, value: 'ar', label: 'Arabic' },
  { id: 9, value: 'zh', label: 'Chinese' },
  { id: 10, value: 'ja', label: 'Japanese' },
  { id: 11, value: 'ko', label: 'Korean' },
  { id: 12, value: 'hi', label: 'Hindi' },
  { id: 13, value: 'tr', label: 'Turkish' },
  { id: 14, value: 'pl', label: 'Polish' },
  { id: 15, value: 'nl', label: 'Dutch' },
  { id: 16, value: 'sv', label: 'Swedish' },
  { id: 17, value: 'da', label: 'Danish' },
  { id: 18, value: 'no', label: 'Norwegian' },
  { id: 19, value: 'fi', label: 'Finnish' },
  { id: 20, value: 'cs', label: 'Czech' }
]
interface TranslatorControllerPropsType {
  isCapturingAudio: boolean
  selectedModel: AvailableModelsType | null
  setTranscriptionSentence: React.Dispatch<React.SetStateAction<string>>
  setIsCapturingAudio: React.Dispatch<React.SetStateAction<boolean>>
}
const TranslatorController = ({
  isCapturingAudio,
  selectedModel,
  setTranscriptionSentence,
  setIsCapturingAudio
}: TranslatorControllerPropsType): React.ReactElement => {
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<MenuOptionType>(audioDevices[1])
  const [selectedTimeduration, setSelectedTimeduration] = useState<MenuOptionType>(
    timeDurationList[0]
  )
  const [selectedLanguage, setSelectedLanguage] = useState<MenuOptionType>(languages[0])

  const handleSelectedAudioDeviceChange = (resObj: MenuOptionType): void => {
    setSelectedAudioDevice(resObj)
  }
  const handleCaptureTimeChange = (resObj: MenuOptionType): void => {
    setSelectedTimeduration(resObj)
  }
  const handleSelectedLanguageChange = (resObj: MenuOptionType): void => {
    setSelectedLanguage(resObj)
  }
  const handleStartRecording = async (): Promise<void> => {
    try {
      const processDevice = localStorage.getItem('process_device')
      setTranscriptionSentence('')
      setIsCapturingAudio(true)
      const response = await window.api.startStreaming(
        selectedAudioDevice.value as 'mic' | 'speaker',
        selectedTimeduration.value as DurationTimeType,
        processDevice === 'nvidia' ? 'cuda' : processDevice === 'amd' ? 'hip' : 'cpu',
        selectedModel && selectedModel.model
          ? (selectedModel.model as WhisperModelListType)
          : 'tiny',
        selectedLanguage.value as AudioLanguageType
      )
      if (response.success) {
        if (response.data.status !== undefined && response.data.status === 1) {
          setIsCapturingAudio(false)
        }
      } else {
        throw Error(response.error)
      }
    } catch (err: any) {
      setIsCapturingAudio(false)
      toast.update(0, {
        render: `${err.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      })
    }
  }

  const handleStopRecording = async (): Promise<void> => {
    try {
      await window.api.stopStreaming()
      setIsCapturingAudio(false)
    } catch (error: any) {
      toast.update(1, {
        render: `${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      })
    }
  }
  return (
    <nav className=" bg-[#002634] py-4 px-4 md:px-8 gap-8 flex flex-col sm:flex-row w-full justify-between items-stretch text-start relative">
      <section className="flex flex-row flex-wrap  w-fit h-fit text-start items-center justify-between gap-4 text-[0.9rem] flex-grow">
        <div className="flex flex-row flex-grow lg:flex-grow-0 text-start items-center justify-between gap-4 whitespace-nowrap">
          <strong>Capture audio from:</strong>
          <SelectMenu
            viewScroll="close"
            placeX="right"
            placeY="bottom"
            gap={1}
            shift={0}
            portal={true}
            position="anchor"
            optionsData={audioDevices}
            disableButton={selectedModel === null ? true : isCapturingAudio}
            currentOption={selectedAudioDevice}
            handleOptionChange={handleSelectedAudioDeviceChange}
            enableArrow={true}
            customButtonClassName={
              'bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-between w-full h-fit py-2 px-4 rounded-md text-[0.9rem] font-bold text-white gap-4'
            }
            customButtonContent={selectedAudioDevice.label}
            customButtonTitle={`Capture audio from speaker or mic`}
          />
        </div>
        <div className="flex flex-row flex-grow lg:flex-grow-0 text-start items-center justify-between gap-4 whitespace-nowrap">
          <strong>Duration Time:</strong>
          <SelectMenu
            viewScroll="initial"
            placeX="right"
            placeY="bottom"
            gap={1}
            shift={0}
            portal={true}
            position="initial"
            disableButton={selectedModel === null ? true : isCapturingAudio}
            optionsData={timeDurationList}
            currentOption={selectedTimeduration}
            handleOptionChange={handleCaptureTimeChange}
            enableArrow={true}
            customButtonClassName={
              'bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-between w-full h-fit py-2 px-4 rounded-md text-[0.9rem] font-bold text-white gap-4'
            }
            customButtonContent={selectedTimeduration.label}
            customButtonTitle={`Duration Time`}
          />
        </div>
        <div className="flex flex-row flex-grow lg:flex-grow-0 text-start items-center justify-between gap-4 whitespace-nowrap">
          <strong>Select Language:</strong>
          <SelectMenu
            viewScroll="initial"
            placeX="right"
            placeY="bottom"
            gap={1}
            shift={0}
            portal={true}
            position="initial"
            disableButton={selectedModel === null ? true : isCapturingAudio}
            optionsData={languages}
            currentOption={selectedLanguage}
            handleOptionChange={handleSelectedLanguageChange}
            enableArrow={true}
            customButtonClassName={
              'bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-between w-full h-fit py-2 px-4 rounded-md text-[0.9rem] font-bold text-white gap-4'
            }
            customButtonContent={selectedLanguage.label}
            customButtonTitle={`Select Language`}
          />
        </div>
      </section>

      <section className="min-h-full md:max-w-[30rem] flex-grow">
        {isCapturingAudio ? (
          <button
            className="bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-start items-center justify-center w-full min-w-[15rem] h-full flex-grow py-2 px-6 rounded-md text-[0.9rem] font-bold"
            title="Stop recording"
            onClick={handleStopRecording}
            type="button"
          >
            <span className="hidden md:flex text-[0.9rem]">{'End recording'}</span>{' '}
            <FaStop className="w-4 h-4 text-white" />
          </button>
        ) : (
          <button
            className="bg-[#414040] hover:bg-[#2c2c2c] flex flex-row text-center items-center justify-center w-full min-w-[15rem] h-full flex-grow py-2 px-6 rounded-md text-[0.9rem] font-bold gap-4"
            title={`${selectedModel === null ? 'First Select a model' : 'Start recording'}`}
            onClick={handleStartRecording}
            type="button"
            disabled={selectedModel === null ? true : false}
          >
            <span className="hidden md:flex text-[0.9rem]">{'Start recording'}</span>{' '}
            <FaPlay className="w-4 h-4 text-white" />
          </button>
        )}
      </section>
      {selectedModel === null ? (
        <div className="absolute top-0 bg-[#002634] opacity-90 w-full h-full left-0 text-center items-center justify-center">
          <strong className="h-full text-center items-center justify-center flex">
            First Select a model..
          </strong>
        </div>
      ) : (
        <></>
      )}
    </nav>
  )
}

export default TranslatorController
