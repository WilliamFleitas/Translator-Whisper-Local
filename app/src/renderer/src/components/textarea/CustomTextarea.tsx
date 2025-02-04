interface CustomTextareaPropsType {
  textareaContent: string
  startHeight: string
  classStyle: string
  disabled?: boolean
  handlesetTextareaContent: (text: string) => void
}

const CustomTextarea = ({
  textareaContent,
  startHeight,
  classStyle,
  disabled = false,
  handlesetTextareaContent
}: CustomTextareaPropsType): React.ReactElement => {
  const handleTextareaChange = (event): void => {
    const inputValue = event.target.value
    handlesetTextareaContent(inputValue)
    event.target.style.height = startHeight
    event.target.style.height = `${event.target.scrollHeight}px`
  }

  return (
    <textarea
      value={textareaContent}
      disabled={disabled}
      placeholder="Insert Message..."
      className={classStyle}
      onChange={handleTextareaChange}
    ></textarea>
  )
}

export default CustomTextarea
