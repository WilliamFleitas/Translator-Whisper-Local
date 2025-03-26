import os
import pyaudio
import sys
import time
import json
import torch
import whisper
import numpy as np
import functools
# import wave
import threading
import queue

RATE = 16000
CHANNELS = 1
FORMAT = pyaudio.paInt16
CHUNK = 512

sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8')

def send_error_message(error_message):
    sys.stdout.write(json.dumps({"success": False, "error": error_message}) + "\n")
    sys.stdout.flush()

def transcribe_audio(audio_buffer, model, process_device, audio_language):
    try:
        fp16_mode = process_device == "cuda"
        audio_data = np.frombuffer(audio_buffer, dtype=np.int16).astype(np.float32) / 32768.0
        audio_data = whisper.pad_or_trim(audio_data)
        result = model.transcribe(
            audio_data, 
            language=audio_language, 
            compression_ratio_threshold=2.0, 
            logprob_threshold=-1.0, 
            temperature=0, 
            fp16=fp16_mode
            )
        return result["text"]
    except Exception as e:
        send_error_message(f"Error transcribing audio: {str(e)}")
        return ""
def capture_audio(audio, stream, audio_queue, duration, start_time, device_index, CHUNK, RATE, capture_done_event):
    while duration is None or (time.time() - start_time) < duration:
        try:
            data = stream.read(CHUNK, exception_on_overflow=False)
            audio_queue.put(data)
            # wav_file.writeframes(data)
        except Exception as e:
            send_error_message(f"Error capturing audio: {str(e)}")
            break
    capture_done_event.set()


def process_transcriptions(audio_queue, model, process_device, capture_done_event, audio_language):
    audio_buffer = bytearray()
    while True:
        try:
            data = audio_queue.get(timeout=3)
            audio_buffer.extend(data)
        except queue.Empty:
            if capture_done_event.is_set():
                sys.stdout.write(json.dumps({"success": True, "data": {"status": 1, "message": "Audio capturing ended."}}))
                sys.stdout.flush()
                break
            continue

        if len(audio_buffer) >= RATE * 6:
            transcript = transcribe_audio(audio_buffer, model, process_device, audio_language)
            sys.stdout.write(json.dumps({"success": True, "data": {"status": 0, "transcription": transcript}}, ensure_ascii=False) + "\n")
            sys.stdout.flush()
            audio_buffer.clear()

        if capture_done_event.is_set() and audio_queue.empty():
            sys.stdout.write(json.dumps({"success": True, "data": {"status": 1, "message": "Audio capturing ended."}}))
            sys.stdout.flush()
            break


def recognize_stream(source_type="mic", durationTime="60", process_device="cpu", model_name="tiny", audio_language="en"):
    try:
        model_path = os.path.join(os.path.expanduser("~"), "AppData", "Local", "whisperModels")
        whisper.torch.load = functools.partial(whisper.torch.load, weights_only=True)
        model = whisper.load_model(model_name, download_root=model_path, device=process_device)
        sys.stdout.write(json.dumps({"success": True, "data": {"status": 2, "message": "Model loaded successfully."}}, ensure_ascii=False) + "\n")
        sys.stdout.flush()
        audio = pyaudio.PyAudio()
        stream = None
        # output_filename = "output.wav"
        # wav_file = wave.open(output_filename, "wb")
        # wav_file.setnchannels(CHANNELS)
        # wav_file.setsampwidth(audio.get_sample_size(FORMAT))
        # wav_file.setframerate(RATE)

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
            raise Exception({"success": False, "error": f"error starting audio capture: {str(e)}"})

        duration = None if durationTime.lower() == "unlimited" else int(durationTime)
        start_time = time.time()
        audio_queue = queue.Queue()

        capture_done_event = threading.Event()
        capture_thread = threading.Thread(target=capture_audio, args=(audio, stream, audio_queue, duration, start_time, device_index, CHUNK, RATE, capture_done_event))
        capture_thread.start()

        transcription_thread = threading.Thread(target=process_transcriptions, args=(audio_queue, model, process_device, capture_done_event, audio_language))
        transcription_thread.start()

        capture_thread.join()
        transcription_thread.join()
        
        if stream:
            stream.stop_stream()
            stream.close()
            # wav_file.close()
        audio.terminate()
        return {
            "success": True,
            "data": {"status": 1, "message": "Audio capture ended"}
        }
    except Exception as e:
        send_error_message(str(e))
        sys.exit(1)

if __name__ == '__main__':
    try:
        if len(sys.argv) != 6 or sys.argv[1].lower() not in ["mic", "speaker"] or sys.argv[2].lower() not in ['unlimited', "60", "600", "1800", "3600"] or sys.argv[3].lower() not in ["hip", "cuda", "cpu"] or sys.argv[4].lower() not in ['tiny', 'base', 'small', 'medium', 'large-v1', 'large-v2', 'large-v3', 'large', 'large-v3-turbo', 'turbo', 'tiny.en', 'base.en', 'small.en', 'medium.en'] or sys.argv[5].lower() not in ["en", "es", "fr", "de", "it", "pt", "ru", "ar", "zh", "ja", "ko", "hi", "tr", "pl", "nl", "sv", "da", "no", "fi", "cs"]:
            raise ValueError("Usage: python script.py <mic|speaker> <durationTime> <hip|cuda|cpu> or <model_name not found> or <language not found>")
        recognize_stream(sys.argv[1].lower(), sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
    except Exception as e:
        send_error_message(f"Startup error: {str(e)}")
        sys.exit(1)