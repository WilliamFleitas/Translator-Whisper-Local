import sys
import json
import os
from contextlib import redirect_stdout, redirect_stderr

try:
    import voicemeeterlib
except Exception as e:
    print({"success": False, "error": "Voicemeeter Banana is not installed."})
    sys.exit(1)

kind_id = 'banana'

def open_or_close_voicemeeter(action):
    try:
        
        with open(os.devnull, 'w') as devnull:
            with redirect_stdout(devnull), redirect_stderr(devnull):
                vm = voicemeeterlib.api(kind_id)

        if action == "open":
            try:
                vm.run_voicemeeter(kind_id)
                return {"success": True, "message": "Voicemeeter Banana has started successfully."}
            except voicemeeterlib.error.CAPIError as e:
                if e.args[1] == -1:
                    return {"success": False, "error": "Voicemeeter Banana is not installed."}
                else:
                    return {"success": False, "error": f"{str(e)}"}

        elif action == "close":
            try:
                with open(os.devnull, 'w') as devnull:
                    with redirect_stdout(devnull), redirect_stderr(devnull):
                        vm.login()
                        vm.command.shutdown()
                        vm.logout()
                return {"success": True, "message": "Voicemeeter Banana has been closed successfully."}
            except voicemeeterlib.error.CAPIError as e:
                if e.args[1] == -1:
                    return {"success": False, "error": "Voicemeeter Banana is not installed."}
                else:
                    return {"success": False, "error": f"{str(e)}"}
        else:
            return {"success": False, "error": "Use 'open' or 'close'."}

    except Exception as e:
        return {"success": False, "error": f"general exception: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print({"success": False, "error": "An argument is required: 'open' or 'close'."})
    else:
        action = sys.argv[1]
        result = open_or_close_voicemeeter(action)
        print(json.dumps(result))