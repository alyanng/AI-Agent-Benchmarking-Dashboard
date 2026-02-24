from fastapi import APIRouter
from results_and_configuration_info import get_config_results,get_config_resultnew, get_config_results_forResult
from stability_info import get_stability_results
from combined_info import get_all_results_data

router = APIRouter()

@router.get("/get_config_data")
async def get_configurations(project_id: int):
   configurations = get_config_results(project_id)
   return configurations

@router.get("/get_stability_data") 
def get_stability(project_id):
    stability = get_stability_results(project_id)
    return stability

@router.get("/get_combined_data")
def get_combined(project_id: int):
    combined = get_all_results_data(project_id)
    print(combined)
    return combined

@router.get("/get_config_data_new")
async def get_configurationsnew(project_id: int):
    configurations = get_config_resultnew(project_id)
    return configurations

# @router.get("/errors")
# def get_errors(project_id:int, configuration_id: int, run_time: int):
#     result = get_config_results_forErors(
#         project_id=project_id,
#         configuration_id=configuration_id,
#         run_time=run_time
#     )
#     return result


   
   
@router.get("/get_config_data_forResults")
async def get_configurations(project_id: int):
   configurations = get_config_results_forResult(project_id)
   return configurations
