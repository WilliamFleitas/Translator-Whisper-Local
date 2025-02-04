import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/zoom.css'
import './SelectMenu.css'

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
  value: string
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
  portal: boolean
  position: 'anchor' | 'auto' | 'initial'
  customButton: JSX.Element
  disableButton?: boolean
}
const SelectMenu = ({
  optionsData,
  currentOption,
  handleOptionChange,
  placeY,
  placeX,
  gap,
  shift,
  viewScroll,
  portal = false,
  position,
  customButton,
  disableButton=false
}: SelectMenuPropsType): JSX.Element => {
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
        viewScroll={viewScroll}
        menuButton={<MenuButton disabled={disableButton}>{customButton}</MenuButton>}
      >
        {optionsData.length ? (
          optionsData.map((option) => (
            <MenuItem
              key={option.id}
              id={option.id}
              value={option.value}
              type="checkbox"
              checked={currentOption.value === option.value ? true : false}
              onClick={() => {
                console.log('e', option.label, option.value, option.id)
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
