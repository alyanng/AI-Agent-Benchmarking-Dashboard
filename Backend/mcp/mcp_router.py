from pydantic import BaseModel
from typing import Dict, Any
from .mcp_client import MCPClient
import os

from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/api/mcp")


class MCPRequest(BaseModel):
    """Request model for MCP tool calls."""
    tool_name: str
    prompt: str


@router.post("/call_tool")
async def call_mcp_tool(request: MCPRequest) -> Dict[str, Any]:
    """
    Call an MCP tool with the provided prompt.
    
    Args:
        request: MCPRequest containing tool_name and prompt
        
    Returns:
        Dictionary containing success status and tool response data
        
    Raises:
        HTTPException: If tool call fails
    """
    try:
        client = MCPClient(
            url=os.getenv("MCP_SERVER_URL"),
            token=os.getenv("MCP_BEARER_TOKEN")
        )
     
        result = await client.call_tool(request.tool_name, request.prompt)
   
        print("result:", result)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
