# **Translator**

Translator is a desktop application built with Electron, featuring a React frontend, a Node.js backend, and Python scripts for audio transcription. The app utilizes OpenAI Whisper for transcribing audio into text and Voicemeeter Banana to enable capturing system output audio as a virtual microphone.

🚨 Note: This application is only compatible with Windows.

## **Features**
  - 🎤 Audio Transcription: Converts audio from a microphone or speaker into text using OpenAI Whisper.
  - 🔊 Simulated Real-Time Transcription: Although Whisper is not designed for real-time transcription, the app simulates this behavior by continuously processing audio streams.
  - 🎧 Voicemeeter Banana Integration: Redirects system audio to a virtual microphone, allowing transcription of speaker output.
  - ⚡ Electron-Based UI: Modern interface powered by React and Electron.
  - 🐍 Python Backend: Uses Python scripts executed via Node.js for handling audio processing.

## **Requirements**
1. Install Dependencies.
    - Node.js (Latest LTS version recommended).
    - Python 3.12 (Ensure it is added to PATH).
    - Voicemeeter Banana (Required for capturing speaker audio).
2. Setup Python Environment. This project uses a virtual environment to manage Python dependencies. Run the following commands in PowerShell:
    ```
      cd app
      python -m venv venv
      venv\Scripts\activate
      pip install -r requirements.txt
    ```

3. Install Node.js Dependencies.<br/>
     - Run the following command in the root directory of the project to install dependencies: `npm install`
     - Running the Application. To start the application in development mode: `npm run dev`
     - To rebuild dependencies after installing or modifying native modules: `npm rebuild`
     - To package the application for distribution: `npm run build`


## **How It Works**
By default, the app captures audio from the microphone and sends it to OpenAI Whisper for transcription.
To capture speaker audio instead of the microphone, the app integrates with Voicemeeter Banana:
Voicemeeter creates virtual audio devices.
The selected speaker output is routed to a virtual microphone.
Whisper receives this virtual microphone input, simulating real-time transcription.
Although Whisper does not support real-time streaming, this app simulates continuous transcription by processing short audio segments in sequence.
