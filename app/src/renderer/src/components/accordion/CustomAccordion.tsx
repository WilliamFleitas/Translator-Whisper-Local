import { useState } from 'react'

import { IoIosArrowDown } from 'react-icons/io'

interface CustomAccordionPropsType {
  accordionContent: React.ReactElement
  accordionTitle: React.ReactElement
}
const CustomAccordion = ({
  accordionContent,
  accordionTitle
}: CustomAccordionPropsType): React.ReactElement => {
  const [accordionIsOpen, setAccordionIsOpen] = useState<boolean>(false)

  return (
    <div className="flex flex-col w-full h-fit text-start items-start justify-start gap-4">
      <button
        className="flex flex-row w-full h-fit text-start items-center justify-between gap-4 text-[#ffffff] hover:text-zinc-500"
        type="button"
        onClick={() => setAccordionIsOpen(!accordionIsOpen)}
      >
        <span>{accordionTitle} </span>{' '}
        <IoIosArrowDown
          className={`w-5 h-5 min-w-5 min-h-5 transform transition-transform ${
            accordionIsOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
      {accordionIsOpen ? (
        <div className="flex flex-col w-full h-fit text-start items-start justify-start">
          {accordionContent}
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

export default CustomAccordion
