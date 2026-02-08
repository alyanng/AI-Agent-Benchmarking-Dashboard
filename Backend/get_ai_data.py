from fastapi import APIRouter
from configuration_info import get_configurations

router = APIRouter()

@router.get("/get_ai_data")
async def get_configurations(project_id: int):
    configurations = get_configurations(project_id)
    return configurations