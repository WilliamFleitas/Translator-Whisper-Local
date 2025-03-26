import { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'

interface PasswordInputPropsType {
  inputValue: string
  inputOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  disabled?: boolean
}

const PasswordInput = ({
  inputValue,
  placeholder,
  disabled = false,
  inputOnChange
}: PasswordInputPropsType): React.ReactElement => {
  const [showText, setShowText] = useState<boolean>(false)
  return (
    <div className="flex flex-row w-fit flex-grow h-fit text-start items-center justify-start rounded-md px-2 py-2 gap-2 min-w-[2rem] bg-primary-button border border-primary-button-hover">
      <input
        type={showText ? 'text' : 'password'}
        value={inputValue}
        onChange={inputOnChange}
        placeholder={placeholder}
        disabled={disabled}
        className="border-none ring-0 outline-0 focus:border-none focus:ring-0 focus:outline-0 active:border-none active:ring-0 active:outline-0 hover:border-none hover:ring-0 hover:outline-0 text-zinc-200 w-full "
      />
      <button
        onClick={() => {
          setShowText(!showText)
        }}
        type="button"
        className="text-zinc-400"
      >
        {showText ? <FaRegEyeSlash className="w-4 h-4 " /> : <FaRegEye className="w-4 h-4 " />}
      </button>
    </div>
  )
}

export default PasswordInput
