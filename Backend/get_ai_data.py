from fastapi import APIRouter
from results_and_configuration_info import get_config_results
from stability_info import get_stability_results

router = APIRouter()

@router.get("/get_config_data")
async def get_configurations(project_id: int):
    configurations = get_config_results(project_id)
    return configurations

@router.get("/get_stability_data") 
def get_stability():
    stability = get_stability_results()
    return stability
