import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixer from "../assets/codefixer.jpeg";
import ReactMarkdown from "react-markdown";

// Helper: Parse and validate JSON from a text string that may contain wrappers
function parseCandidateReport(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  let s = text.trim();
  console.debug("parseCandidateReport input (first 200 chars):", s.substring(0, 200));
  
  // Step 2: Decode unicode escapes if they appear as literal text (e.g., "\u0022" as a string)
  // This happens when the response is double-encoded
  if (s.includes('\\u00') || s.includes('\\u')) {
    console.debug("Detected unicode escapes, decoding...");
    try {
      // Replace all \uXXXX patterns with actual characters
      s = s.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      console.debug("After unicode decode (first 200 chars):", s.substring(0, 200));
    } catch (err) {
      console.debug("Unicode decode error:", err.message);
      // Continue with original string
    }
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
  
  console.debug("After fence removal (first 200 chars):", s.substring(0, 200));
  
  // Remove <artifact> tags if present
  const artifactStart = s.indexOf('<artifact');
  if (artifactStart !== -1) {
    const contentStart = s.indexOf('>', artifactStart);
    const artifactEnd = s.indexOf('</artifact>');
    if (contentStart !== -1 && artifactEnd !== -1 && artifactEnd > contentStart) {
      s = s.substring(contentStart + 1, artifactEnd).trim();
      console.debug("After artifact removal (first 200 chars):", s.substring(0, 200));
    }
  }
  
  // Step 4: Extract JSON substring between first { and last }
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.debug("No braces found or invalid brace positions");
    return null;
  }
  
  const jsonStr = s.substring(firstBrace, lastBrace + 1);
  console.debug("Extracted JSON string (first 200 chars):", jsonStr.substring(0, 200));
  
  // Step 5: Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
    console.debug("✅ JSON.parse succeeded");
  } catch (err) {
    console.debug("❌ JSON.parse failed:", err.message);
    console.debug("Failed JSON (first 500 chars):", jsonStr.substring(0, 500));
    return null;
  }
  
  // Step 6: Validate schema minimally
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.debug("Parsed result is not a valid object");
    return null;
  }
  
  // Must contain project_name (string)
  if (!parsed.project_name || typeof parsed.project_name !== 'string') {
    console.debug("Missing or invalid project_name");
    return null;
  }
  
  // Must contain summary (object)
  if (!parsed.summary || typeof parsed.summary !== 'object') {
    console.debug("Missing or invalid summary");
    return null;
  }
  
  // Must contain errors (array) OR at least one required numeric field
  const hasErrors = Array.isArray(parsed.errors);
  const hasNumericField = 
    typeof parsed.number_of_fixes === 'number' ||
    typeof parsed.total_time_spent_minutes === 'number' ||
    typeof parsed.number_of_errors_from_raygun === 'number';
  
  if (!hasErrors && !hasNumericField) {
    console.debug("Missing both errors array and numeric fields");
    return null;
  }
  
  console.debug("✅✅✅ parseCandidateReport successful!", parsed);
  // Step 7: Return valid object
  return parsed;
}

// Main extractor: scan MCP response text blocks for report JSON
function extractReportJsonFromTextBlocks(mcpResponse) {
  console.debug("extractReportJsonFromTextBlocks called, isArray:", Array.isArray(mcpResponse));
  
  // Only parse from array format (MCP messages)
  if (!Array.isArray(mcpResponse)) {
    console.debug("Not an array, returning null");
    return null;
  }
  
  console.debug("Processing", mcpResponse.length, "messages");
  
  // Iterate messages from last to first
  for (let i = mcpResponse.length - 1; i >= 0; i--) {
    const message = mcpResponse[i];
    
    if (!message || !Array.isArray(message.content)) {
      console.debug(`Message ${i}: no content array`);
      continue;
    }
    
    console.debug(`Message ${i}: has ${message.content.length} content blocks, role=${message.role}`);
    
    // Iterate blocks from last to first
    for (let j = message.content.length - 1; j >= 0; j--) {
      const block = message.content[j];
      
      if (!block) {
        console.debug(`Block ${j}: null/undefined`);
        continue;
      }
      
      console.debug(`Block ${j}: type=${block.type}, hasText=${!!block.text}`);
      
      if (block.type !== 'text') {
        continue;
      }
      
      if (typeof block.text === 'string') {
        console.debug(`Block ${j}: text length=${block.text.length}`);
        const payload = parseCandidateReport(block.text);
        if (payload) {
          console.debug("🎉 Found valid payload in text block!");
          return payload;
        }
      }
    }
  }
  
  console.debug("❌ No valid payload found in any text block");
  return null;
}

// Utility function to extract JSON from AI response text (legacy - kept for backward compatibility)
function extractJsonFromAiResponse(aiText) {
  // Method 1: Extract from ```json code block
  const jsonBlockMatch = aiText.match(/```json\s*\n([\s\S]*?)\n```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1];
  }
  
  // Method 2: Extract from <artifact> tags
  const artifactMatch = aiText.match(/<artifact[^>]*>([\s\S]*?)<\/artifact>/);
  if (artifactMatch) {
    return artifactMatch[1];
  }
  
  return null;
}

