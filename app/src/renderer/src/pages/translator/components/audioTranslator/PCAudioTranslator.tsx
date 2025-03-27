import { AvailableModelsType } from '../../../../globalTypes/globalApi'
import TranslatorTextarea from './assets/TranslatorTextarea'
import TranslatorSettings from '../translatorSettings/TranslatorSettings'
import useTranscriptionListener from '@renderer/assets/customHooks/useTranscriptionListener'
import useTranslationListener from '@renderer/assets/customHooks/useTranslationListener'
import { useState } from 'react'
import AppSettings from './assets/AppSettings'

const PCAudioTranslator: React.FC = () => {
  const [isCapturingAudio, setIsCapturingAudio] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<AvailableModelsType | null>(null)

  const {
    transcriptionSentence,
    transcriptionIsLoading,
    transcriptionError,
    setTranscriptionSentence,
    setTranscriptionIsLoading,
    setTranscriptionError
  } = useTranscriptionListener({})
  const { translationSentence, translationError, setTranslationSentence, setTranslationError } =
    useTranslationListener()

  return (
    <article className=" flex flex-col text-start items-start justify-start w-full h-full gap-4">
      <AppSettings selectedModel={selectedModel} setSelectedModel={setSelectedModel} />

      <div className="flex flex-col w-full h-full text-start items-center justify-start px-4 md:px-8 gap-4 py-6">
        <TranslatorTextarea
          transcriptionContent={transcriptionSentence}
          translationContent={translationSentence}
          translationError={translationError}
          transcriptionError={transcriptionError}
          selectedModel={selectedModel}
          isCapturingAudio={isCapturingAudio}
          transcriptionIsLoading={transcriptionIsLoading}
          setIsCapturingAudio={setIsCapturingAudio}
          setTranscriptionSentence={setTranscriptionSentence}
          setTranslationSentence={setTranslationSentence}
          setTranslationError={setTranslationError}
          setTranscriptionIsLoading={setTranscriptionIsLoading}
          setTranscriptionError={setTranscriptionError}
        />
      </div>
      <div className="flex flex-col w-full h-full text-start items-start justify-start ">
        <TranslatorSettings />
      </div>
    </article>
  )
}

export default PCAudioTranslator
