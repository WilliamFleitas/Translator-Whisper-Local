import PCAudioTranslator from './components/PCAudioTranslator'

const TranslatorPage: React.FC = () => {
  return (
    <div className='flex flex-col w-full h-fit text-start items-start justify-start bg-green-400'>
      <strong>Translator page</strong>

      <main className='flex flex-col w-full h-fit'>
        <PCAudioTranslator />
      </main>
    </div>
  )
}

export default TranslatorPage
