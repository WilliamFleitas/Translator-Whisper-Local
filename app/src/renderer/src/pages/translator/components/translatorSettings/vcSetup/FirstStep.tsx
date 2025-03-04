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
      {voicemeeterIsRunning !== null ? (
        <dl className="flex flex-row flex-wrap text-start items-center justify-between w-full px-4 md:px-8 gap-4 text-[0.9rem] pb-4">
          {voicemeeterIsRunning !== null &&
          voicemeeterIsRunning.active &&
          currentVCSetup !== null ? (
            <>
              <div className="flex flex-row flex-grow  text-start items-center justify-between bg-primary-button rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
                <dt className="pl-4 text-lg">
                  <span className="">
                    A1 Output Channel {currentVCSetup.strip_A1 ? 'On' : 'Off'}
                  </span>
                </dt>
                <dd
                  className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                    currentVCSetup.strip_A1
                      ? 'text-success border-success bg-success/15'
                      : 'text-danger border-danger bg-danger/15'
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
              <div className="flex flex-row flex-grow  text-start items-center justify-between bg-primary-button rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
                <dt className="pl-4 text-lg">
                  <span>B1 Output Channel {currentVCSetup.strip_B1 ? 'On' : 'Off'}</span>
                </dt>
                <dd
                  className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                    currentVCSetup.strip_B1
                      ? 'text-success border-success bg-success/15'
                      : 'text-danger border-danger bg-danger/15'
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
          <div className="flex flex-row flex-grow  text-start items-center justify-between bg-primary-button rounded-md gap-4 font-bold h-[3rem] w-fit min-w-[17rem]">
            <dt className="pl-4 flex flex-row justify-between flex-grow gap-4 text-start items-center  truncate text-lg">
              <span
                className="flex w-fit flex-col text-start truncate"
                title={voicemeeterIsRunning.message}
              >
                {voicemeeterIsRunning.message}
              </span>
              <button
                type="button"
                title="Update status"
                className="flex flex-row text-start items-center justify-start border-2 border-success text-success gap-4 w-fit h-fit p-2  rounded-full bg-secondary-background hover:bg-secondary-background-hover cursor-pointer"
                onClick={() => handleCheckIfVoicemeeterIsRunning()}
              >
                <GrUpdate className="w-3 h-3 " />
              </button>
            </dt>
            <dd
              className={`border-2  px-4 h-full flex flex-col rounded-md  text-start items-center justify-center ${
                voicemeeterIsRunning.active
                  ? 'text-success border-success bg-success/15'
                  : 'text-danger border-danger bg-danger/15'
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
        <div className="flex flex-row flex-wrap text-start items-center justify-start w-full h-fit  gap-4  px-4 md:px-8">
          <strong className="border-t-2 border-primary-button mt-4  pt-4 text-3xl w-full pb-2">
            You can open your Voicemeeter Banana manually and then press the update status button
            or:
          </strong>
          <button
            className="w-full h-fit py-3 px-6 rounded-md bg-blue-400 hover:bg-blue-500 font-bold cursor-pointer text-xl"
            type="button"
            onClick={() => handleOpenOrCloseVCB('open')}
          >
            Click here to run Voicemeeter Banana
          </button>
        </div>
      )}
    </>
  )
}

export default FirstStep
