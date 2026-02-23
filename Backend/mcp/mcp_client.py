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
        
        # Set headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.token}"
        }
      
        try:
            # Send request with extended timeout for long-running tasks
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.url,
                    json=payload,
                    headers=headers,
                    timeout=600.0  # 10 minutes timeout
                )
                
                response.raise_for_status()
                
                rawtext = response.text
                print(f"[MCP] Raw response length: {len(rawtext)} characters")
                
                all_messages = [] 
                
                # Parse SSE stream
                for line in rawtext.split('\n'):
                    if line.startswith('data:'):
                        json_str = line[5:].strip() 
                        
                        if json_str:
                            try:
                                result = json.loads(json_str)
                                print(f"[MCP] Parsed SSE line: {json_str[:100]}...")
                                
                                # Collect all messages with result field
                                if 'result' in result:
                                    all_messages.append(result)
                                    
                            except json.JSONDecodeError as e:
                                print(f"[MCP] Failed to parse line: {json_str[:100]}... Error: {e}")
                                continue
                
                print(f"[MCP] Total messages collected: {len(all_messages)}")
                
                # If we have messages, process them
                if all_messages:
                    # Return the complete message array for frontend to parse
                    # This preserves all content blocks including tool_result, text, etc.
                    final_messages = []
                    
                    for msg in all_messages:
                        if 'result' in msg:
                            # Extract the result content
                            result_content = msg['result']
                            
                            # If result.content exists and is a list, use it
                            if isinstance(result_content, dict) and 'content' in result_content:
                                if isinstance(result_content['content'], list):
                                    final_messages.extend(result_content['content'])
                                elif isinstance(result_content['content'], str):
                                    # If content is a string, wrap it
                                    final_messages.append({
                                        "type": "text",
                                        "text": result_content['content']
                                    })
                            # If result is a string directly
                            elif isinstance(result_content, str):
                                final_messages.append({
                                    "type": "text",
                                    "text": result_content
                                })
                    
                    print(f"[MCP] Returning {len(final_messages)} content blocks")
                    
                    # Return in the format expected by frontend
                    return {
                        "result": {
                            "content": final_messages
                        }
                    }
                else:
                    # No messages found - return error with helpful info
                    print("[MCP] WARNING: No messages found in SSE response")
                    print(f"[MCP] Raw response preview: {rawtext[:500]}")
                    
                    return {
                        "result": {
                            "content": [{
                                "type": "text",
                                "text": f"No data found in MCP response. Raw response length: {len(rawtext)} characters. Check backend logs for details."
                            }]
                        }
                    }
                    
        except httpx.TimeoutException as e:
            print(f"[MCP] Timeout error: {e}")
            return {
                "result": {
                    "content": [{
                        "type": "text",
                        "text": f"Error: Request timeout after 600 seconds. The agent task may be too complex or the server is overloaded."
                    }]
                }
            }
        except httpx.HTTPStatusError as e:
            print(f"[MCP] HTTP error: {e}")
            return {
                "result": {
                    "content": [{
                        "type": "text",
                        "text": f"Error: HTTP {e.response.status_code} - {e.response.text[:200]}"
                    }]
                }
            }
        except Exception as e:
            print(f"[MCP] Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return {
                "result": {
                    "content": [{
                        "type": "text",
                        "text": f"Error: {str(e)}"
                    }]
                }
            }
