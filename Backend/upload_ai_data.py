
from fastapi import APIRouter,UploadFile,File,Form
import json
from typing import Optional
from store_error_info import save_error_records


from results_and_configuration_info import insert_configurations
from results_and_configuration_info import insert_fixes
from store_error_info import save_error_records
from projects_info import insert_project



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
        "prompt": prompt,
        "fixes": data.get("number_of_fixes")
    }

    # Insert project into 'projects' table
    project_id = insert_project(
        project_name=parsed_data.get("project_name"),
        github_url=parsed_data.get("project_github_url"),
        number_of_errors=parsed_data.get("number_of_errors_from_raygun", 0)
    )
    #Calls function from store_configurations_info file to insert configuration into db
    
    config_id = insert_configurations(
        system_prompt=parsed_data.get("prompt"),
        model = "",
        project_id = project_id
    )

    #Calls function from store_results_info file to insert results into db
    insert_fixes(
    number_of_fixes=parsed_data.get("fixes", 0),
    duration=parsed_data.get("total_time_spent_minutes", 0),
    tokens = 0,
    project_id = project_id,
    config_id = config_id
    )

    errors = parsed_data.get("errors", [])
    inserted = save_error_records(errors, project_id="1", config_id=config_id)



    return {
        "success": True,
        "message":"file received",
        "total_errors_in_file": len(errors),
        "inserted_new_rows": inserted
        
   }
