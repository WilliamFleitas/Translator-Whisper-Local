import { useEffect, useState } from 'react'

interface TranslationListener {
  translationSentence: string
  translationError: string | null
  setTranslationSentence: React.Dispatch<React.SetStateAction<string>>
  setTranslationError: React.Dispatch<React.SetStateAction<string | null>>
}

const useTranslationListener = (): TranslationListener => {
  const [translationSentence, setTranslationSentence] = useState<string>('')
  const [translationError, setTranslationError] = useState<string | null>(null)

  useEffect(() => {
    const handleTranslationData = (_event: unknown, data: string): void => {
      setTranslationSentence((prev) => prev + data)
    }

    const handleTranslationError = (_event: unknown, data: string): void => {
      setTranslationError(data)
    }

    window.api.on('translation-data', handleTranslationData)
    window.api.on('translation-error-data', handleTranslationError)

    return (): void => {
      window.api.removeListener('translation-data', handleTranslationData)
      window.api.removeListener('translation-error-data', handleTranslationError)
      setTranslationError(null)
    }
  }, [])

  return { translationSentence, translationError, setTranslationSentence, setTranslationError }
}

export default useTranslationListener
