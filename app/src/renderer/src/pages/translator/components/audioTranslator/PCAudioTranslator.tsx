import {
  ApiResponse,
  AvailableModelsType,
  StartStreamingType
} from '../../../../globalTypes/globalApi'
import { useEffect, useState } from 'react'
import TranslatorTextarea from './assets/TranslatorTextarea'
import WhisperModels from './assets/WhisperModels'
import { toast } from 'react-toastify'
import TranslatorSettings from '../translatorSettings/TranslatorSettings'

const PCAudioTranslator: React.FC = () => {
  const [transcriptionSentence, setTranscriptionSentence] = useState<string>('')
  const [isCapturingAudio, setIsCapturingAudio] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<AvailableModelsType | null>(null)
  useEffect(() => {
    const handleStreamingData = (_event: any, data: ApiResponse<StartStreamingType>): void => {
      if (data.success) {
        if (data.data.status !== undefined && data.data.status === 0) {
          setTranscriptionSentence((prev) => {
            return prev + data.data.transcription
          })
        }
      } else {
        toast.update(1, {
          render: `${data.error}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000
        })
      }
    }

    const handleStreamingError = (_event: any, data: any): void => {
      toast.update(1, {
        render: `${data.error}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      })
    }

    window.api.on('streaming-data', handleStreamingData)
    window.api.on('streaming-error', handleStreamingError)

    return (): void => {
      window.api.removeListener('streaming-data', handleStreamingData)
      window.api.removeListener('streaming-error', handleStreamingError)
    }
  }, [])
  return (
    <article className=" flex flex-col text-start items-start justify-start w-full h-full gap-4">
      <WhisperModels selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

      <div className="flex flex-col w-full h-full text-start items-center justify-start px-4 md:px-8 gap-4 py-6">
        <TranslatorTextarea
          translatorContent={transcriptionSentence}
          selectedModel={selectedModel}
          isCapturingAudio={isCapturingAudio}
          setIsCapturingAudio={setIsCapturingAudio}
          setTranscriptionSentence={setTranscriptionSentence}
        />
      </div>

      <div className="flex flex-col w-full h-full text-start items-start justify-start ">
        <TranslatorSettings />
      </div>
    </article>
  )
}

export default PCAudioTranslator
