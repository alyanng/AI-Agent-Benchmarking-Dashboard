from fastapi import APIRouter
from results_and_configuration_info import get_config_results

router = APIRouter()

@router.get("/get_config_data")
async def get_configurations(project_id: int):
    configurations = get_config_results(project_id)
    return configurations

@router.get("/get_stability_data") 
async def get_stability(configuration_id:int):
    stability = get_stability(configuration_id)
    return stability
