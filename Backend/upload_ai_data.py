from fastapi import APIRouter,UploadFile,File,Form
import json
from typing import Optional


router = APIRouter()


@router.post("/upload_ai_data")
async def upload_ai_json(file:UploadFile=File(...), prompt: Optional[str] = Form(None)):
    filename = file.filename
    if filename.endswith(".json") == False:
        return {
        "error":"Only .json files are allowed"
        }
        
    raw = await file.read()
    data = json.loads(raw)
    # prompt = None
    prompt = prompt
    project_name = None
    project_name = None
    project_github_url = None
    task_prompt_timestamp = None
    total_time = None 
    number_of_errors_from_raygun=None
    errors = []
    project_name = data.get("project_name")
    project_github_url = data.get("project_github_url")
    task_prompt_timestamp = data.get("task_prompt_timestamp")
    total_time = data.get("total_time_spent_minutes")
    number_of_errors_from_raygun = data.get("number_of_errors_from_raygun")
    errors = data.get("errors")
   
    return {
        "message":"file received",
        "prompt":prompt,
        "project_name":project_name,
        "errors":errors 
   }