import httpx
import json
from typing import Dict, Any
import time

# MCP class
class MCPClient:
    # constructor
    def __init__(self,url,token):
        self.url=url
        self.token=token
    
    
    async def call_tool(self,tool_name,prompt)->Dict[str,Any]:
        
        # Construct the payload
        payload={
            "jsonrpc":"2.0",
            "id":int(time.time()*1000),
            "method":"tools/call",
            "params":{
                "name":tool_name,
                "arguments":{
                    "prompt":prompt
                }
                
            }
            
        }
        # set headers
        headers = {
            "Content-Type" : "application/json",
            "Authorization" : f"Bearer {self.token}"
        }
      
        # send requests
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.url,
                json=payload,
                headers=headers,
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            return result