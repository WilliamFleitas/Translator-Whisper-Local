import { useContext, useEffect, useState } from 'react'
import SelectMenu, { MenuOptionType } from '../../../../../components/menu/SelectMenu'
import { FaPlay, FaStop, FaMicrophone, FaLock } from 'react-icons/fa'
import { HiSpeakerWave } from 'react-icons/hi2'
import { GiDuration } from 'react-icons/gi'
import {
  TbTimeDuration60,
  TbTimeDuration30,
  TbTimeDuration10,
  TbTimeDuration0
} from 'react-icons/tb'

import {
  AudioLanguageType,
  AvailableModelsType,
  DurationTimeType,
  WhisperModelListType
} from '@renderer/globalTypes/globalApi'
import { toast } from 'react-toastify'
import { VCStatusContext } from '@renderer/components/context/VCContext'
import DefaultLoading from '@renderer/components/loading/DefaultLoading'

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
export const languages = [
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
  transcriptionIsLoading: boolean
  selectedAzureLanguage: MenuOptionType
  setTranscriptionSentence: React.Dispatch<React.SetStateAction<string>>
  setTranslationSentence: React.Dispatch<React.SetStateAction<string>>
  setIsCapturingAudio: React.Dispatch<React.SetStateAction<boolean>>
  setTranslationError: React.Dispatch<React.SetStateAction<string | null>>
  setTranscriptionIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}
const TranslatorController = ({
  isCapturingAudio,
  selectedAzureLanguage,
  selectedModel,
  transcriptionIsLoading,
  setTranscriptionSentence,
  setTranslationSentence,
  setIsCapturingAudio,
  setTranslationError,
  setTranscriptionIsLoading
}: TranslatorControllerPropsType): React.ReactElement => {
  const { state } = useContext(VCStatusContext)
  const audioDevices = [
    {
      label: 'Speaker',
      value: 'speaker',
      id: 0,
      disabled: state.default_audio_device && state.is_running && state.lock_status ? false : true,
      disabledTitle: 'Run Voicemeeter to unlock'
    },
    {
      label: 'Mic',
      value: 'mic',
      id: 1
    }
  ]

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
      setTranscriptionIsLoading(true)
      setTranscriptionSentence('')
      setTranslationSentence('')
      setTranslationError(null)
      setIsCapturingAudio(true)
      const response = await window.api.startStreaming(
        selectedAudioDevice.value as 'mic' | 'speaker',
        selectedTimeduration.value as DurationTimeType,
        processDevice === 'nvidia' ? 'cuda' : processDevice === 'amd' ? 'hip' : 'cpu',
        selectedModel && selectedModel.model
          ? (selectedModel.model as WhisperModelListType)
          : 'tiny',
        selectedLanguage.value as AudioLanguageType,
        selectedAzureLanguage.value.toString()
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
      toast.error(`handleStartRecording ${err.message}`, {
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
      toast.error(`handleStopRecording ${error.message}`, {
        isLoading: false,
        autoClose: 5000
      })
    }
  }

  useEffect(() => {
    if (selectedAudioDevice.value === 'speaker') {
      if (!state.default_audio_device || !state.is_running || !state.lock_status) {
        handleSelectedAudioDeviceChange(audioDevices[1])
      }
    }
  }, [state])
  return (
    <nav className="py-3 px-4 gap-8 flex flex-col sm:flex-row w-full justify-between items-stretch text-start relative bg-secondary-background">
      <section className="flex flex-row w-full md:w-fit h-fit text-start items-center justify-between md:justify-start  gap-4 text-lg ">
        <div className="flex flex-row flex-grow lg:flex-grow-0 text-start items-center justify-between gap-4 whitespace-nowrap">
          <SelectMenu
            viewScroll="close"
            placeX="left"
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
              'bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-fit h-fit py-2 px-3 rounded-full text-lg font-bold text-white gap-3'
            }
            customIcon={
              selectedAudioDevice.value === 'mic' ? (
                <FaMicrophone className="w-5 h-5 " />
              ) : (
                <HiSpeakerWave className="w-5 h-5 " />
              )
            }
            customButtonTitle={`Capture audio from speaker or mic`}
          />
        </div>
        <div className="flex flex-row flex-grow lg:flex-grow-0 text-start items-center justify-between gap-4 whitespace-nowrap">
          <SelectMenu
            viewScroll="initial"
            placeX="left"
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
              'bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-fit h-fit py-2 px-3 rounded-full text-lg font-bold text-white gap-3'
            }
            customIcon={
              selectedTimeduration.value === 'unlimited' ? (
                <GiDuration className="w-5 h-5 " />
              ) : selectedTimeduration.value === 3600 ? (
                <TbTimeDuration60 className="w-5 h-5 " />
              ) : selectedTimeduration.value === 1800 ? (
                <TbTimeDuration30 className="w-5 h-5 " />
              ) : selectedTimeduration.value === 600 ? (
                <TbTimeDuration10 className="w-5 h-5 " />
              ) : (
                <TbTimeDuration0 className="w-5 h-5 " />
              )
            }
            customButtonTitle={`Duration Time`}
          />
        </div>
        <div className="flex flex-row flex-grow lg:flex-grow-0 text-start items-center justify-between gap-4 whitespace-nowrap">
          <SelectMenu
            viewScroll="initial"
            placeX="left"
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
              'bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-fit h-fit py-2 px-3 rounded-full text-lg font-bold text-white gap-3 uppercase'
            }
            customButtonContent={selectedLanguage.value.toString()}
            customButtonTitle={`Select Language`}
          />
        </div>

        {transcriptionIsLoading ? (
          <button
            className="bg-primary-button  flex flex-row text-start items-center justify-between w-fit h-full py-2 px-4 rounded-md text-lg font-bold uppercase text-white gap-2"
            title={`Loading..`}
            type="button"
            disabled={true}
          >
            <DefaultLoading size={1.25} color={'#fff'} />
          </button>
        ) : isCapturingAudio ? (
          <button
            className="bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-fit h-fit py-2 px-4 rounded-md text-lg font-bold uppercase text-white gap-2"
            title="Stop recording"
            onClick={handleStopRecording}
            type="button"
          >
            <FaStop className="w-5 h-5 text-danger" />
          </button>
        ) : (
          <button
            className="bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-fit h-fit py-2 px-4 rounded-md text-lg font-bold uppercase text-white gap-2"
            title={`${selectedModel === null ? 'First Select a model' : 'Start recording'}`}
            onClick={handleStartRecording}
            type="button"
            disabled={selectedModel === null ? true : false}
          >
            <FaPlay className="w-5 h-5 text-blue-400" />
          </button>
        )}
      </section>

      {selectedModel === null ? (
        <div className="absolute top-0 bg-secondary-background/70 w-full h-full left-0 text-center items-center justify-center">
          <strong className="h-full text-center items-center justify-center flex flex-row gap-2 text-lg">
            <FaLock className="w-5 h-5 " /> Select a model.
          </strong>
        </div>
      ) : (
        <></>
      )}
    </nav>
  )
}

export default TranslatorController
