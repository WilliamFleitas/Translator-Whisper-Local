import { StartStreamingType } from '../../../../globalTypes/globalApi'
import { useEffect, useState } from 'react'
import TranslatorTextarea from './assets/TranslatorTextarea'
import TranslatorController from './assets/TranslatorController'
import WhisperModels from './assets/WhisperModels'
// import TranslatorSettings from '../translatorSettings/TranslatorSettings'

const PCAudioTranslator: React.FC = () => {
  const [transcriptionSentence, setTranscriptionSentence] = useState<string>('')
  const [transcriptionInterim, setTranscriptionInterim] = useState<string>('')
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [isCapturingAudio, setIsCapturingAudio] = useState<boolean>(false)

  useEffect(() => {
    const handleStreamingData = (_event: any, data: StartStreamingType): void => {
      const wordsString = data?.words?.map((wordObj) => wordObj.word).join(' ')
      const sentence = data.sentence
      if (!data.channel_info.is_final) {
        setTranscriptionInterim(wordsString)
      } else {
        setTranscriptionSentence((prev) => {
          const lastChr = ', '
          return `${prev} ${sentence}${lastChr}`
        })
        setTranscriptionInterim('')
      }
    }

    const handleStreamingError = (_event: any, data: string): void => {
      setTranscriptionError(data)
      console.log('dasdas3232', data)
    }

    window.api.on('streaming-data', handleStreamingData)
    window.api.on('streaming-error', handleStreamingError)

    return (): void => {
      window.api.removeListener('streaming-data', handleStreamingData)
      window.api.removeListener('streaming-error', handleStreamingError)
    }
  }, [])
  console.log('dasdas22', transcriptionSentence, transcriptionError)
  return (
    <article className=" flex flex-col text-start items-start justify-start w-full h-fit py-6 gap-4">
      <WhisperModels />
      <TranslatorController
        isCapturingAudio={isCapturingAudio}
        setIsCapturingAudio={setIsCapturingAudio}
        setTranscriptionError={setTranscriptionError}
        setTranscriptionInterim={setTranscriptionInterim}
        setTranscriptionSentence={setTranscriptionSentence}
      />

      <div className="flex flex-col w-full h-fit text-start items-start justify-start px-4 md:px-8 gap-4">
        <TranslatorTextarea translatorContent={transcriptionSentence + transcriptionInterim} />
      </div>

      {/* <TranslatorSettings/> */}
    </article>
  )
}

export default PCAudioTranslator
