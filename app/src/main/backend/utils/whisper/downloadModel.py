import whisper
import os
import sys
import json

def download_model_to_custom_path(model_name):
    try:
        user_directory = os.path.expanduser("~")  
        custom_model_path = os.path.join(user_directory, "AppData", "Local", "whisperModels")  

        if not os.path.exists(custom_model_path):
            os.makedirs(custom_model_path)
            
        model_file_path = os.path.join(custom_model_path, f"{model_name}.pt")
        if os.path.exists(model_file_path):
            return {
                "success": True,
                "data": {
                    "model_name": model_name,
                    "status": 0,
                    "message": f"The model '{model_name}' is already downloaded in {custom_model_path}."
                }
            }
        if model_name not in whisper._MODELS:
            return {
                "success": False,
                "error": f"The model '{model_name}' is not available in _MODELS."
            }
        
        model_url = whisper._MODELS[model_name]

        whisper._download(url=model_url, root=custom_model_path, in_memory=False)

        return {
            "success": True,
            "data": {
                "model_name": model_name,
                "status": 1,
                "message": f"The model was successfully downloaded to {custom_model_path}"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"There was an error downloading the model: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print({"success": False, "error": "One parameter is required: <model_name>."})
        sys.exit(1)

    
    model_name = sys.argv[1]
    result = download_model_to_custom_path(model_name)
    print(json.dumps(result))