import { IoCloseSharp } from 'react-icons/io5'
import { GrUpdate } from 'react-icons/gr'
import { IoCheckmarkSharp } from 'react-icons/io5'
import {
  CheckVoicemeeterIsRunningType,
  VCSettingsStatusType
} from '../../../../../globalTypes/globalApi'

interface FirstStepPropsType {
  voicemeeterIsRunning: CheckVoicemeeterIsRunningType | null
  currentVCSetup: VCSettingsStatusType | null
  handleCheckIfVoicemeeterIsRunning: () => void
  handleOpenOrCloseVCB: (queryType: 'open' | 'close') => void
}

const FirstStep = ({
  voicemeeterIsRunning,
  currentVCSetup,
  handleCheckIfVoicemeeterIsRunning,
  handleOpenOrCloseVCB
}: FirstStepPropsType): React.ReactElement => {
  return (
    <>
      {/* <div className="flex flex-col w-full h-fit text-start items-startq justify-start">
        <strong>
          To capture the desktop audio, first, we need to create two virtual audio channels, one for
          the output and the other for the input. We will redirect the audio from the selected
          output device to a virtual channel called Voicemeeter AUX Input, which will be set as the
          default device.
        </strong>
        <strong>
          This will route all the audio from the PC through this device. Next, we will capture the
          audio from Voicemeeter AUX Input and redirect it to an input device called Voicemeeter Out
          B1, which will act as a virtual microphone. This allows the audio from our PC to be sent
          through that microphone device. We do all of this so we can use the audio from the virtual
          microphone with the Google Speech-to-Text API for audio streaming.
        </strong>
        <strong>
          But dont worry! We'll handle all the setup. Make sure you have the Voicemeeter Banana
          application installed.
        </strong>
      </div> */}
      {voicemeeterIsRunning !== null ? (
        <dl className="flex flex-row flex-wrap text-start items-center justify-between w-full bg-zinc-700 py-2 px-6 md:px-10 gap-4 text-[0.9rem]">
          {voicemeeterIsRunning !== null &&
          voicemeeterIsRunning.active &&
          currentVCSetup !== null ? (
            <>
              <div className="flex flex-row flex-grow  text-start items-center justify-between bg-[#002634] rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
                <dt className="pl-4 ">
                  <span className="">
                    A1 Output Channel {currentVCSetup.strip_A1 ? 'On' : 'Off'}
                  </span>
                </dt>
                <dd
                  className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                    currentVCSetup.strip_A1
                      ? 'text-green-400 border-green-400'
                      : 'text-red-400 border-red-400'
                  }`}
                >
                  {currentVCSetup.strip_A1 ? (
                    <>
                      <IoCheckmarkSharp className="w-5 h-5 " />
                    </>
                  ) : (
                    <>
                      <IoCloseSharp className="w-5 h-5 " />
                    </>
                  )}
                </dd>
              </div>
              <div className="flex flex-row flex-grow  text-start items-center justify-between bg-[#002634] rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
                <dt className="pl-4 ">
                  <span>B1 Output Channel {currentVCSetup.strip_B1 ? 'On' : 'Off'}</span>
                </dt>
                <dd
                  className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                    currentVCSetup.strip_B1
                      ? 'text-green-400 border-green-400'
                      : 'text-red-400 border-red-400'
                  }`}
                >
                  {currentVCSetup.strip_B1 ? (
                    <>
                      <IoCheckmarkSharp className="w-5 h-5 " />
                    </>
                  ) : (
                    <>
                      <IoCloseSharp className="w-5 h-5 " />
                    </>
                  )}
                </dd>
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="flex flex-row flex-grow  text-start items-center justify-between bg-[#002634] rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
            <dt className="pl-4 flex flex-row justify-between flex-grow gap-4 text-start items-center  truncate">
              <span
                className="flex w-fit flex-col text-start truncate"
                title={voicemeeterIsRunning.message}
              >
                {voicemeeterIsRunning.message}
              </span>
              <button
                type="button"
                title="Update status"
                className="flex flex-row text-start items-center justify-start border-2 border-green-500 text-green-500 gap-4 w-fit h-fit p-2  rounded-full bg-gray-700 hover:bg-gray-800 "
                onClick={() => handleCheckIfVoicemeeterIsRunning()}
              >
                <GrUpdate className="w-3 h-3 " />
              </button>
            </dt>
            <dd
              className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                voicemeeterIsRunning.active
                  ? 'text-green-400 border-green-400'
                  : 'text-red-400 border-red-400'
              }`}
            >
              {voicemeeterIsRunning.active ? (
                <>
                  <IoCheckmarkSharp className="w-5 h-5 " />
                </>
              ) : (
                <>
                  <IoCloseSharp className="w-5 h-5 " />
                </>
              )}
            </dd>
          </div>
        </dl>
      ) : (
        <></>
      )}

      {voicemeeterIsRunning === null ||
      (voicemeeterIsRunning !== null && voicemeeterIsRunning.active) ? (
        <></>
      ) : (
        <div className="flex flex-row flex-wrap text-start items-center justify-start w-full h-fit my-4 border-t-2 pt-4 gap-4 border-gray-700 px-6 md:px-10">
          <strong>
            You can open your Voicemeeter Banana manually and then press the update status button
            or:
          </strong>
          <button
            className="w-full h-fit py-2 px-6 rounded-md bg-gray-700 hover:bg-gray-800 font-bold"
            type="button"
            onClick={() => handleOpenOrCloseVCB('open')}
          >
            Click here to open Voicemeeter Banana
          </button>
        </div>
      )}
    </>
  )
}

export default FirstStep
