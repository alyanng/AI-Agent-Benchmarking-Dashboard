import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixer from "../assets/codefixer.jpeg";
import ReactMarkdown from "react-markdown";

// Helper: Recursively extract all text from any nested structure
function extractAllTextFromResponse(obj, textBlocks = []) {
  if (!obj) return textBlocks;
  
  // Don't return early - continue collecting
  if (typeof obj === 'string' && obj.trim().length > 0) {
    textBlocks.push(obj);
    // Don't return here - continue checking other properties
  }
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractAllTextFromResponse(item, textBlocks);
    }
  } else if (typeof obj === 'object') {
    // Check common text properties first
    if (obj.text && typeof obj.text === 'string' && !textBlocks.includes(obj.text)) {
      textBlocks.push(obj.text);
    }
    if (obj.content && typeof obj.content === 'string' && !textBlocks.includes(obj.content)) {
      textBlocks.push(obj.content);
    }
    
    // Recursively check all other properties
    for (const key in obj) {
      if (key !== 'text' && key !== 'content') {
        extractAllTextFromResponse(obj[key], textBlocks);
      }
    }
  }
  
  return textBlocks;
}

// Helper: Parse and validate JSON from a text string that may contain wrappers
function parseCandidateReport(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  let s = text.trim();
  
  // Decode unicode escapes if they appear as literal text
  if (s.includes('\\u00') || s.includes('\\u')) {
    try {
      s = s.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
    } catch (err) {
      // Continue with original string
    }
  }
  
  // Strip markdown fences
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
  
  // Extract JSON substring between first { and last }
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  
  const jsonStr = s.substring(firstBrace, lastBrace + 1);
  
  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
  
  // Validate schema minimally
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }
  
  if (!parsed.project_name || typeof parsed.project_name !== 'string') {
    return null;
  }
  
  if (!parsed.summary || typeof parsed.summary !== 'object') {
    return null;
  }
  
  const hasErrors = Array.isArray(parsed.errors);
  const hasNumericField = 
    typeof parsed.number_of_fixes === 'number' ||
    typeof parsed.total_time_spent_minutes === 'number' ||
    typeof parsed.number_of_errors_from_raygun === 'number';
  
  if (!hasErrors && !hasNumericField) {
    return null;
  }
  
  return parsed;
}

// Main extractor: scan MCP response text blocks for report JSON
function extractReportJsonFromTextBlocks(mcpResponse) {
  console.log("🔍 extractReportJsonFromTextBlocks called");
  
  // If response is a string, try to parse it
  if (typeof mcpResponse === 'string') {
    try {
      mcpResponse = JSON.parse(mcpResponse);
    } catch (err) {
      return null;
    }
  }
  
  // Check if response is wrapped in an object with content property
  if (mcpResponse && typeof mcpResponse === 'object' && !Array.isArray(mcpResponse)) {
    console.log("🔍 Response is object, checking content");
    
    if (Array.isArray(mcpResponse.content)) {
      // Check if content[0].text contains stringified JSON array
      if (mcpResponse.content.length > 0 && 
          mcpResponse.content[0].type === 'text' && 
          typeof mcpResponse.content[0].text === 'string') {
        
        const textContent = mcpResponse.content[0].text.trim();
        console.log("🔍 First text preview:", textContent.substring(0, 100));
        
        // If starts with [{ it's a stringified array
        if (textContent.startsWith('[{') || textContent.startsWith('[\"')) {
          console.log("🎯 Parsing stringified array from content[0].text");
          try {
            const parsedInner = JSON.parse(textContent);
            if (Array.isArray(parsedInner)) {
              console.log("✅ Parsed nested array");
              mcpResponse = parsedInner;
            }
          } catch (parseErr) {
            console.log("⚠️ Parse failed, using content array");
            mcpResponse = mcpResponse.content;
          }
        } else {
          mcpResponse = mcpResponse.content;
        }
      } else {
        mcpResponse = mcpResponse.content;
      }
    } else {
      console.log("❌ No content array");
      return null;
    }
  }
  
  if (!Array.isArray(mcpResponse)) {
    console.log("❌ Not an array");
    return null;
  }
  
  console.log(`✅ Processing ${mcpResponse.length} messages`);
  
  // Iterate ALL messages and ALL blocks
  for (let i = 0; i < mcpResponse.length; i++) {
    const message = mcpResponse[i];
    
    if (!message || !Array.isArray(message.content)) {
      continue;
    }
    
    console.log(`📨 Message ${i}: ${message.content.length} blocks`);
    
    // Check ALL blocks in this message
    for (let j = 0; j < message.content.length; j++) {
      const block = message.content[j];
      
      if (!block || block.type !== 'text' || typeof block.text !== 'string') {
        continue;
      }
      
      console.log(`  📄 Block ${j}: text length ${block.text.length}`);
      
      const payload = parseCandidateReport(block.text);
      
      if (payload) {
        console.log(`🎉 FOUND VALID JSON in message ${i}, block ${j}!`);
        return payload;
      }
    }
  }
  
  console.log("❌ No valid JSON in any text block");
  return null;
}

