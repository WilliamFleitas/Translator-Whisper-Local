import { useEffect, useRef, useState } from 'react'
import { TiArrowLeftThick, TiArrowRightThick } from 'react-icons/ti'
import { MdFullscreen } from 'react-icons/md'
import './TranslationOverlay.css'
import useTranslationListener from '@renderer/assets/customHooks/useTranslationListener'
import useTranscriptionListener from '@renderer/assets/customHooks/useTranscriptionListener'
import { IoCloseSharp } from 'react-icons/io5'

interface CustomTextareaPropsType {
  content: string
  refValue: React.LegacyRef<HTMLTextAreaElement> | undefined
  placeholder?: string
  disabled?: boolean
  color?: string
}
const CustomTextarea = ({
  content,
  refValue,
  disabled,
  placeholder,
  color
}: CustomTextareaPropsType): React.ReactElement => {
  return (
    <textarea
      ref={refValue}
      value={content}
      placeholder={placeholder}
      disabled={disabled}
      className={`custom-textarea text-[1.6rem] resize-none shrink  overflow-auto  flex w-full h-full px-2 font-semibold outline-none focus:border-0 focus:outline-none focus:ring-0 ring-0 `}
      style={{ color: color }}
    />
  )
}
const TranslationOverlay: React.FC = () => {
  const textarea1Ref = useRef<HTMLTextAreaElement | null>(null)
  const textarea2Ref = useRef<HTMLTextAreaElement | null>(null)

  const [tabIsEnabled, setTabIsEnabled] = useState<boolean>(false)
  const [transcriptionColor, setTranscriptionColor] = useState<string>('#ffffff')
  const [translationColor, setTranslationColor] = useState<string>('#f6b73c')

  const [hoveredOverlay, setHoveredOverlay] = useState<boolean>(false)

  const { transcriptionSentence, transcriptionError, setTranscriptionSentence } =
    useTranscriptionListener({
      cleanState: true
    })
  const { translationSentence, translationError, setTranslationSentence } = useTranslationListener()

  const handleClearOverlayText = (): void => {
    setTranslationSentence('')
    setTranscriptionSentence('')
  }
  const handleClickableOverlayChange = (enableOverlay: boolean): void => {
    window.api.setClickableOverlay(enableOverlay)
    setHoveredOverlay(enableOverlay)
  }
  const handleOverlayColorChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    if (target.id === 'transcriptionColor') {
      setTranscriptionColor(target.value)
    } else {
      setTranslationColor(target.value)
    }
  }
  useEffect(() => {
    if (textarea1Ref.current && textarea2Ref.current) {
      textarea1Ref.current.scrollTop = textarea1Ref.current.scrollHeight
      textarea2Ref.current.scrollTop = textarea2Ref.current.scrollHeight
    }
  }, [transcriptionSentence, translationSentence])

  useEffect(() => {
    if (transcriptionSentence.length === 0) {
      setTranslationSentence('')
    }
  }, [transcriptionSentence])

  useEffect(() => {
    const handleOverlayState = (): void => {
      if (!hoveredOverlay) {
        if (tabIsEnabled) {
          window.api.setClickableOverlay(true)
        } else {
          window.api.setClickableOverlay(false)
        }
      }
    }
    handleOverlayState()
  }, [hoveredOverlay, tabIsEnabled])
  return (
    <div className={`flex flex-col  shrink w-full h-dvh  text-start items-start justify-start`}>
      <div className="flex flex-row w-full ml-auto h-fit text-start items-center justify-start gap-4">
        {translationError?.length || transcriptionError?.length ? (
          <div
            className={`flex flex-row w-fit grow h-fit px-2 py-1 max-h-8 overflow-hidden gap-1  border ${tabIsEnabled ? 'bg-danger border-primary-background rounded-t-md' : 'bg-danger/40 border-transparent rounded-md'}`}
            title={
              translationError?.length
                ? translationError
                : transcriptionError?.length
                  ? transcriptionError
                  : ''
            }
          >
            <span className="text-3xl">Error:</span>{' '}
            <small className="text-3xl ">
              {translationError?.length
                ? translationError?.length
                : transcriptionError?.length
                  ? transcriptionError?.length
                  : ''}
            </small>
          </div>
        ) : (
          <></>
        )}

        <div
          className={`ml-auto w-fit h-fit py-1 px-1   flex flex-row text-end items-end justify-end gap-2 border-t border-x rounded-t-md ${tabIsEnabled ? 'bg-secondary-background  border-primary-background' : 'border-transparent'}`}
        >
          {tabIsEnabled ? (
            <>
              <button
                className="pointer-events-auto bg-primary-button hover:bg-primary-button-hover rounded-md p-1 leading-0"
                title="Clean"
                type="button"
                onClick={handleClearOverlayText}
              >
                <IoCloseSharp className="w-4 h-4" />
              </button>
              <div className="pointer-events-auto bg-primary-button hover:bg-primary-button-hover rounded-md p-1 leading-0 ">
                <input
                  className="w-6 h-4"
                  type="color"
                  id="transcriptionColor"
                  title="transcription color"
                  value={transcriptionColor}
                  onChange={handleOverlayColorChange}
                />
              </div>
              <div className="pointer-events-auto bg-primary-button hover:bg-primary-button-hover rounded-md p-1 leading-0 ">
                <input
                  className="w-6 h-4"
                  type="color"
                  id="translationColor"
                  title="translation color"
                  value={translationColor}
                  onChange={handleOverlayColorChange}
                />
              </div>
              <button
                className="pointer-events-auto bg-primary-button hover:bg-primary-button-hover rounded-md p-1 leading-0   draggable-obj"
                title="Drag overlay"
                type="button"
              >
                <MdFullscreen className="w-4 h-4" />
              </button>
            </>
          ) : (
            <></>
          )}
          <button
            className={` pointer-events-auto hover:bg-primary-button-hover rounded-md p-1 leading-0 ${tabIsEnabled ? 'bg-primary-button' : 'bg-primary-button/30'}`}
            title={`${tabIsEnabled ? 'Disable background' : 'Enable background'}`}
            onMouseEnter={() => {
              handleClickableOverlayChange(true)
            }}
            onMouseLeave={() => {
              handleClickableOverlayChange(false)
            }}
            onClick={() => {
              setTabIsEnabled(!tabIsEnabled)
            }}
            type="button"
          >
            {' '}
            {tabIsEnabled ? (
              <TiArrowRightThick className="w-4 h-4 " />
            ) : (
              <TiArrowLeftThick className="w-4 h-4 " />
            )}
          </button>
        </div>
      </div>
      <div
        className={`flex flex-col text-start items-start justify-start w-full h-full  py-2 overflow-hidden  border-t border-x ${tabIsEnabled ? 'bg-secondary-background  border-primary-background' : 'border-transparent'}  ${transcriptionError?.length || transcriptionError?.length ? '' : 'rounded-tl-md'}`}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          <CustomTextarea
            color={transcriptionColor}
            disabled={true}
            refValue={textarea1Ref}
            placeholder="Transcription here"
            content={transcriptionSentence}
          />
        </div>
      </div>
      <span
        className={`w-full h-[0.2rem]  ${tabIsEnabled ? 'bg-primary-button' : 'bg-primary-button/10 rounded-md'}`}
      ></span>
      <div
        className={`flex flex-col text-start items-start justify-start w-full h-full  py-2 overflow-hidden rounded-b-md border-b border-x ${tabIsEnabled ? 'bg-secondary-background  border-primary-background' : 'border-transparent'}`}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          <CustomTextarea
            color={translationColor}
            disabled={true}
            refValue={textarea2Ref}
            placeholder="Translation here"
            content={translationSentence}
          />
        </div>
      </div>
    </div>
  )
}

export default TranslationOverlay
