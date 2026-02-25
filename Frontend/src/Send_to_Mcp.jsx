import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixerImg from "../assets/codefixer.png";
import autohiveImg from "../assets/autohive.png";
import ReactMarkdown from "react-markdown";

// Helper: Parse and validate JSON from a text string that may contain wrappers
function parseCandidateReport(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  let s = text.trim();
  
  // Step 2: Decode unicode escapes if they appear as literal text (e.g., "\u0022" as a string)
  // This happens when the response is double-encoded
  if (s.includes('\\u00') || s.includes('\\u')) {
    try {
      // Replace all \uXXXX patterns with actual characters
      s = s.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch (err) {
      // Continue with original string
    }
  } else {
  }
  
  // Step 3: Strip wrappers
  // Remove markdown fences - check for actual backtick characters
  if (s.startsWith('```json') || s.startsWith('```')) {
    const firstNewline = s.indexOf('\n');
    if (firstNewline !== -1) {
      s = s.substring(firstNewline + 1);
    }
  }
  if (s.endsWith('```')) {
    const lastBackticks = s.lastIndexOf('```');
    if (lastBackticks !== -1) {
      s = s.substring(0, lastBackticks);
    }
  }
  s = s.trim();
  
  
  // Remove <artifact> tags if present
  const artifactStart = s.indexOf('<artifact');
  if (artifactStart !== -1) {
    const contentStart = s.indexOf('>', artifactStart);
    const artifactEnd = s.indexOf('</artifact>');
    if (contentStart !== -1 && artifactEnd !== -1 && artifactEnd > contentStart) {
      s = s.substring(contentStart + 1, artifactEnd).trim();
    }
  }
  
  // Step 4: Extract JSON substring between first { and last }
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  
  const jsonStr = s.substring(firstBrace, lastBrace + 1);
  
  // Step 5: Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
  
  // Step 6: Validate schema minimally
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  
  // Must contain project_name (string)
  if (!parsed.project_name || typeof parsed.project_name !== 'string') {
    return null;
  }
  
  // Must contain summary (object)
  if (!parsed.summary || typeof parsed.summary !== 'object') {
    return null;
  }
  
  // Must contain errors (array) OR at least one required numeric field
  const hasErrors = Array.isArray(parsed.errors);
  const hasNumericField = 
    typeof parsed.number_of_fixes === 'number' ||
    typeof parsed.total_time_spent_minutes === 'number' ||
    typeof parsed.number_of_errors_from_raygun === 'number';
  
  
  if (!hasErrors && !hasNumericField) {
    return null;
  }
  
  // Step 7: Return valid object
  return parsed;
}

// Main extractor: scan MCP response text blocks for report JSON
function extractReportJsonFromTextBlocks(mcpResponse) {
  
  // If response is a string, try to parse it as JSON array first
  if (typeof mcpResponse === 'string') {
    try {
      mcpResponse = JSON.parse(mcpResponse);
    } catch (err) {
      return null;
    }
  }
  
  // Check if response is wrapped in an object with content property
  if (mcpResponse && typeof mcpResponse === 'object' && !Array.isArray(mcpResponse)) {
    
    if (Array.isArray(mcpResponse.content)) {
      
      // SPECIAL CASE: Check if content[0].text contains stringified JSON array
      if (mcpResponse.content.length > 0 && 
          mcpResponse.content[0].type === 'text' && 
          typeof mcpResponse.content[0].text === 'string') {
        
        const firstText = mcpResponse.content[0].text.trim();
        
        // Check if it starts with [{ (stringified array)
        if (firstText.startsWith('[{') || firstText.startsWith('[{"')) {
          try {
            const parsedArray = JSON.parse(firstText);
            if (Array.isArray(parsedArray)) {
              mcpResponse = parsedArray;
            }
          } catch (err) {
            // Continue with original content array
            mcpResponse = mcpResponse.content;
          }
        } else {
          mcpResponse = mcpResponse.content;
        }
      } else {
        mcpResponse = mcpResponse.content;
      }
    } else {
      return null;
    }
  }
  
  // Only parse from array format (MCP messages)
  if (!Array.isArray(mcpResponse)) {
    return null;
  }
  
  
  // Iterate messages from last to first
  for (let i = mcpResponse.length - 1; i >= 0; i--) {
    const message = mcpResponse[i];
    
    
    if (!message) {
      continue;
    }
    
    if (!Array.isArray(message.content)) {
      continue;
    }
    
    
    // Iterate blocks from last to first
    for (let j = message.content.length - 1; j >= 0; j--) {
      const block = message.content[j];
      
      
      if (!block) {
        continue;
      }
      
      
      if (block.type !== 'text') {
        continue;
      }
      
      if (typeof block.text === 'string') {
        
        const payload = parseCandidateReport(block.text);
        
        if (payload) {
          return payload;
        } else {
        }
      } else {
      }
    }
  }
  
  return null;
}

// Utility function to validate debug report JSON structure
function validateDebugReport(data) {
  
  // Check required fields
  if (!data.project_name) {
    return false;
  }
  
  if (!data.project_github_url) {
    return false;
  }
  
  // Check errors is an array
  if (!Array.isArray(data.errors)) {
    return false;
  }
  
  // Check array is not empty
  if (data.errors.length === 0) {
    return false;
  }
  
  // Check each error object has required fields
  for (let i = 0; i < data.errors.length; i++) {
    const error = data.errors[i];
    if (!error.error_id) {
      return false;
    }
    if (!error.error_type) {
      return false;
    }
    if (typeof error.was_fixed !== 'boolean') {
      return false;
    }
  }
  
  // Check numeric fields
  if (typeof data.number_of_fixes !== 'number') {
    return false;
  }
  
  if (typeof data.total_time_spent_minutes !== 'number') {
    return false;
  }
  
  if (typeof data.number_of_errors_from_raygun !== 'number') {
    return false;
  }
  
  return true;
}

function Send_to_Mcp(data) {
  const [prompt, setPrompt] = useState(null);
  const [status, setStatus] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  
  // New state for JSON report detection and saving
  const [detectedReport, setDetectedReport] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  function handlePromptChange(event) {
    var inputprompt = event.target.value;
    setPrompt(inputprompt);
  }

  async function handleSendPrompt() {
    if (!prompt) {
      alert("prompt cannot be empty");
      return;
    }

    setStatus("Sending..");
    const userMessage = { role: "You:", content: prompt };

    setChatHistory((prev) => [...prev, userMessage]);

    try {
      var response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/mcp/call_tool",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool_name: "github-code-fixer",
            prompt: prompt,
          }),
        },
      );

      var receiveddata = await response.json();

      
      setStatus("Message sent successfully..");
      
      // Extract MCP response
      let mcpResponseData = receiveddata.data?.result;
      
      
      // Unwrap and extract messages array
      let messagesArray = null;
      
      if (Array.isArray(mcpResponseData)) {
        messagesArray = mcpResponseData;
      } else if (mcpResponseData && typeof mcpResponseData === 'object' && mcpResponseData.content) {
        
        if (Array.isArray(mcpResponseData.content)) {
          // Check if content[0].text contains stringified JSON array
          if (mcpResponseData.content.length > 0 && 
              mcpResponseData.content[0].type === 'text' && 
              typeof mcpResponseData.content[0].text === 'string') {
            
            const textContent = mcpResponseData.content[0].text.trim();
            
            // Check if text starts with [{ or [" (stringified array)
            if (textContent.startsWith('[{') || textContent.startsWith('[\"')) {
              try {
                const parsedInner = JSON.parse(textContent);
                if (Array.isArray(parsedInner)) {
                  messagesArray = parsedInner;
                }
              } catch (parseErr) {
                messagesArray = mcpResponseData.content;
              }
            } else {
              messagesArray = mcpResponseData.content;
            }
          } else {
            messagesArray = mcpResponseData.content;
          }
        }
      }
      
      // Extract display text
      let displayContent = "";
      
      if (messagesArray && Array.isArray(messagesArray)) {
        for (let i = messagesArray.length - 1; i >= 0; i--) {
          const msg = messagesArray[i];
          if (msg && msg.content && Array.isArray(msg.content)) {
            for (let j = msg.content.length - 1; j >= 0; j--) {
              const block = msg.content[j];
              if (block && block.type === 'text' && block.text) {
                displayContent = block.text;
                break;
              }
            }
            if (displayContent) break;
          }
        }
      }
      
      
      const aiMessage = {
        role: "Github Code Fixer:",
        content: displayContent || "No content available"
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      // Extract report JSON from text blocks
      let payload = extractReportJsonFromTextBlocks(messagesArray || mcpResponseData);
      
      
      // FALLBACK: If extraction failed but we have displayContent, try parsing that
      if (!payload && displayContent) {
        payload = parseCandidateReport(displayContent);
      }
      
      if (payload) {
        
        if (validateDebugReport(payload)) {
          setDetectedReport(payload);
          setShowSaveButton(true);
          setSaveStatus("✅ Debug report detected and ready to save");
        } else {
          setSaveStatus("⚠️ JSON detected but validation failed - check console for details");
        }
      } else {
        setSaveStatus("");
      }

      setPrompt("");
    } catch (error) {
      console.error("Error in handleSendPrompt:", error);
      setStatus("Failed to send message. Please try again.");
    }
  }

  // Function to save detected JSON report to backend
  async function handleSaveReport() {
    if (!detectedReport) {
      alert("No report to save");
      return;
    }

    setSaveStatus("Saving report...");

    try {
      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/save_json_data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            json_data: detectedReport,
            prompt: prompt || ""
          })
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Report saved successfully!\n\nProject ID: ${result.project_id}\nConfig ID: ${result.config_id}\nErrors inserted: ${result.total_errors_inserted}`);
        setSaveStatus("✅ Report saved successfully");
        setShowSaveButton(false);
        setDetectedReport(null);
      } else {
        const errorMsg = result.error || "Unknown error";
        alert("❌ Failed to save report: " + errorMsg);
        setSaveStatus("❌ Failed to save report");
        console.error("Save failed:", result);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("❌ Failed to save report: " + error.message);
      setSaveStatus("❌ Failed to save report");
    }
  }

  return (
    <div className="sendtomcp">
        <div className="agentTitle">
            <img id="autohive" src={autohiveImg} alt="autohive Image" />
      <h3>Github Code Fixer</h3></div>
       {chatHistory.length === 0 && (
        <div className="images">
    <img id="codefixer" src={codefixerImg} alt="code fixer Image" />
  </div>
    )}

      <div className="result_area">
        {chatHistory.map((message, i) => (
          <div key={i}>
            <strong>{message.role}</strong>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
      </div>

      {/* Save Report Section - shown when JSON is detected */}
      {showSaveButton && (
        <div className="save-report-area">
          <p>
            {saveStatus}
          </p>
          <button onClick={handleSaveReport}>
            💾 Save Report to Database
          </button>
        </div>
      )}

      <div className="input_area">
         {status && <p className="status_text">{status}</p>}
        <textarea
          value={prompt || ""}
          id="textarea"
          placeholder="Send a message to Github code fixer"
          onChange={handlePromptChange}
        ></textarea>
        <button onClick={handleSendPrompt}>Send</button>
      </div>
    </div>
  );
}
export default Send_to_Mcp;
