import { IoCheckmarkSharp } from 'react-icons/io5'
import { FaExclamation, FaInfo } from 'react-icons/fa'
import DefaultLoading from '../loading/DefaultLoading'

const icons = {
  success: (
    <div className="border rounded-full min-h-[1.4rem] min-w-[1.4rem] flex text-start items-center justify-center border-white bg-white overflow-hidden isolate">
      <IoCheckmarkSharp className="text-green-500 h-3 w-3" />
    </div>
  ),
  error: (
    <div className="border rounded-full min-h-[1.4rem] min-w-[1.4rem] flex text-start items-center justify-center border-white bg-white overflow-hidden isolate">
      <FaExclamation className="text-red-500 h-3 w-3" />
    </div>
  ),
  info: (
    <div className="border rounded-full min-h-[1.4rem] min-w-[1.4rem] flex text-start items-center justify-center border-white bg-white overflow-hidden isolate">
      <FaInfo className="text-blue-600 h-3 w-3 " />
    </div>
  ),
  warning: (
    <div className="border rounded-full min-h-[1.4rem] min-w-[1.4rem] flex text-start items-center justify-center border-white bg-white overflow-hidden isolate">
      <FaExclamation className="text-red-500 h-3 w-3" />
    </div>
  )
}

type GetToastifyIconType = 'info' | 'warning' | 'error' | 'success'

const GetToastifyIcon = (type: GetToastifyIconType): React.ReactElement => {
  return (
    icons[type] || (
      <div className="">
        <DefaultLoading size={1.5} color={'#fff'} />
      </div>
    )
  )
}

export default GetToastifyIcon
