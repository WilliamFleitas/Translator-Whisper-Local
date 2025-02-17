import { AvailableModelsType, WhisperModelListType } from '@renderer/globalTypes/globalApi'
import { useEffect, useState } from 'react'
import { IoMdDownload } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'
import { MdCircle } from 'react-icons/md'

const WhisperModels = (): React.ReactElement => {
  const [availableModels, setAvailableModels] = useState<AvailableModelsType[] | null>(null)
  const [availableModelsError, setAvailableModelsError] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<AvailableModelsType | null>(null)
  const [currentDownloadModel, setCurrentDownloadModel] = useState<AvailableModelsType | null>(null)
  const [downloadError, setDownloadError] = useState<string>('')
  const handleSelectedModelChange = (model: AvailableModelsType): void => {
    setSelectedModel(model)
  }

  const handleGetAvailableModels = async (): Promise<void> => {
    try {
      const response = await window.api.whisperHelpers('get_available_models')
      console.log('whispermodels', response)
      if (response.success) {
        if (response.data.type === 'get_available_models' && response.data.available_models) {
          setAvailableModels(response.data.available_models)
        }
      } else if (!response.success) {
        setAvailableModelsError(response.error)
      }
    } catch (error: any) {
      console.log('getavailablemodels error', error)
      setAvailableModelsError(error)
    }
  }
  const handleDownloadModelChange = async (model: AvailableModelsType): Promise<void> => {
    setCurrentDownloadModel(model)
    try {
      const response = await window.api.whisperHelpers(
        'download_model',
        model.model as WhisperModelListType
      )
      if (response.success) {
        if (response.data.type === 'download_model' && response.data.download_model_status) {
          if (response.data.download_model_status.status === 1) {
            console.log('model ' + model.model + ' downloaded correctly')
          } else if (response.data.download_model_status.status === 0) {
            console.log(response.data.download_model_status.message)
            setDownloadError(response.data.download_model_status.message)
          }
          handleGetAvailableModels()
        }
      } else if (!response.success) {
        console.log('download error', response.error)
        setDownloadError(response.error)
      }
    } catch (error: any) {
      console.log('download error', error)
      setDownloadError(error)
    } finally {
      setCurrentDownloadModel(null)
    }
  }
  useEffect(() => {
    handleGetAvailableModels()
  }, [])
  return (
    <div className="flex flex-col text-start items-start justify-start w-full h-fit bg-[#002634] py-4 px-4 md:px-8 gap-4">
      <strong>Whisper Models Availables</strong>
      {availableModelsError.length ? <small>{availableModelsError}</small> : <></>}

      <div className="flex flex-col w-full h-fit text-start items-start justify-start gap-4">
        <strong>Installed models, Choose the one you want to use.</strong>
        <div className="flex flex-row flex-wrap w-full h-fit text-start items-center justify-between gap-4">
          {availableModels !== null ? (
            availableModels?.map((model) =>
              model.installed ? (
                <button
                  type="button"
                  key={model.model}
                  title={`Select ${model.model} model`}
                  onClick={() => handleSelectedModelChange(model)}
                  className={`flex flex-row flex-grow  w-fit min-w-[13rem] h-fit text-start items-center justify-between rounded-md px-4 py-2 gap-4 bg-[#414040] hover:bg-[#2c2c2c] text-[0.9rem] font-bold border ${selectedModel?.model === model.model ? ' border-green-600 ' : ' border-[#2c2c2c]'}`}
                >
                  <small className=" capitalize flex flex-grow text-[0.9rem]">{model.model}</small>
                  {selectedModel?.model === model.model ? (
                    <FaCheck className="w-6 h-6 text-green-600" />
                  ) : (
                    <MdCircle className="w-6 h-6 text-green-600" />
                  )}
                </button>
              ) : (
                <></>
              )
            )
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="flex flex-col w-full h-fit text-start items-start justify-start gap-4">
        <strong>Models Available to download.</strong>
        <div className="flex flex-row flex-wrap w-full h-fit text-start items-center justify-between gap-4">
          {availableModels !== null ? (
            availableModels?.map((model) =>
              !model.installed ? (
                <div
                  key={model.model}
                  title={`Download ${model.model} model`}
                  className={`flex flex-row flex-grow  w-fit min-w-[13rem] h-fit text-start items-center justify-between rounded-md  gap-4 bg-[#414040] text-[0.9rem] font-bold border border-[#2c2c2c] isolate overflow-hidden`}
                >
                  <small className="capitalize flex flex-grow text-[0.9rem] px-4">
                    {model.model}
                  </small>
                  <button
                    type="button"
                    title={`Download ${model.model} model`}
                    onClick={() => handleDownloadModelChange(model)}
                    className="flex shrink bg-[#2c2c2c] text-green-600 hover:text-green-800 py-2 px-6 border-l border-[#2c2c2c] "
                  >
                    {currentDownloadModel?.model === model.model ? (
                      <span>Downloading...</span>
                    ) : (
                      <IoMdDownload className="w-6 h-6 " />
                    )}
                  </button>
                </div>
              ) : (
                <></>
              )
            )
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  )
}

export default WhisperModels
