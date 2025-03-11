from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.middleware.cors import CORSMiddleware
import requests


import os, sys
sys.path.append(os.path.abspath(r"E:\MyWeb\chatting"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chat.hoangvu.id.vn", 
                   "http://localhost", 
                   "http://127.0.0.1",
                   "http://localhost:8080",
                   "http://127.0.0.1:8080",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Gắn thư mục static để phục vụ tệp HTML
# app.mount("/", StaticFiles(directory="templates", html=True), name="static")
app.mount("/templates", StaticFiles(directory="templates"), name="js")
app.mount("/images", StaticFiles(directory="images"), name="images")
# Cấu hình Jinja2Templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/chat/send_message")
async def send_message(
    topic: str = Form(...),
    prompt: str = Form(...),
    section_name: str = Form(...),
    file: UploadFile = File(None)
):
    # Chuẩn bị dữ liệu gửi đến webhook
    print(topic, prompt, section_name)
    data = {
        "topic": topic,
        "prompt": prompt,
        "session_name": section_name
    }
    print(data)
    files = {}
    if file:
        files["file"] = (file.filename, file.file, file.content_type)

    try:
        # Gửi yêu cầu đến webhook
        response = requests.post(
            "https://n8n.hoangvu.id.vn/webhook/sap_sp",
            data=data,
            files=files if files else None
        )
        print(response.json())
        if response.status_code != 200:
            raise Exception(f"Webhook trả về mã lỗi {response.status_code}")

        # Trả về phản hồi từ webhook cho frontend
        return JSONResponse(content=response.json())
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)