from fastapi import APIRouter
from typing import List, Dict, Any
from results_and_configuration_info import get_config_results, get_config_resultnew
from stability_info import get_stability_results
from combined_info import get_all_results_data

router = APIRouter()


@router.get("/get_config_data")
async def get_configurations(project_id: int) -> List[Dict[str, Any]]:
    """
    Retrieve configuration data for a specific project.
    
    Args:
        project_id: The ID of the project to fetch configurations for
        
    Returns:
        List of configuration dictionaries
    """
    configurations = get_config_results(project_id)
    return configurations


@router.get("/get_stability_data") 
def get_stability(project_id: int) -> List[Dict[str, Any]]:
    """
    Retrieve stability metrics for a specific project.
    
    Args:
        project_id: The ID of the project to fetch stability data for
        
    Returns:
        List of stability metric dictionaries
    """
    stability = get_stability_results(project_id)
    return stability


@router.get("/get_combined_data")
def get_combined(project_id: int) -> List[Dict[str, Any]]:
    """
    Retrieve combined results data for a specific project.
    
    Args:
        project_id: The ID of the project to fetch combined data for
        
    Returns:
        List of combined result dictionaries
    """
    combined = get_all_results_data(project_id)
    print(combined)
    return combined


@router.get("/get_config_data_new")
async def get_configurationsnew(project_id: int) -> List[Dict[str, Any]]:
    """
    Retrieve configuration data using the new format for a specific project.
    
    Args:
        project_id: The ID of the project to fetch configurations for
        
    Returns:
        List of configuration dictionaries in new format
    """
    configurations = get_config_resultnew(project_id)
    return configurations
