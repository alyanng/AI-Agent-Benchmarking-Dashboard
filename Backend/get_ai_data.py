from fastapi import APIRouter
from configuration_info import get_configurations
from results_info import get_results

router = APIRouter()

@router.get("/get_configurations")
async def get_configurations(project_id: int):
    configurations = get_configurations(project_id)
    return configurations

@router.get("/get_results")
async def get_results(project_id: int):
    results = get_results(project_id)
    return results