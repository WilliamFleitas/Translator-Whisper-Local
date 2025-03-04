document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('minimize-btn').addEventListener('click', () => {
    window.api.windowControls.minimize()
  })

  document.getElementById('maximize-btn').addEventListener('click', () => {
    window.api.windowControls.maximize()
  })

  document.getElementById('close-btn').addEventListener('click', () => {
    window.api.windowControls.close()
  })
})
