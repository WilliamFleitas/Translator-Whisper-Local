import {
  ApiResponse,
  AvailableModelsType,
  StartStreamingType
} from '../../../../globalTypes/globalApi'
import { useEffect, useState } from 'react'
import TranslatorTextarea from './assets/TranslatorTextarea'
import TranslatorController from './assets/TranslatorController'
import WhisperModels from './assets/WhisperModels'
import { toast } from 'react-toastify'

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
    <article className=" flex flex-col text-start items-start justify-start w-full h-fit py-6 gap-4">
      <WhisperModels selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
      <TranslatorController
        selectedModel={selectedModel}
        isCapturingAudio={isCapturingAudio}
        setIsCapturingAudio={setIsCapturingAudio}
        setTranscriptionSentence={setTranscriptionSentence}
      />

      <div className="flex flex-col w-full h-fit text-start items-start justify-start px-4 md:px-8 gap-4">
        <TranslatorTextarea translatorContent={transcriptionSentence} />
      </div>
    </article>
  )
}

export default PCAudioTranslator
