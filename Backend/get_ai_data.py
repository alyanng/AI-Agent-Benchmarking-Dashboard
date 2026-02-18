from fastapi import APIRouter
from results_and_configuration_info import get_config_results
from stability_info import get_stability_results
from combined_info import get_all_results_data

router = APIRouter()

@router.get("/get_config_data")
async def get_configurations(project_id: int):
    configurations = get_config_results(project_id)
    return configurations

@router.get("/get_stability_data") 
def get_stability():
    stability = get_stability_results()
    return stability

@router.get("/get_combined_data")
def get_combined():
    combined = get_all_results_data()
    print(combined)
    return combined