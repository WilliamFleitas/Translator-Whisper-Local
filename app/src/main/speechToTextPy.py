import os
import sounddevice as sd
import sys
import time
import numpy as np
from google.cloud import speech
import pyaudio

# Configura tu clave de API de Google Cloud desde las variables de entorno
credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
if not credentials_path:
    print("No se encontró la variable de entorno GOOGLE_APPLICATION_CREDENTIALS.")
    exit(1)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path

client = speech.SpeechClient()


# Parámetros para la grabación
RATE = 16000
CHANNELS = 1
FORMAT = np.int16
CHUNK = 1024

# Configuración para el reconocimiento de voz
streaming_config = speech.StreamingRecognitionConfig(
    config=speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=RATE,
        language_code="en-US",
    ),
    interim_results=True,  # Asegura que se obtengan resultados intermedios
)

audio = pyaudio.PyAudio()


# Captura de audio y streaming a Google Cloud
def recognize_stream(source_type="mic"):
    print(f"Listening for 5 seconds using {source_type}...")

    # Temporizador de 5 segundos
    start_time = time.time()

    for i in range(audio.get_device_count()): 
        device_info = audio.get_device_info_by_index(i)
        print(f"device {i}: {device_info["name"]}")
    audio.terminate()
        
    # Función generadora para capturar audio
    def audio_generator():
        if source_type == "mic":
            with sd.InputStream(samplerate=RATE, channels=CHANNELS, dtype=FORMAT) as stream:
                while True:
                    if time.time() - start_time > 5:  # Si han pasado 5 segundos
                        break
                    audio_data, overflowed = stream.read(CHUNK)
                    yield speech.StreamingRecognizeRequest(audio_content=audio_data.tobytes())
        elif source_type == "speaker":
            # Para capturar audio del altavoz, usaremos la salida del sistema
            with sd.InputStream(samplerate=RATE, channels=CHANNELS, dtype=FORMAT, device="default") as stream:
                while True:
                    if time.time() - start_time > 5:  # Si han pasado 5 segundos
                        break
                    audio_data, overflowed = stream.read(CHUNK)
                    yield speech.StreamingRecognizeRequest(audio_content=audio_data.tobytes())
        else:
            raise ValueError("source_type debe ser 'mic' o 'speaker'")

    # Inicia el flujo de reconocimiento
    recognize_stream = client.streaming_recognize(streaming_config, audio_generator())

    # Envía el audio a la API y procesa los resultados
    for response in recognize_stream:
        for result in response.results:
            if result.is_final:
                print(f"Final Transcript: {result.alternatives[0].transcript}")
            if result.alternatives and not result.is_final:
                print(f"Interim Transcript: {result.alternatives[0].transcript}")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Uso: python script.py <mic|speaker>")
        sys.exit(1)

    source_type = sys.argv[1]
    if source_type not in ["mic", "speaker"]:
        print("El parámetro debe ser 'mic' o 'speaker'.")
        sys.exit(1)

    print("El script de Python está funcionando correctamente.")
    recognize_stream(source_type)