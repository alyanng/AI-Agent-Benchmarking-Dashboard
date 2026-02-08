from fastapi import APIRouter,UploadFile,File,Form
import json
from typing import Optional
from store_error_info import save_error_records


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
  
    
    parsed_data = {
        "project_name": data.get("project_name"),
        "project_github_url": data.get("project_github_url"),
        "task_prompt_timestamp": data.get("task_prompt_timestamp"),
        "total_time_spent_minutes": data.get("total_time_spent_minutes"),
        "number_of_errors_from_raygun": data.get("number_of_errors_from_raygun"),
        "errors": data.get("errors"),
        "prompt": prompt
    }

    errors = parsed_data.get("errors", [])
    inserted = save_error_records(errors, project_id="1")


    return {
        "success": True,
        "message":"file received",
        "total_errors_in_file": len(errors),
        "inserted_new_rows": inserted
        
   }