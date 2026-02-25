import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixerImg from "../assets/codefixer.png";
import autohiveImg from "../assets/autohive.png";
import ReactMarkdown from "react-markdown";

// Helper: Parse and validate JSON from a text string that may contain wrappers
function parseCandidateReport(text) {
  if (!text || typeof text !== 'string') {
    console.debug("parseCandidateReport: input is not a string");
    return null;
  }
  
  let s = text.trim();
  console.debug("parseCandidateReport input (first 300 chars):");
  console.debug(s.substring(0, 300));
  
  // Decode unicode escapes if they appear as literal text (e.g., "\u0022" as a string)
  // This happens when the response is double-encoded
  if (s.includes('\\u00') || s.includes('\\u')) {
    console.debug("Detected unicode escapes, decoding...");
    try {
      // Replace all \uXXXX patterns with actual characters
      s = s.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      console.debug("After unicode decode (first 300 chars):");
      console.debug(s.substring(0, 300));
    } catch (err) {
      console.debug("Unicode decode error:", err.message);
      // Continue with original string
    }
  } else {
    console.debug("No unicode escapes detected in string");
  }
  
  // Strip wrappers
  // Remove markdown fences - check for actual backtick characters
  if (s.startsWith('```json') || s.startsWith('```')) {
    console.debug("Removing markdown fences");
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
  
  console.debug("After fence removal (first 300 chars):");
  console.debug(s.substring(0, 300));
  
  // Remove <artifact> tags if present
  const artifactStart = s.indexOf('<artifact');
  if (artifactStart !== -1) {
    console.debug("Removing artifact tags");
    const contentStart = s.indexOf('>', artifactStart);
    const artifactEnd = s.indexOf('</artifact>');
    if (contentStart !== -1 && artifactEnd !== -1 && artifactEnd > contentStart) {
      s = s.substring(contentStart + 1, artifactEnd).trim();
      console.debug("After artifact removal (first 300 chars):");
      console.debug(s.substring(0, 300));
    }
  }
  
  // Extract JSON substring between first { and last }
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  
  console.debug(`Brace positions: first={${firstBrace}}, last={${lastBrace}}`);
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    console.debug("No valid braces found");
    return null;
  }
  
  const jsonStr = s.substring(firstBrace, lastBrace + 1);
  console.debug("Extracted JSON string (first 300 chars):");
  console.debug(jsonStr.substring(0, 300));
  
  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
    console.debug("JSON.parse succeeded!");
    console.debug("Parsed object keys:", Object.keys(parsed));
  } catch (err) {
    console.debug("JSON.parse failed:", err.message);
    console.debug("Failed JSON (first 500 chars):");
    console.debug(jsonStr.substring(0, 500));
    return null;
  }
  
  // SValidate schema minimally
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    console.debug("Parsed result is not a valid object");
    return null;
  }
  
  // Must contain project_name (string)
  if (!parsed.project_name || typeof parsed.project_name !== 'string') {
    console.debug("Missing or invalid project_name, value:", parsed.project_name);
    return null;
  }
  
  // Must contain summary (object)
  if (!parsed.summary || typeof parsed.summary !== 'object') {
    console.debug("Missing or invalid summary, value:", parsed.summary);
    return null;
  }
  
  // Must contain errors (array) OR at least one required numeric field
  const hasErrors = Array.isArray(parsed.errors);
  const hasNumericField = 
    typeof parsed.number_of_fixes === 'number' ||
    typeof parsed.total_time_spent_minutes === 'number' ||
    typeof parsed.number_of_errors_from_raygun === 'number';
  
  console.debug(`hasErrors: ${hasErrors}, hasNumericField: ${hasNumericField}`);
  
  if (!hasErrors && !hasNumericField) {
    console.debug("Missing both errors array and numeric fields");
    return null;
  }
  
  console.debug("parseCandidateReport SUCCESSFUL!");
  console.debug("Final parsed object:", parsed);
  // Return valid object
  return parsed;
}

