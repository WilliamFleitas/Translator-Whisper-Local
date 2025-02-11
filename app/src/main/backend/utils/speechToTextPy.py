import os
import pyaudio
import sys
import time
import json
from dotenv import load_dotenv
from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
)

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.env"))
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    print(json.dumps({"success": False, "error": "Error: .env file not found"}))
    sys.exit(1)

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
if not DEEPGRAM_API_KEY:
    print(json.dumps({"success": False, "error": "Deepgram API key not found. Check .env file."}))
    sys.exit(1)

RATE = 16000
CHANNELS = 1
FORMAT = pyaudio.paInt16
CHUNK = 1024

def send_error_message(error_message):
    sys.stdout.write(json.dumps({"success": False, "error": error_message}) + "\n")
    sys.stdout.flush()

def recognize_stream(source_type="mic", durationTime="60"):
    try:
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)
        dg_connection = deepgram.listen.websocket.v("1")

        def on_message(self, result, **kwargs):
            try:
                sentence = result.channel.alternatives[0].transcript
                words = result.channel.alternatives[0].words
                response = {"success": True, "data": {"sentence": sentence, "words": [], "channel_info": {
                                "is_final": result.is_final, "speech_final": result.speech_final,"from_finalize": result.from_finalize}}}

                if words:
                    for word in words:
                        response["data"]["words"].append({"word": word.word})

                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
            except Exception as e:
                send_error_message(f"Error processing transcription: {str(e)}")

        def on_error(error):
            send_error_message(f"Deepgram error: {str(error)}")

        dg_connection.on("error", on_error)
        dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)

        options = LiveOptions(model="enhanced", encoding="linear16", sample_rate=RATE, channels=CHANNELS, interim_results=True, language= "es-LATAM")

        audio = pyaudio.PyAudio()
        stream = None

        try:
            if not dg_connection.start(options):
                raise Exception("Failed to start connection with Deepgram. Check API Key or network connection.")

            device_index = None
            if source_type == "speaker":
                for i in range(audio.get_device_count()):
                    if "Voicemeeter Out B1" in audio.get_device_info_by_index(i)["name"]:
                        device_index = i
                        break

            try:
                stream = audio.open(
                    format=FORMAT,
                    channels=CHANNELS,
                    rate=RATE,
                    input=True,
                    frames_per_buffer=CHUNK,
                    input_device_index=device_index,
                )
            except Exception as e:
                raise Exception(f"Failed to open audio stream: {str(e)}")
            
            if durationTime.lower() == "unlimited":
                duration = None
            else:
                try:
                    duration = int(durationTime)
                except ValueError:
                    raise Exception("Invalid durationTime value. Use 'unlimited' or a valid number of seconds.")

            start_time = time.time()
            last_keep_alive = time.time()

            while duration is None or (time.time() - start_time) < duration:
                try:
                    data = stream.read(CHUNK, exception_on_overflow=False)
                    dg_connection.send(data)
                except Exception as e:
                    send_error_message(f"Audio stream error: {str(e)}")
                    break

                if time.time() - last_keep_alive >= 5:
                    keep_alive_msg = json.dumps({"type": "KeepAlive"})
                    dg_connection.send(keep_alive_msg.encode())
                    last_keep_alive = time.time()
        
        finally:
            if stream:
                stream.stop_stream()
                stream.close()
            audio.terminate()
            dg_connection.finish()

    except Exception as e:
        send_error_message(str(e))
        sys.exit(1)

if __name__ == '__main__':
    try:
        if len(sys.argv) != 3 or sys.argv[1].lower() not in ["mic", "speaker"]:
            raise ValueError("Usage: python script.py <mic|speaker> <durationTime>")
        recognize_stream(sys.argv[1].lower(), sys.argv[2])
    except Exception as e:
        send_error_message(f"Startup error: {str(e)}")
        sys.exit(1)