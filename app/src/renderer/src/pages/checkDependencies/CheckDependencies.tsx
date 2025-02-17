import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CheckDependencies = (): React.ReactElement => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function check(): Promise<void> {
      try {
        const result = await window.api.checkDependencies()
        console.log('result', result)
        if (result.success) {
          console.log('resultresultresult', result)
          navigate('/translator')
        } else {
          setError(result.error || 'An unknown error occurred')
        }
      } catch (err) {
        setError('Error communicating with backend')
      } finally {
        setLoading(false)
      }
    }

    check()
  }, [])
  useEffect(() => {
    const handleCheckDependenciesData = (_event: any, data: any): void => {
      console.log('eventcheckdpen', data)
    }

    const handleCheckDependenciesError = (_event: any, data: any): void => {
      // setTranscriptionError(data)
      console.log('eventcheckdError', data)
    }

    window.api.on('check-dependencies-data', handleCheckDependenciesData)
    window.api.on('check-dependencies-error', handleCheckDependenciesError)

    return (): void => {
      window.api.removeListener('streaming-data', handleCheckDependenciesData)
      window.api.removeListener('check-dependencies-data', handleCheckDependenciesError)
    }
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {loading ? (
        <div>
          <h1 className="text-2xl font-bold">Checking dependencies...</h1>
          <p className="text-gray-400">This may take a few seconds</p>
          <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-500">Error</h1>
          <p>{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default CheckDependencies
