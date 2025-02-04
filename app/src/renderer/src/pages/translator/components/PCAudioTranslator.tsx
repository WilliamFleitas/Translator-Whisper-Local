import CustomTextarea from '../../../components/textarea/CustomTextarea'
import { StartStreamingType } from '../../../globalTypes/globalApi'
import { useEffect, useState } from 'react'

const PCAudioTranslator: React.FC = () => {
  const [transcriptionSentence, setTranscriptionSentence] = useState<string>('')
  const [transcriptionInterim, setTranscriptionInterim] = useState<string>('')
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)

  const handleStartRecording = async (): Promise<void> => {
    try {
      setTranscriptionSentence("")
      const response = await window.api.startStreaming('speaker')
      console.log('resposos', response)
      if (response.success) {
        setTranscriptionSentence((prev) => prev.slice(0, prev.length - 2) + '.')
        setTranscriptionInterim('')
      }
    } catch (err) {
      console.log('StartRecording error', err)
      // setTranscriptionError(err)
    }
  }

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

    const handleStreamingError = (event: any, data: string): void => {
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
  console.log('dasdas22', transcriptionSentence)
  return (
    <article className="">
      <strong>PC audio translator</strong>
      <button type="button" onClick={handleStartRecording}>
        Record
      </button>
      <div className="bg-red-400 flex flex-row flex-wrap w-full h-fit gap-4">
        <div className="flex flex-col w-full border max-h-[50%] bg-blue-500">
          <small>{transcriptionSentence + transcriptionInterim}</small>
        </div>
        <div className="flex flex-col w-full border max-h-[50%]">
          <CustomTextarea
            startHeight="10px"
            textareaContent={transcriptionInterim}
            handlesetTextareaContent={setTranscriptionInterim}
            disabled={true}
            classStyle="flex flex-col flex-grow text-start items-start justify-start outline-none  border-transparent focus:border-transparent focus:ring-0 resize-none  w-full min-w-[15rem] max-h-[20rem] md:max-h-full h-fit text-black "
          />
        </div>
        <div className="flex flex-col w-full border max-h-[50%]">
          <CustomTextarea
            startHeight="10px"
            textareaContent={transcriptionSentence}
            handlesetTextareaContent={setTranscriptionSentence}
            disabled={true}
            classStyle="flex flex-col flex-grow text-start items-start justify-start outline-none  border-transparent focus:border-transparent focus:ring-0 resize-none  w-full min-w-[15rem] max-h-[20rem] md:max-h-full h-fit text-black "
          />
        </div>
      </div>
    </article>
  )
}

export default PCAudioTranslator
