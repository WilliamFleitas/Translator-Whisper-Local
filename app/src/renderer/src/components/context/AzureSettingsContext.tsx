import React, { createContext, useState } from 'react'

interface AzureProviderProps {
  children: React.ReactNode
}
interface DefaultStateType {
  APIKey: string
  APIRegion: string
}

interface AzureSettingsContextType {
  azureSettingsState: DefaultStateType
  updateAzureSettingsState: (key: string, region: string) => void
}
const defaultState: AzureSettingsContextType = {
  azureSettingsState: { APIKey: '', APIRegion: '' },
  updateAzureSettingsState: () => {}
}
const SettingsStatusContext = createContext<AzureSettingsContextType>(defaultState)

const AzureSettingsContext: React.FC<AzureProviderProps> = ({ children }) => {
  const [state, setState] = useState<DefaultStateType>(defaultState.azureSettingsState)

  const updateAzureSettingsState = (key: string, region: string): void => {
    setState({ APIKey: key, APIRegion: region })
  }

  return (
    <SettingsStatusContext.Provider value={{ azureSettingsState: state, updateAzureSettingsState }}>
      {children}
    </SettingsStatusContext.Provider>
  )
}

export { AzureSettingsContext, SettingsStatusContext }
