import PCAudioTranslator from './components/audioTranslator/PCAudioTranslator'

const TranslatorPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full text-start items-start justify-start h-dvh">
      <header className="flex flex-row text-start items-center justify-between w-full h-fit py-6 px-4 md:px-8 border-b-2 border-secondary-background">
        <div className="flex w-fit whitespace-nowrap">
          <strong className="text-[1.4rem] font-extrabold tracking-wide">Translator</strong>
        </div>

        <nav className="flex flex-row w-full h-fit text-start items-center justify-end gap-4 text-2xl">
          <button className="font-bold tracking-wide">About</button>
          <button className="font-bold tracking-wide">Settings</button>
        </nav>
      </header>

      <main className="flex flex-col w-full h-full">
        <PCAudioTranslator />
      </main>
    </div>
  )
}

export default TranslatorPage
