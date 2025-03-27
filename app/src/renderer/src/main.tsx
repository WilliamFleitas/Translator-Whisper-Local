import './main.css'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastContainer } from 'react-toastify'
import GetToastifyIcon from './components/toastify/AlertIcons'
import './components/toastify/AlertIcons.css'
import React from 'react'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <React.StrictMode>
      <App />
      <ToastContainer
        toastClassName={'Toastify__toast '}
        icon={({ type }) => GetToastifyIcon(type as 'info' | 'warning' | 'error' | 'success')}
        position="bottom-center"
        autoClose={5000}
        closeOnClick
        pauseOnHover
        theme="dark"
        className={'z-50 '}
      />
    </React.StrictMode>
  </>
)
