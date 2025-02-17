import whisper
import json
import os

def get_available_models():
    try:
        user_directory = os.path.expanduser("~")
        model_directory = os.path.join(user_directory, "AppData", "Local", "whisperModels")
        
        if not os.path.exists(model_directory):
            os.makedirs(model_directory)
        
        
        available_models = whisper.available_models()
        model_details = []

        
        for model_name in available_models:
            model_path = os.path.join(model_directory, f"{model_name}.pt")
            
            
            if os.path.exists(model_path):
                model_details.append({
                    "model": model_name,
                    "installed": True
                })
            else:
                model_details.append({
                    "model": model_name,
                    "installed": False
                })

        return {
            "success": True,
            "data": model_details
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"There was an error getting the available models: {str(e)}"
        }

if __name__ == "__main__":
    result = get_available_models()
    
    print(json.dumps(result))