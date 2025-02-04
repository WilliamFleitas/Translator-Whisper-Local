import psutil
import json

def check_voicemeeter_running():
    try:
        
        for process in psutil.process_iter(attrs=['name']):
            process_name = process.info['name'].lower()
            if 'voicemeeterpro.exe' in process_name or 'voicemeeterpro_x64.exe' in process_name:
                return {"success": True, "data": {"active": True, "message": "Voicemeeter is running."}}
        return {"success": True, "data": {"active": False, "message": "Voicemeeter is not running."}}
    except Exception as e:
        return {"success": False, "error": f"Error with Voicemeeter: {str(e)}"}

if __name__ == "__main__":
    status = check_voicemeeter_running()
    print(json.dumps(status))