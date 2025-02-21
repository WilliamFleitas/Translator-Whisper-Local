import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/zoom.css'
import './SelectMenu.css'
import { IoIosArrowDown } from 'react-icons/io'
import { useState } from 'react'

// const DOPDOWN_Y_PLACE_OPTIONS = {
//   top: "top",
//   bottom: "bottom",
// };
const DOPDOWN_X_PLACE_OPTIONS = {
  left: 'left',
  right: 'right'
}

export type MenuOptionType = {
  label: string
  value: string | number
  id: number | string
}

interface SelectMenuPropsType {
  optionsData: MenuOptionType[]
  currentOption: MenuOptionType
  handleOptionChange: (data: MenuOptionType) => void
  gap: number
  shift: number
  placeY: 'top' | 'bottom'
  placeX: 'left' | 'right' | 'center'
  viewScroll: 'auto' | 'initial' | 'close'
  customButtonClassName: string
  customButtonContent: string
  customButtonTitle?: string
  portal: boolean
  position: 'anchor' | 'auto' | 'initial'
  disableButton?: boolean
  menuType?: 'radio' | 'checkbox' | null
  enableArrow?: boolean
}
const SelectMenu = ({
  optionsData,
  currentOption,
  handleOptionChange,
  customButtonClassName,
  customButtonTitle,
  customButtonContent,
  placeY,
  placeX,
  gap,
  shift,
  viewScroll,
  portal = false,
  enableArrow = false,
  position,
  disableButton = false,
  menuType = 'checkbox'
}: SelectMenuPropsType): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <>
      <Menu
        portal={portal}
        direction={placeY}
        menuClassName="custom-dropdown"
        align={
          placeX === DOPDOWN_X_PLACE_OPTIONS.left
            ? 'start'
            : placeX === DOPDOWN_X_PLACE_OPTIONS.right
              ? 'end'
              : 'center'
        }
        gap={gap}
        shift={shift}
        transition
        position={position}
        overflow={'auto'}
        viewScroll={viewScroll}
        onMenuChange={(open) => setIsOpen(open.open)}
        menuButton={
          <MenuButton disabled={disableButton}>
            <small title={customButtonTitle} className={customButtonClassName}>
              {customButtonContent}
              {enableArrow ? (
                <IoIosArrowDown
                  className={`w-5 h-5 min-w-5 min-h-5 transform transition-transform ${
                    isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              ) : (
                <></>
              )}
            </small>
          </MenuButton>
        }
      >
        {optionsData.length ? (
          optionsData.map((option) => (
            <MenuItem
              key={option.id}
              id={option.id.toString()}
              value={option.value}
              type={menuType === null ? undefined : menuType}
              checked={currentOption.value === option.value ? true : false}
              onClick={() => {
                handleOptionChange({ label: option.label, value: option.value, id: option.id })
              }}
            >
              {option.label}
            </MenuItem>
          ))
        ) : (
          <MenuItem id={'0'} value={'none'} disabled={true} onClick={() => {}}>
            No Options
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

export default SelectMenu
