import time
import os
import psutil
import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

app = FastAPI(title="FeiNiu OS API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "feiniu_os_secret_key_rk3288"
ALGORITHM = "HS256"
security = HTTPBearer()

class LoginRequest(BaseModel):
    username: str
    password: str

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.post("/api/auth/login")
def login(req: LoginRequest):
    # Mock authentication
    if req.username == "admin" and req.password == "admin":
        token = jwt.encode({"sub": req.username, "exp": time.time() + 3600*24}, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/api/system/status", dependencies=[Depends(verify_token)])
def get_system_status() -> Dict[str, Any]:
    # CPU
    cpu_percent = psutil.cpu_percent(interval=None)
    # Memory
    mem = psutil.virtual_memory()
    # Disk (Root)
    disk = psutil.disk_usage('/')
    # Network
    net_io = psutil.net_io_counters()
    
    # Get boot time
    uptime_seconds = time.time() - psutil.boot_time()
    
    return {
        "cpu": {
            "usage": cpu_percent,
            "temperature": 45.0  # mock for rk3288
        },
        "memory": {
            "total": mem.total,
            "used": mem.used,
            "percent": mem.percent
        },
        "gpu": {
            "usage": 12.5 # Mock GPU usage for RK3288 Mali GPU
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "percent": disk.percent,
            "io_read": 1024 * 50, # Mock IO read bytes/s
            "io_write": 1024 * 20  # Mock IO write bytes/s
        },
        "network": {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv,
            "upload_speed": 1024 * 120, # Mock upload speed bytes/s
            "download_speed": 1024 * 850 # Mock download speed bytes/s
        },
        "uptime": uptime_seconds
    }

@app.get("/api/fs/list", dependencies=[Depends(verify_token)])
def list_directory(path: str = "/"):
    try:
        if os.path.exists(path) and os.path.isdir(path):
            return {"path": path, "items": os.listdir(path)}
        return {"path": path, "items": []}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/system/reboot", dependencies=[Depends(verify_token)])
def reboot_system():
    # Mock reboot command
    # os.system("reboot")
    return {"status": "success", "message": "System is rebooting..."}

if __name__ == "__main__":
    import uvicorn
    # Bind strongly to 0.0.0.0:6666 as requested
    uvicorn.run(app, host="0.0.0.0", port=6666)

