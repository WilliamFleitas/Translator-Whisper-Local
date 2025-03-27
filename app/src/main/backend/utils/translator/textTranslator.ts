const textTranslator = async (
  text: string,
  from: string,
  to: string,
  subsKey: string | undefined,
  region: string | undefined
): Promise<string> => {
  const endpoint = 'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0'
  if (!subsKey || !region) {
    throw Error('Azure API Key or Region are missing')
  }

  try {
    const response = await fetch(`${endpoint}&from=${from}&to=${to}`, {
      method: 'POST',
      body: JSON.stringify([{ text }]),
      headers: {
        'Ocp-Apim-Subscription-Key': subsKey,
        'Ocp-Apim-Subscription-Region': region,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (response.status === 200) {
      return data[0]?.translations[0]?.text
    } else {
      throw Error(data.error.message)
    }
  } catch (error: any) {
    throw Error(error.message)
  }
}

export default textTranslator
