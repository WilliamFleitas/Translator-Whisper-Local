import { AvailableModelsType } from '@renderer/globalTypes/globalApi'
import { useEffect, useRef, useState } from 'react'
import TranslatorController, { languages } from './TranslatorController'
import SelectMenu from '@renderer/components/menu/SelectMenu'

interface CustomTextareaPropsType {
  refValue: React.LegacyRef<HTMLTextAreaElement> | undefined
  content: string
  placeholder?: string
  disabled?: boolean
  handleChange: (event: any) => void
}
const CustomTextarea = ({
  refValue,
  content,
  placeholder,
  disabled = false,
  handleChange
}: CustomTextareaPropsType): React.ReactElement => {
  return (
    <textarea
      ref={refValue}
      value={content}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className="flex w-full h-full resize-none shrink  overflow-auto max-h-[15rem] lg:max-h-[25rem] bg-primary-button outline-none focus:border-0 focus:outline-none focus:ring-0 ring-0 px-4 text-2xl my-2"
    />
  )
}

interface TranslatorTextareaPropsType {
  translatorContent: string
  isCapturingAudio: boolean
  selectedModel: AvailableModelsType | null
  setTranscriptionSentence: React.Dispatch<React.SetStateAction<string>>
  setIsCapturingAudio: React.Dispatch<React.SetStateAction<boolean>>
}
const TranslatorTextarea = ({
  translatorContent,
  isCapturingAudio,
  selectedModel,
  setIsCapturingAudio,
  setTranscriptionSentence
}: TranslatorTextareaPropsType): React.ReactElement => {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const textarea1Ref = useRef<HTMLTextAreaElement | null>(null)
  const textarea2Ref = useRef<HTMLTextAreaElement | null>(null)

  const handleTextareaChange = (event): void => {
    const inputValue = event.target.value
    setText1(inputValue)
    setText2(inputValue)
    event.target.style.height = 'auto'
    if (textarea1Ref.current && textarea2Ref.current) {
      textarea1Ref.current.style.height = `${event.target.scrollHeight}px`
      textarea2Ref.current.style.height = `${event.target.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (translatorContent.length) {
      setText1(translatorContent)
      setText2(translatorContent)
    }
  }, [translatorContent])
  useEffect(() => {
    if (textarea1Ref.current && textarea2Ref.current) {
      if (isCapturingAudio) {
        textarea1Ref.current.style.height = 'auto'
        textarea1Ref.current.style.height = `${textarea1Ref.current.scrollHeight}px`
        textarea2Ref.current.style.height = `${textarea2Ref.current.scrollHeight}px`
      }
      const cursorPosition = textarea1Ref.current.selectionStart
      if (cursorPosition === text1.length) {
        textarea1Ref.current.scrollTop = textarea1Ref.current.scrollHeight
        textarea2Ref.current.scrollTop = textarea1Ref.current.scrollHeight
      }
    }
  }, [text1])
  return (
    <div className="flex flex-row flex-wrap lg:flex-nowrap gap-4 min-h-[10rem]  w-full h-fit">
      <div className="flex flex-col rounded-md w-full resize-none shrink  overflow-x-hidden bg-primary-button text-2xl isolate border-secondary-background border">
        <CustomTextarea
          refValue={textarea1Ref}
          content={text1}
          disabled={isCapturingAudio}
          handleChange={handleTextareaChange}
          placeholder="Write here.."
        />
        <div className="mt-auto">
          <TranslatorController
            selectedModel={selectedModel}
            isCapturingAudio={isCapturingAudio}
            setIsCapturingAudio={setIsCapturingAudio}
            setTranscriptionSentence={setTranscriptionSentence}
          />
        </div>
      </div>
      <div className="flex flex-col rounded-md w-full resize-none shrink overflow-x-hidden bg-primary-button  text-2xl isolate border-secondary-background border">
        <CustomTextarea
          refValue={textarea2Ref}
          content={text2}
          handleChange={handleTextareaChange}
          placeholder="Transcription.."
          disabled={true}
        />
        <div className="mt-auto">
          <nav className="py-3 px-4 gap-8 flex flex-col sm:flex-row w-full justify-between items-stretch text-start relative bg-secondary-background">
            <section className="flex flex-row w-full md:w-fit h-fit text-start items-center justify-between md:justify-start  gap-4 text-lg ">
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
                  currentOption={languages[0]}
                  handleOptionChange={() => {}}
                  enableArrow={true}
                  customButtonClassName={
                    'bg-primary-button hover:bg-primary-button-hover flex flex-row text-start items-center justify-between w-fit h-fit py-2 px-3 rounded-full text-lg font-bold text-white gap-3 uppercase'
                  }
                  customButtonContent={'ES'}
                  customButtonTitle={`Select Language`}
                />
              </div>
            </section>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default TranslatorTextarea
