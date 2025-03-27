import PCAudioTranslator from './components/audioTranslator/PCAudioTranslator'

const TranslatorPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full text-start items-start justify-start h-dvh">
      <main className="flex flex-col w-full h-full border-t   border-secondary-button ">
        <PCAudioTranslator />
      </main>
    </div>
  )
}

export default TranslatorPage
