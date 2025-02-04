import warnings
import json
from pycaw.pycaw import AudioUtilities


warnings.filterwarnings("ignore", category=UserWarning)

def get_default_playback_device():
    try:
        
        default_device = AudioUtilities.GetSpeakers()
        default_device_id = default_device.GetId()

        
        all_devices = AudioUtilities.GetAllDevices()

        
        for device in all_devices:
            if device.id == default_device_id:
                
                return {
                    "success": True,
                    "data": {
                        "id": device.id,
                        "name": device.FriendlyName
                    }
                }

        
        return {
            "success": False,
            "error": "Default output device not found."
        }
    except Exception as e:
        
        return {
            "success": False,
            "error": f"Error getting the default output device: {str(e)}"
        }

if __name__ == "__main__":
    
    result = get_default_playback_device()
    
    print(json.dumps(result))