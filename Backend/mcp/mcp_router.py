from pydantic import BaseModel
from .mcp_client import MCPClient
import os

from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/api/mcp")


class MCPRequest(BaseModel):
    tool_name : str
    prompt : str


@router.post("/call_tool")
async def call_mcp_tool(request:MCPRequest):
    try: 
        client = MCPClient(
        url = os.getenv("MCP_SERVER_URL"),
        token =os.getenv("MCP_BEARER_TOKEN") 
    )
    
        result = await client.call_tool(request.tool_name,request.prompt)
   
        return {
        "success": True,
        "data":result
   }
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))   
 
    