# **Translator**

Translator is a desktop app built with Electron.js, React on the frontend, and Node.js on the backend. The application uses OpenAI Whisper for audio-to-text transcription, Voicemeeter Banana for capturing system audio, and Azure AI Translator for language translation.

🚨 Note: This application is only compatible with Windows.

## **Features**
 - 🎤 Audio Capture: Capture audio from either a microphone or the system's audio output.
 - 🎤 Audio Transcription: Convert captured audio to text using OpenAI Whisper.
 - 🎤 Audio Translation: Uses Azure AI Translator for language translation. [Get your Key for Azure here](https://azure.microsoft.com/en-us/products/ai-services/ai-translator)
 - 🔊 Simulated Real-Time Transcription: Although Whisper is not designed for real-time transcription, the app simulates this behavior by continuously processing audio streams.
 - 🎧 Voicemeeter Banana Integration: Redirects system audio to a virtual microphone, allowing the captured audio to be used for transcription.
 - ⚡ Electron-Based UI: A modern interface powered by React and Electron.
 - 🐍 Python Backend: Uses Python scripts executed via Node.js for handling audio processing.

## **Requirements**
1. Install Dependencies.
    - Node.js (Latest LTS version recommended).
    - Python 3.12 (Ensure it is added to PATH).
    - Voicemeeter Banana (Required for capturing speaker audio). [Download Voicemeeter Banana here](https://vb-audio.com/Voicemeeter/banana.htm)
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