// Utility function to validate debug report JSON structure
function validateDebugReport(data) {
  console.log("Validating debug report:", data);
  
  if (!data.project_name) {
    console.log("Validation failed: missing project_name");
    return false;
  }
  
  if (!data.project_github_url) {
    console.log("Validation failed: missing project_github_url");
    return false;
  }
  
  if (!Array.isArray(data.errors)) {
    console.log("Validation failed: errors is not an array");
    return false;
  }
  
  if (data.errors.length === 0) {
    console.log("Validation failed: errors array is empty");
    return false;
  }
  
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
      console.log("🔍 Received response:", receiveddata);
      
      setStatus("Message sent successfully..");
      
      let mcpResponseData = receiveddata.data?.result;
      console.log("🔍 mcpResponseData:", mcpResponseData);
      
      // STEP 1: First parse stringified arrays (prioritize structured extraction)
      let messagesArray = null;
      
      if (Array.isArray(mcpResponseData)) {
        console.log("✅ Direct array format");
        messagesArray = mcpResponseData;
      } else if (mcpResponseData && typeof mcpResponseData === 'object' && mcpResponseData.content) {
        if (Array.isArray(mcpResponseData.content)) {
          // Check if content[0].text contains stringified JSON array
          if (mcpResponseData.content.length > 0 && 
              mcpResponseData.content[0].type === 'text' && 
              typeof mcpResponseData.content[0].text === 'string') {
            
            const textContent = mcpResponseData.content[0].text.trim();
            
            if (textContent.startsWith('[{') || textContent.startsWith('[\"')) {
              console.log("🎯 Stringified array detected, parsing...");
              try {
                const parsedInner = JSON.parse(textContent);
                if (Array.isArray(parsedInner)) {
                  console.log("✅ Parsed stringified array successfully");
                  messagesArray = parsedInner;
                }
              } catch (parseErr) {
                console.log("⚠️ Parse failed, treating content as messages");
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
      
      // STEP 2: Extract all text blocks from parsed structure
      let allTextBlocks = [];
      
      if (messagesArray && Array.isArray(messagesArray)) {
        console.log("🔍 Extracting text from", messagesArray.length, "messages");
        
        for (let i = 0; i < messagesArray.length; i++) {
          const msg = messagesArray[i];
          if (msg && msg.content && Array.isArray(msg.content)) {
            for (let j = 0; j < msg.content.length; j++) {
              const block = msg.content[j];
              
              // Extract from text blocks
              if (block && block.type === 'text' && block.text && typeof block.text === 'string') {
                if (!allTextBlocks.includes(block.text)) {
                  console.log(`  ✅ Message ${i}, Block ${j}: text (${block.text.length} chars)`);
                  allTextBlocks.push(block.text);
                }
              }
              
              // Also extract from tool_result blocks
              if (block && block.type === 'tool_result' && block.content && typeof block.content === 'string') {
                if (!allTextBlocks.includes(block.content)) {
                  console.log(`  ✅ Message ${i}, Block ${j}: tool_result (${block.content.length} chars)`);
                  allTextBlocks.push(block.content);
                }
              }
            }
          }
        }
      }
      
      // STEP 3: Fallback - use recursive extractor only if structured extraction failed
      if (allTextBlocks.length === 0) {
        console.log("🔄 No text from structured extraction, trying recursive");
        const recursiveTexts = extractAllTextFromResponse(mcpResponseData);
        console.log("🔍 Recursive found", recursiveTexts.length, "text items");
        
        // Filter out stringified JSON arrays (they're not display text)
        for (const text of recursiveTexts) {
          const trimmed = text.trim();
          // Skip if it's a stringified array or object
          if (!trimmed.startsWith('[{') && !trimmed.startsWith('{"') && trimmed.length > 0) {
            if (!allTextBlocks.includes(text)) {
              allTextBlocks.push(text);
            }
          }
        }
      }
      
      // Concatenate all text for display
      const displayContent = allTextBlocks.join('\n\n');
      console.log("🔍 Total text blocks:", allTextBlocks.length);
      console.log("🔍 Final display length:", displayContent.length);
      
      const aiMessage = {
        role: "AI",
        content: displayContent || "No content available"
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      // Extract JSON report
      console.log("\n🚀 Extracting JSON report...");
      let payload = extractReportJsonFromTextBlocks(messagesArray || mcpResponseData);
      
      // Fallback: Try parsing concatenated displayContent
      if (!payload && displayContent) {
        console.log("🔄 Fallback: parsing displayContent");
        payload = parseCandidateReport(displayContent);
      }
      
      // Second fallback: Try each text block individually
      if (!payload && allTextBlocks.length > 0) {
        console.log("🔄 Trying each text block individually");
        for (let i = 0; i < allTextBlocks.length; i++) {
          payload = parseCandidateReport(allTextBlocks[i]);
          if (payload) {
            console.log(`✅ Found JSON in block ${i}`);
            break;
          }
        }
      }
      
      if (payload) {
        if (validateDebugReport(payload)) {
          console.log("🎉 VALID DEBUG REPORT!");
          setDetectedReport(payload);
          setShowSaveButton(true);
          setSaveStatus("✅ Debug report detected and ready to save");
        } else {
          console.log("❌ Validation failed");
          setSaveStatus("⚠️ JSON detected but validation failed");
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
