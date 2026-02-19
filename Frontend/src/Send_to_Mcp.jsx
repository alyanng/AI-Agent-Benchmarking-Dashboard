import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixer from "../assets/codefixer.jpeg";
import ReactMarkdown from "react-markdown";

// Utility function to extract JSON from AI response text
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
      
      const aiMessage = {
        role: "AI",
        content: receiveddata.data.result.content[0].text,
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      // Auto-detect and extract JSON from AI response
      const extractedJson = extractJsonFromAiResponse(aiMessage.content);
      if (extractedJson) {
        console.log("Extracted JSON string:", extractedJson);
        try {
          const parsedData = JSON.parse(extractedJson);
          console.log("Parsed JSON data:", parsedData);
          
          if (validateDebugReport(parsedData)) {
            console.log("✅ Valid debug report detected");
            setDetectedReport(parsedData);
            setShowSaveButton(true);
            setSaveStatus("✅ Debug report detected and ready to save");
          } else {
            console.log("❌ JSON validation failed");
            setSaveStatus("⚠️ JSON detected but validation failed - check console for details");
          }
        } catch (e) {
          console.error("JSON parsing failed:", e);
          console.log("Failed JSON string:", extractedJson);
          setSaveStatus("");
        }
      } else {
        console.log("No JSON found in AI response");
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
