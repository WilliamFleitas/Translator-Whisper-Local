import { useRef, useState } from 'react'

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
      className="flex rounded-md w-full resize-none shrink  overflow-auto max-h-[25rem] bg-[#414040] outline-none focus:border-0 focus:outline-none focus:ring-0 ring-0 p-4 text-[1.1rem]"
    />
  )
}

interface TranslatorTextareaPropsType {
  translatorContent: string
}
const TranslatorTextarea = ({
  translatorContent
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
    event.target.style.height = `${event.target.scrollHeight}px`
  }
  return (
    <div className="flex flex-row flex-nowrap gap-4 min-h-[10rem]  w-full ">
      <CustomTextarea
        refValue={textarea1Ref}
        content={translatorContent ? translatorContent : text1}
        handleChange={handleTextareaChange}
        placeholder="Write here.."
      />
      <CustomTextarea
        refValue={textarea2Ref}
        content={text2}
        handleChange={handleTextareaChange}
        placeholder="Transcription.."
        disabled={true}
      />
    </div>
  )
}

export default TranslatorTextarea
