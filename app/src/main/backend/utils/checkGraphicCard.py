import subprocess
import shutil
import importlib.metadata
import sys
import json
sys.stdout.reconfigure(line_buffering=True, write_through=True)

def conver_to_json(text_to_convert):
    return json.dumps({ "success" : True, "data" : { "interim_message" : text_to_convert, "status": 0 }})

def detect_gpu():
    """
    Detects the type of GPU available.
    Returns "nvidia" if an NVIDIA GPU is found, "amd" if an AMD GPU is detected, otherwise "cpu".
    """
    try:
        output = subprocess.check_output(["nvidia-smi"], stderr=subprocess.DEVNULL, universal_newlines=True)
        if "NVIDIA" in output:
            print(conver_to_json("NVIDIA GPU found"))
            return "nvidia"
    except FileNotFoundError:
        pass

    if shutil.which("rocminfo") is not None or shutil.which("clinfo") is not None:
        print(conver_to_json("AMD GPU found"))
        return "amd"

    print(conver_to_json("No GPU found, defaulting to CPU"))
    return "cpu"

def is_torch_installed(gpu_type):
    """
    Checks if the correct version of torch is installed based on the detected GPU type.
    """
    try:
        installed_version = importlib.metadata.version("torch")
        text_to_print = f"Installed Torch version: {installed_version}"
        print(conver_to_json(text_to_print))
        if gpu_type == "nvidia" and ("cu" in installed_version or "cuda" in installed_version):
            print(conver_to_json("NVIDIA-compatible Torch is already installed"))
            return True
        elif gpu_type == "amd" and "rocm" in installed_version:
            print(conver_to_json("AMD-compatible Torch is already installed"))
            return True
        elif gpu_type == "cpu" and ("cpu" in installed_version or "+" not in installed_version):
            print(conver_to_json("CPU-compatible Torch is already installed"))
            return True

        print(conver_to_json("Incorrect Torch version detected, reinstallation needed"))
        return False
    except importlib.metadata.PackageNotFoundError:
        print(conver_to_json("Torch is not installed"))
        return False

def install_torch(gpu_type):
    """
    Installs the appropriate version of torch for the detected GPU type.
    Returns an object with success status, message, and additional data.
    """
    if is_torch_installed(gpu_type):
        return {
            "success": True,
            "data": {
                "gpu_type": gpu_type,
                "message": f"Torch is already installed for {gpu_type}.", "status": 1 
            }
        }
    
    install_command = f'"{sys.executable}" -m pip install --force-reinstall -q torch torchaudio'  

    if gpu_type == "nvidia":
        install_command += " --index-url https://download.pytorch.org/whl/cu124"
    elif gpu_type == "amd":
        install_command += " --index-url https://download.pytorch.org/whl/rocm5.4.2"
    else:
        install_command += " --index-url https://download.pytorch.org/whl/cpu"

    try:
        text_to_print = f"Running command: {install_command}"
        print(conver_to_json(text_to_print))
        subprocess.run(install_command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        return {
            "success": True,
            "data": {
                "gpu_type": gpu_type,
                "message": f"Torch successfully installed for {gpu_type}.", "status": 2 
            }
        }
    except subprocess.CalledProcessError as e:
        return {
            "success": False,
            "error": f"Failed to install Torch: {str(e)}"
        }

if __name__ == "__main__":
    gpu_type = detect_gpu()
    result = install_torch(gpu_type)
    print(json.dumps(result))