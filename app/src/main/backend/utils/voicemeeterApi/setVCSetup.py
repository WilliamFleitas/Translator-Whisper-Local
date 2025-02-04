import sys
import voicemeeterlib
import json


def set_hardware_out_a1(device_name):
    try:
        
        vm = voicemeeterlib.api("banana")
        vm.login()

        
        num_devices = vm.get_num_devices("out")

        
        for index in range(num_devices):
            device = vm.device.output(index)
            if device["name"].lower() == device_name.lower() and device["type"].lower() == "wdm":
                
                vm.bus[0].device.wdm = device["name"]
                
                vm.apply(
                    {   
                        "strip-0": {"A1": False, "A2": False, "A3": False, "B1": False, "B2": False},
                        "strip-1": {"A1": False, "A2": False, "A3": False, "B1": False, "B2": False},
                        "strip-2": {"A1": False, "A2": False, "A3": False, "B1": False, "B2": False},
                        "strip-3": {"A1": False, "A2": False, "A3": False, "B1": False, "B2": False},
                        "strip-4": {"A1": True, "A2": False, "A3": False, "B1": True, "B2": False},
                        "bus-0": {"mono": True, "mute": False},
                        "bus-1": {"mono": False, "mute": False},
                        "bus-2": {"mono": False, "mute": False},
                        "bus-3": {"mono": False, "mute": False},
                        "bus-4": {"mono": False, "mute": False},
                    }
                )
                vm.logout()
                return {
                    "success": True,
                    "data": {
                        "device_name": f'{device_name}',
                        "message": f"Device '{device_name}' is configured as output A1."
                    }
                }

        vm.logout()
        return {
            "success": False,
            "error": f"No device found with name '{device_name}'",
        }

    except voicemeeterlib.error.CAPIError as e:
        return {"success": False, "error": f"Error with Voicemeeter API: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"error: {str(e)}"}


if __name__ == "__main__":
    
    if len(sys.argv) < 2:
        print({"success": False, "error": "One parameter is required: <device_name>."})
        sys.exit(1)

    device_name = sys.argv[1]

    result = set_hardware_out_a1(device_name)
    print(json.dumps(result))