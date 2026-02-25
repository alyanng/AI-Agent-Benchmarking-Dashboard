
from fastapi import APIRouter, UploadFile, File, Form
import json
from typing import Optional, List
from pydantic import BaseModel
from store_error_info import save_error_records


from results_and_configuration_info import insert_configurations, insert_fixes
from projects_info import insert_project



router = APIRouter()


# Pydantic models for JSON data validation
class ErrorRecord(BaseModel):
    error_id: str
    error_type: str
    was_fixed: bool


class DebugReportSummary(BaseModel):
    total_errors_identified: Optional[int] = 0
    errors_fixed: Optional[int] = 0
    errors_not_fixed: Optional[int] = 0
    deployment_correlation: Optional[str] = ""
    recommendations: Optional[List[str]] = []


class DebugReport(BaseModel):
    project_name: str
    project_github_url: str
    task_prompt_timestamp: Optional[str] = None  # Make optional
    number_of_fixes: int
    total_time_spent_minutes: int
    number_of_errors_from_raygun: int
    errors: List[ErrorRecord]
    summary: Optional[DebugReportSummary] = None


class SaveJsonRequest(BaseModel):
    json_data: DebugReport
    prompt: Optional[str] = ""


@router.post("/save_json_data")
async def save_json_data(request: SaveJsonRequest):
    """
    Receive and save JSON debug report directly (not as file upload).
    Validates JSON structure and saves to database.
    """
    try:
        report = request.json_data
        prompt = request.prompt
        
        print(f"Received JSON report for project: {report.project_name}")
        print(f"Full report data: {report.dict()}")
        
        # Insert project into 'projects' table
        project_id = insert_project(
            project_name=report.project_name,
            github_url=report.project_github_url,
            number_of_errors=report.number_of_errors_from_raygun
        )
        print(f"Inserted project with ID: {project_id}")
        
        # Insert configuration
        config_id = insert_configurations(
            system_prompt=prompt,
            model="",
            project_id=project_id
        )
        print(f"Inserted configuration with ID: {config_id}")
        
        # Insert results/fixes
        insert_fixes(
            number_of_fixes=report.number_of_fixes,
            duration=report.total_time_spent_minutes,
            tokens=0,
            project_id=project_id,
            config_id=config_id
        )
        print(f"Inserted fixes: {report.number_of_fixes}")
        
        # Insert error records (array of errors)
        errors_list = [error.dict() for error in report.errors]
        inserted_errors = save_error_records(
            errors_list, 
            project_id=project_id, 
            config_id=config_id
        )
        print(f"Inserted {inserted_errors} error records")
        
        return {
            "success": True,
            "message": "JSON report saved successfully",
            "project_id": project_id,
            "config_id": config_id,
            "total_errors_inserted": inserted_errors,
            "number_of_fixes": report.number_of_fixes
        }
        
    except Exception as e:
        print(f"Error saving JSON report: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/upload_ai_data")
async def upload_ai_json(file: UploadFile = File(...), prompt: Optional[str] = Form(None)):
    filename = file.filename
    if filename.endswith(".json") == False:
        return {
        "error": "Only .json files are allowed"
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
        "fixes": data.get("number_of_fixes"),
        "run_time":data.get("run_time")
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
        project_id = project_id,
    )

    #Calls function from store_results_info file to insert results into db
    insert_fixes(
    number_of_fixes=parsed_data.get("fixes", 0),
    duration=parsed_data.get("total_time_spent_minutes", 0),
    tokens = 0,
    project_id = project_id,
    config_id = config_id, 
    run_time = parsed_data.get("run_time", 0)
    )

    errors = parsed_data.get("errors", [])
    run_time =  parsed_data.get("run_time")
    inserted = save_error_records(errors,project_id=project_id, config_id=config_id ,run_time=run_time)



    return {
        "success": True,
        "message": "file received",
        "total_errors_in_file": len(errors),
        "inserted_new_rows": inserted
        
   }

@router.post("/upload_system_prompt")
async def upload_system_prompt(projectid: int, prompt: Optional[str] = Form(None)):
    config_id = insert_configurations(system_prompt= prompt, model="", project_id =projectid)
    results_id = insert_fixes(0, 0, 0, projectid, config_id, 0)
    return {
        "success": True,
        "configid": config_id,
        "resultid": results_id
    }

