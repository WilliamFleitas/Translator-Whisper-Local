import sys
import json
import voicemeeterlib


def set_hardware_out_a1():
    try:
        
        vm = voicemeeterlib.api("banana")
        vm.login()

        
        strip_A1_status = vm.strip[4].A1
        strip_B1_status = vm.strip[4].B1
        bus_0_device_name = vm.bus[0].device.name 

           
        data = {
                "strip_A1": strip_A1_status,
                "strip_B1": strip_B1_status,
                "bus_0_name": bus_0_device_name,
               }
 
        vm.logout()
        return {
            "success": True,
            "data": data,
        }

    except voicemeeterlib.error.CAPIError as e:
        return {"success": False, "error": f"Error with Voicemeeter API: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"{str(e)}"}


if __name__ == "__main__":
    
    result = set_hardware_out_a1()
    print(json.dumps(result))