// Utility function to validate debug report JSON structure
function validateDebugReport(data) {
  console.log("Validating debug report:", data);
  
  // Check required fields
  if (!data.project_name) {
    console.log("Validation failed: missing project_name");
    return false;
  }
  
  if (!data.project_github_url) {
    console.log("Validation failed: missing project_github_url");
    return false;
  }
  
  // Check errors is an array
  if (!Array.isArray(data.errors)) {
    console.log("Validation failed: errors is not an array");
    return false;
  }
  
  // Check array is not empty
  if (data.errors.length === 0) {
    console.log("Validation failed: errors array is empty");
    return false;
  }
  
  // Check each error object has required fields
  for (let i = 0; i < data.errors.length; i++) {
    const error = data.errors[i];
    if (!error.error_id) {
      console.log(`Validation failed: error[${i}] missing error_id`);
      return false;
    }
    if (!error.error_type) {
      console.log(`Validation failed: error[${i}] missing error_type`);
      return false;
    }
    if (typeof error.was_fixed !== 'boolean') {
      console.log(`Validation failed: error[${i}] was_fixed is not boolean`);
      return false;
    }
  }
  
  // Check numeric fields
  if (typeof data.number_of_fixes !== 'number') {
    console.log("Validation failed: number_of_fixes is not a number");
    return false;
  }
  
  if (typeof data.total_time_spent_minutes !== 'number') {
    console.log("Validation failed: total_time_spent_minutes is not a number");
    return false;
  }
  
  if (typeof data.number_of_errors_from_raygun !== 'number') {
    console.log("Validation failed: number_of_errors_from_raygun is not a number");
    return false;
  }
  
  console.log("Validation passed!");
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
    const userMessage = { role: "user", content: prompt };

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

      console.log("Received data from AI:", receiveddata);
      setStatus("Message sent successfully..");
      
      // Extract MCP response
      let mcpResponseData = receiveddata.data?.result;
      
      console.debug("MCP response data:", mcpResponseData);
      
      // For display in chat history, extract text from response
      let displayContent = "";
      if (mcpResponseData && Array.isArray(mcpResponseData)) {
        // New MCP format: extract text from last message for display
        for (let i = mcpResponseData.length - 1; i >= 0; i--) {
          const msg = mcpResponseData[i];
          if (msg.content && Array.isArray(msg.content)) {
            for (let j = msg.content.length - 1; j >= 0; j--) {
              const block = msg.content[j];
              if (block.type === 'text' && block.text) {
                displayContent = block.text;
                break;
              }
            }
            if (displayContent) break;
          }
        }
      } else if (mcpResponseData?.content?.[0]?.text) {
        // Old format fallback
        displayContent = mcpResponseData.content[0].text;
      }
      
      const aiMessage = {
        role: "AI",
        content: displayContent || "No content available"
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      // Extract report JSON from text blocks
      const payload = extractReportJsonFromTextBlocks(mcpResponseData);
      
      if (payload) {
        console.debug("Parsed report JSON:", payload);
        
        if (validateDebugReport(payload)) {
          console.log("✅ Valid debug report detected");
          setDetectedReport(payload);
          setShowSaveButton(true);
          setSaveStatus("✅ Debug report detected and ready to save");
        } else {
          console.log("❌ JSON validation failed");
          setSaveStatus("⚠️ JSON detected but validation failed - check console for details");
        }
      } else {
        console.debug("No valid JSON payload found in text blocks");
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
    console.log("Sending report to backend:", detectedReport);

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
      
      console.log("Backend response status:", response.status);
      const result = await response.json();
      console.log("Backend response:", result);
      
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
      <h3>Github Code Fixer</h3>
      <img src={codefixer} alt="codefixer"></img>
      <p>
        I help you debug and fix code issues using production error data from
        Raygun and GitHub integration.
        <br /> I analyze errors, create fixes, and submit pull requests.
      </p>

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
        <div className="save-report-area" style={{
          margin: "15px 0",
          padding: "15px",
          backgroundColor: "#f0f9ff",
          border: "2px solid #0ea5e9",
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 10px 0", color: "#0369a1", fontWeight: "bold" }}>
            {saveStatus}
          </p>
          <button 
            onClick={handleSaveReport}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold"
            }}
          >
            💾 Save Report to Database
          </button>
        </div>
      )}

      <div className="input_area">
        <p>{status}</p>
        <textarea
          value={prompt || ""}
          id="textarea"
          placeholder="Send a message to AI agent"
          onChange={handlePromptChange}
        ></textarea>
        <button onClick={handleSendPrompt}>Send</button>
      </div>
    </div>
  );
}
export default Send_to_Mcp;
