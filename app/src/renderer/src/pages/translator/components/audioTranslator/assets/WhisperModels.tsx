import { AvailableModelsType, WhisperModelListType } from '@renderer/globalTypes/globalApi'
import { useEffect, useState } from 'react'
import { IoMdDownload } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa'
import { MdCircle } from 'react-icons/md'
import { toast } from 'react-toastify'
import DefaultLoading from '@renderer/components/loading/DefaultLoading'

interface WhisperModelsPropsType {
  selectedModel: AvailableModelsType | null
  setSelectedModel: React.Dispatch<React.SetStateAction<AvailableModelsType | null>>
}
const WhisperModels = ({
  selectedModel,
  setSelectedModel
}: WhisperModelsPropsType): React.ReactElement => {
  const [availableModels, setAvailableModels] = useState<AvailableModelsType[] | null>(null)
  const [availableModelsError, setAvailableModelsError] = useState<string>('')

  const [availableModelsIsLoading, setAvailableModelsIsLoading] = useState<boolean>(false)
  const [currentDownloadModel, setCurrentDownloadModel] = useState<AvailableModelsType[]>([])

  const handleSelectedModelChange = (model: AvailableModelsType): void => {
    setSelectedModel(model)
  }

  const handleGetAvailableModels = async (): Promise<void> => {
    try {
      setAvailableModelsIsLoading(true)
      const response = await window.api.whisperHelpers('get_available_models')

      if (response.success) {
        if (response.data.type === 'get_available_models' && response.data.available_models) {
          setAvailableModels(response.data.available_models)
        }
      } else {
        throw Error(response.error)
      }
    } catch (error: any) {
      setAvailableModelsError(error.message)
    } finally {
      setAvailableModelsIsLoading(false)
    }
  }
  const handleDownloadModelChange = async (model: AvailableModelsType): Promise<void> => {
    const findModel = currentDownloadModel?.find((item) => item.model === model.model)
    if (findModel) {
      return
    } else {
      setCurrentDownloadModel((prev) => [...prev, model])
    }
    const toastId = toast.loading(`Downloading ${model.model} model...`)
    try {
      const response = await window.api.whisperHelpers(
        'download_model',
        model.model as WhisperModelListType
      )
      if (response.success) {
        if (response.data.type === 'download_model' && response.data.download_model_status) {
          if (response.data.download_model_status.status === 1) {
            toast.update(toastId, {
              render: response.data.download_model_status.message,
              type: 'success',
              isLoading: false,
              autoClose: 5000
            })
          } else if (response.data.download_model_status.status === 0) {
            toast.update(toastId, {
              render: response.data.download_model_status.message,
              type: 'error',
              isLoading: false,
              autoClose: 5000
            })
          }
          handleGetAvailableModels()
        }
      } else {
        throw Error(response.error)
      }
    } catch (error: any) {
      toast.update(toastId, {
        render: `${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 5000
      })
    } finally {
      setCurrentDownloadModel((prev) => {
        const findTodelete = prev.filter((item) => item.model !== model.model)
        return findTodelete
      })
    }
  }
  useEffect(() => {
    handleGetAvailableModels()
  }, [])
  return (
    <div className="flex flex-col text-start items-start justify-start w-full h-fit bg-[#002634] py-4 px-4 md:px-8 gap-4">
      <strong>Whisper Models Availables</strong>

      {availableModelsIsLoading ? (
        <div className="flex flex-row w-full h-fit text-center items-center justify-center p-10 gap-3">
          <DefaultLoading size={2} color={'#fff'} />{' '}
          <small className="text-[1rem] font-bold">Loading models...</small>
        </div>
      ) : availableModelsError.length ? (
        <div className="flex flex-col w-full h-fit text-start items-start justify-start text-[1rem]">
          <small className="text-[0.9rem] flex flex-row gap-2 text-start items-center justify-start">
            <span className="text-red-600 text-[0.9rem] font-bold">Error:</span>
            {availableModelsError}
          </small>
        </div>
      ) : (
        <>
          <div className="flex flex-col w-full h-fit text-start items-start justify-start gap-4">
            <strong>Installed models, Choose the one you want to use.</strong>
            <div className="flex flex-row flex-wrap w-full h-fit text-start items-center justify-between gap-4">
              {availableModels !== null ? (
                availableModels
                  ?.filter((item) => item.installed === true)
                  .map((model) => {
                    return (
                      <button
                        type="button"
                        key={`${model.model}-availableModels`}
                        title={`Select ${model.model} model`}
                        onClick={() => handleSelectedModelChange(model)}
                        className={`flex flex-row flex-grow  w-fit min-w-[13rem] h-fit text-start items-center justify-between rounded-md px-4 py-2 gap-4 bg-[#414040] hover:bg-[#2c2c2c] text-[0.9rem] font-bold border ${selectedModel?.model === model.model ? ' border-green-600 ' : ' border-[#2c2c2c]'}`}
                      >
                        <small className=" capitalize flex flex-grow text-[0.9rem]">
                          {model.model}
                        </small>
                        {selectedModel?.model === model.model ? (
                          <FaCheck className="w-6 h-6 text-green-600" />
                        ) : (
                          <MdCircle className="w-6 h-6 text-green-600" />
                        )}
                      </button>
                    )
                  })
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full h-fit text-start items-start justify-start gap-4">
            <strong>Models Available to download.</strong>
            <div className="flex flex-row flex-wrap w-full h-fit text-start items-center justify-between gap-4">
              {availableModels !== null ? (
                availableModels
                  ?.filter((item) => item.installed === false)
                  .map((model) => {
                    return (
                      <div
                        key={`${model.model}-modelsnotInstaled`}
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
                          disabled={
                            currentDownloadModel?.find((item) => item.model === model.model)
                              ? true
                              : false
                          }
                        >
                          {currentDownloadModel?.find((item) => item.model === model.model) ? (
                            <div className="flex flex-row gap-4 text-start items-center justify-start">
                              <DefaultLoading size={1.5} color={'#fff'} />
                            </div>
                          ) : (
                            <IoMdDownload className="w-6 h-6 " />
                          )}
                        </button>
                      </div>
                    )
                  })
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WhisperModels
