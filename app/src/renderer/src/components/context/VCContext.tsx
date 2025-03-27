import React, { createContext, useState } from 'react'

interface VCProviderProps {
  children: React.ReactNode
}
interface DefaultStateType {
  is_running: boolean
  default_audio_device: boolean
  lock_status: boolean
}

interface VCStatusContextType {
  state: DefaultStateType
  handleUpdateState: (key: string, value: boolean) => void
}
const defaultState: VCStatusContextType = {
  state: { is_running: false, default_audio_device: false, lock_status: false },
  handleUpdateState: () => {}
}
const VCStatusContext = createContext<VCStatusContextType>(defaultState)

const VCContext: React.FC<VCProviderProps> = ({ children }) => {
  const [state, setState] = useState<DefaultStateType>(defaultState.state)

  const handleUpdateState = (key: string, value: boolean): void => {
    setState((prevState) => ({ ...prevState, [key]: value }))
  }

  return (
    <VCStatusContext.Provider value={{ state, handleUpdateState }}>
      {children}
    </VCStatusContext.Provider>
  )
}

export { VCContext, VCStatusContext }
