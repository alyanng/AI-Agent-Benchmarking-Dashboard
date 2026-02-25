import httpx
import json
from typing import Dict, Any
import time

# MCP class
class MCPClient:
    # constructor
    def __init__(self, url, token):
        self.url = url
        self.token = token
    
    async def call_tool(self, tool_name, prompt) -> Dict[str, Any]:
        # Construct the payload
        payload = {
            "jsonrpc": "2.0",
            "id": int(time.time() * 1000),
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": {
                    "prompt": prompt
                }
            }
        }
        
        # set headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
      
        # send requests
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.url,
                json=payload,
                headers=headers,
                timeout=1800.0
            )
            
            response.raise_for_status()
            
            rawtext = response.text
            all_messages = [] 
            
            for line in rawtext.split('\n'):
                if line.startswith('data:'):
                    json_str = line[5:].strip() 
                    
                    if json_str:
                        try:
                            result = json.loads(json_str)
                            
                            if 'result' in result and 'content' in result['result']:
                                all_messages.append(result)
                        except json.JSONDecodeError:
                            continue
        
            if all_messages:
                combined_text = ""
                for msg in all_messages:
                    combined_text += msg['result']['content'][0]['text'] + "\n\n"
                
                return {
                    "result": {
                        "content": [{
                            "type": "text",
                            "text": combined_text
                        }]
                    }
                }
            else:
                # Return empty result if no messages found
                return {
                    "result": {
                        "content": [{
                            "type": "text",
                            "text": "No data found in SSE response"
                        }]
                    }
                }
