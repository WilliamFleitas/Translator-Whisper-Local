import json
import voicemeeterlib

def list_audio_devices():
    try:
        
        vm = voicemeeterlib.api("banana")
        vm.login()
        
        num_devices = vm.get_num_devices("out")
        devices = []

        for index in range(num_devices):
            device_description = vm.device.output(index)
            
            if device_description["type"].lower() == "wdm":
                device = {
                    "name": device_description["name"],
                    "id": device_description["id"]
                }
                devices.append(device)

        vm.logout()
        return {
            "success": True,
            "data": devices
        }

    except voicemeeterlib.error.CAPIError as e:
        return {"success": False, "error": f"Error with Voicemeeter API: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"Unexpected error: {str(e)}"}

if __name__ == "__main__":
    result = list_audio_devices()
    print(json.dumps(result))