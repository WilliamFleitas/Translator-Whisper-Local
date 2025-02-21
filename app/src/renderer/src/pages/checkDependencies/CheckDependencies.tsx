import DefaultLoading from '@renderer/components/loading/DefaultLoading'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoCheckmarkSharp } from 'react-icons/io5'
import { ApiResponse, CheckGraphicCardType } from '@renderer/globalTypes/globalApi'

const CheckDependencies = (): React.ReactElement => {
  const [loading, setLoading] = useState(true)
  const [interimMessage, setInterimMessage] = useState<string>('')
  const [currentIntMessage, setCurrentIntMessage] = useState<string>('')
  const [checkDependenciesError, setCheckDependenciesError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function check(): Promise<void> {
      try {
        const result = await window.api.checkDependencies()
        if (result.success) {
          if (result.data.gpu_type) {
            localStorage.setItem('process_device', result.data.gpu_type)
            navigate('/translator')
          }
        } else {
          throw Error(result.error)
        }
        setCurrentIntMessage('')
      } catch (err: any) {
        setCheckDependenciesError(err.message)
      } finally {
        setLoading(false)
      }
    }

    check()
  }, [])
  useEffect(() => {
    const handleCheckDependenciesData = (
      _event: any,
      data: ApiResponse<CheckGraphicCardType>
    ): void => {
      if (data.success) {
        if (data.data.interim_message) {
          setInterimMessage((prev) => {
            return `${prev} _ ${data.data.interim_message}`
          })
          setCurrentIntMessage(data.data.interim_message)
        }
      }
    }

    const handleCheckDependenciesError = (_event: any, data: any): void => {
      setCheckDependenciesError(data.error)
    }

    window.api.on('check-dependencies-data', handleCheckDependenciesData)
    window.api.on('check-dependencies-error', handleCheckDependenciesError)

    return (): void => {
      window.api.removeListener('streaming-data', handleCheckDependenciesData)
      window.api.removeListener('check-dependencies-data', handleCheckDependenciesError)
    }
  }, [])
  return (
    <div className="flex flex-col text-center items-center justify-center w-full min-h-screen  text-white md:p-10">
      {loading ? (
        <div className="w-full md:w-fit  h-full min-h-screen md:h-fit md:min-h-[13rem] text-start items-center justify-center bg-gray-900 p-10 md:rounded-md flex flex-col">
          <div className="flex flex-col w-fit h-fit gap-4 text-start items-start justify-start">
            <strong className="text-[1.2rem]">
              Checking dependencies, This may take a few seconds...
            </strong>
            <div className="flex flex-col gap-4 text-start items-start justify-start">
              {interimMessage.length ? (
                interimMessage.split('_').map((item, index) => {
                  return item.length > 1 ? (
                    <div
                      key={index}
                      className="text-[0.9rem] flex flex-row text-start items-center justify-start gap-4"
                    >
                      <IoCheckmarkSharp className="w-5 h-5 min-w-5 min-h-5 text-white" />
                      <span>{item}</span>
                    </div>
                  ) : (
                    <div key={index}></div>
                  )
                })
              ) : (
                <></>
              )}
            </div>
            {currentIntMessage.length ? (
              <div className="flex flex-row gap-4 text-start items-center justify-start">
                <DefaultLoading size={2} color={'#fff'} />
                <small className="text-[0.9rem]">{currentIntMessage}</small>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      ) : checkDependenciesError ? (
        <div className="w-full md:w-fit  h-full min-h-screen md:h-fit md:min-h-[13rem] text-start items-center justify-center bg-gray-900 p-10 md:rounded-md flex flex-col">
          <div className="flex flex-col w-fit h-fit gap-4 text-start items-start justify-start ">
            <strong className="text-[1.2rem]">There was an error checking dependencies..</strong>
            <small className="text-[0.9rem] flex flex-row gap-2 text-start items-center justify-start">
              <span className="text-red-600 text-[0.9rem] font-bold">Error:</span>
              {checkDependenciesError}
            </small>
            <div className="flex flex-col w-full h-fit text-start items-center justify-center gap-4">
              <button
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CheckDependencies
