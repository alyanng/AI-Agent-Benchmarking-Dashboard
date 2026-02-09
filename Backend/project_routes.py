from fastapi import APIRouter, UploadFile, File
import json
from insert_project import insert_project  

router = APIRouter()

@router.post("/projects")
async def create_project(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        return {"error": "Only .json files are allowed"}
    
    # Read and parse JSON
    raw = await file.read()
    data = json.loads(raw)
    
    project_name = data.get("project_name")
    github_url = data.get("project_github_url", "")
    number_of_errors = data.get("number_of_errors_from_raygun", 0)
    
    # Insert into projects table
    project_id = insert_project(project_name, github_url, number_of_errors)
    
    return {"success": True, "project_id": project_id, "project_name": project_name}