// Main extractor: scan MCP response text blocks for report JSON
function extractReportJsonFromTextBlocks(mcpResponse) {
  console.debug("extractReportJsonFromTextBlocks called");
  console.debug("Input type:", typeof mcpResponse);
  console.debug("Is array?", Array.isArray(mcpResponse));
  console.debug("Full input:", mcpResponse);
  
  // If response is a string, try to parse it as JSON array first
  if (typeof mcpResponse === 'string') {
    console.debug("Response is string, attempting to parse as JSON");
    try {
      mcpResponse = JSON.parse(mcpResponse);
      console.debug("Parsed string to object/array");
    } catch (err) {
      console.debug("String is not valid JSON:", err.message);
      return null;
    }
  }
  
  // Check if response is wrapped in an object with content property
  if (mcpResponse && typeof mcpResponse === 'object' && !Array.isArray(mcpResponse)) {
    console.debug("Response is object, checking for content array");
    console.debug("Object keys:", Object.keys(mcpResponse));
    
    if (Array.isArray(mcpResponse.content)) {
      console.debug("Found content array in wrapper");
      
      // SPECIAL CASE: Check if content[0].text contains stringified JSON array
      if (mcpResponse.content.length > 0 && 
          mcpResponse.content[0].type === 'text' && 
          typeof mcpResponse.content[0].text === 'string') {
        
        const firstText = mcpResponse.content[0].text.trim();
        console.debug("Checking if content[0].text is stringified JSON array");
        console.debug("First text preview:", firstText.substring(0, 100));
        
        // Check if it starts with [{ (stringified array)
        if (firstText.startsWith('[{') || firstText.startsWith('[{"')) {
          console.debug("Detected stringified JSON array in text field!");
          try {
            const parsedArray = JSON.parse(firstText);
            if (Array.isArray(parsedArray)) {
              console.debug("Successfully parsed nested JSON array");
              mcpResponse = parsedArray;
            }
          } catch (err) {
            console.debug("Failed to parse nested array:", err.message);
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
      console.debug("Object does not have content array");
      return null;
    }
  }
  
  // Only parse from array format (MCP messages)
  if (!Array.isArray(mcpResponse)) {
    console.debug("Not an array after unwrapping");
    return null;
  }
  
  console.debug(`Processing ${mcpResponse.length} messages`);
  
  // Iterate messages from last to first
  for (let i = mcpResponse.length - 1; i >= 0; i--) {
    const message = mcpResponse[i];
    
    console.debug(`\n--- Message ${i} ---`);
    console.debug("Message:", message);
    
    if (!message) {
      console.debug(`Message ${i} is null/undefined`);
      continue;
    }
    
    if (!Array.isArray(message.content)) {
      console.debug(`Message ${i} has no content array`);
      continue;
    }
    
    console.debug(`Message ${i}: role=${message.role}, ${message.content.length} content blocks`);
    
    // Iterate blocks from last to first
    for (let j = message.content.length - 1; j >= 0; j--) {
      const block = message.content[j];
      
      console.debug(`  --- Block ${j} ---`);
      console.debug(`  Block:`, block);
      
      if (!block) {
        console.debug(`Block ${j} is null/undefined`);
        continue;
      }
      
      console.debug(`  Block type: ${block.type}`);
      
      if (block.type !== 'text') {
        console.debug(`Skipping non-text block`);
        continue;
      }
      
      if (typeof block.text === 'string') {
        console.debug(`Block ${j} has text, length: ${block.text.length}`);
        console.debug(`  Text preview (first 300 chars):`);
        console.debug(block.text.substring(0, 300));
        
        const payload = parseCandidateReport(block.text);
        
        if (payload) {
          console.debug("FOUND VALID PAYLOAD!");
          return payload;
        } else {
          console.debug(`   Block ${j}: parseCandidateReport returned null`);
        }
      } else {
        console.debug(`   Block ${j}: text is not a string`);
      }
    }
  }
  
  console.debug("\n  No valid payload found in any text block");
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
  
  console.log("Validation of debug report passed!");
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
  const [testRound, setTestRound] = useState(1);

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

      console.log("Received data from AI:", receiveddata);
      
      setStatus("Message sent successfully..");
      
      // Extract MCP response
      let mcpResponseData = receiveddata.data?.result;
      
      console.log("mcpResponseData:", mcpResponseData);
      
      // Unwrap and extract messages array
      let messagesArray = null;
      
      if (Array.isArray(mcpResponseData)) {
        console.log("MCP response is direct array");
        messagesArray = mcpResponseData;
      } else if (mcpResponseData && typeof mcpResponseData === 'object' && mcpResponseData.content) {
        console.log("MCP response has content property");
        
        if (Array.isArray(mcpResponseData.content)) {
          // Check if content[0].text contains stringified JSON array
          if (mcpResponseData.content.length > 0 && 
              mcpResponseData.content[0].type === 'text' && 
              typeof mcpResponseData.content[0].text === 'string') {
            
            const textContent = mcpResponseData.content[0].text.trim();
            console.log("content[0] is text block, checking if it contains stringified array");
            console.log("First 100 chars:", textContent.substring(0, 100));
            
            // Check if text starts with [{ or [" (stringified array)
            if (textContent.startsWith('[{') || textContent.startsWith('[\"')) {
              console.log("DETECTED: content[0].text is stringified JSON array!");
              try {
                const parsedInner = JSON.parse(textContent);
                if (Array.isArray(parsedInner)) {
                  console.log("Successfully parsed nested stringified array");
                  messagesArray = parsedInner;
                }
              } catch (parseErr) {
                console.log("Failed to parse stringified array:", parseErr.message);
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
        console.log("Extracting display text from", messagesArray.length, "messages");
        for (let i = messagesArray.length - 1; i >= 0; i--) {
          const msg = messagesArray[i];
          if (msg && msg.content && Array.isArray(msg.content)) {
            for (let j = msg.content.length - 1; j >= 0; j--) {
              const block = msg.content[j];

              if (block && block.type === 'text' && block.text) {
                displayContent = block.text;
                console.log("Found display text, length:", displayContent.length);
                break;
              }
            }
            if (displayContent) break;
          }
        }
      }
      
      console.log("Final display content length:", displayContent.length);
      
      const aiMessage = {
        role: "Github Code Fixer:",
        content: displayContent || "No content available"
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      // Extract report JSON from text blocks
      console.log("\nCalling extractReportJsonFromTextBlocks...");
      let payload = extractReportJsonFromTextBlocks(messagesArray || mcpResponseData);
      
      console.log("Payload result:", payload);
      
      // FALLBACK: If extraction failed but we have displayContent, try parsing that
      if (!payload && displayContent) {
        console.log("Fallback: trying to parse displayContent directly");
        payload = parseCandidateReport(displayContent);
        console.log("Fallback result:", payload);
      }
      
      if (payload) {
        console.log(" Payload found, validating...");
        
        if (validateDebugReport(payload)) {
          console.log("VALID DEBUG REPORT DETECTED!");
          setDetectedReport(payload);
          setShowSaveButton(true);
          setSaveStatus("Debug report detected and ready to save");
        } else {
          console.log("JSON validation failed");
          setSaveStatus("JSON detected but validation failed - check console for details");
        }
      } else {
        console.log("No valid JSON payload found");
        setSaveStatus("");
      }

      setPrompt("");
    } catch (error) {
      console.error("Error in handleSendPrompt:", error);
      setStatus("Failed to send message. Please try again.");
    }
  }

  // Function to test the current testRound
   function handleCurrentTestRound(event) {
     var inputTestRound = event.target.value;
     setTestRound(inputTestRound);
     console.log("Testing current test round:", testRound);
   }

  // // Function to send current testRound to backend 
  // async function handleSendcurrentTestRound() {
  //   console.log("Testing current test round:", testRound);
  //   try {      
  //     var response = await fetch(
  //       import.meta.env.VITE_API_BASE_URL + "/api/save_test_round",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           test_round: testRound,
  //         }),
  //       },
  //     );
  //   } catch (error) {
  //     console.error("Error in handleSendcurrentTestRound:", error);
  //   }

  // }

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
            prompt: prompt || "",
            test_round: testRound || 1, 

          })
        }
      );
      
      console.log("Backend response status:", response.status);
      const result = await response.json();
      console.log("Backend response:", result);
      
      if (result.success) {
        alert(`Report saved successfully!\n\nProject ID: ${result.project_id}\nConfig ID: ${result.config_id}\nErrors inserted: ${result.total_errors_inserted}`);
        setSaveStatus("Report saved successfully");
        setShowSaveButton(false);
        setDetectedReport(null);
      } else {
        const errorMsg = result.error || "Unknown error";
        alert("Failed to save report: " + errorMsg);
        setSaveStatus("Failed to save report");
        console.error("Save failed:", result);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save report: " + error.message);
      setSaveStatus("Failed to save report");
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
          <input
            type="text"
            placeholder="Enter test round (e.g., 1, 2, 3)"
            value={testRound}
            onChange={handleCurrentTestRound}
          />
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
