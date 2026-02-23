import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixerImg from "../assets/codefixer.png";
import autohiveImg from "../assets/autohive.png";
import ReactMarkdown from "react-markdown";

function Send_to_Mcp(data) {
  const [prompt, setPrompt] = useState(null);
  const [status, setStatus] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

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
      
      // Extract text content from response
      let displayContent = "";
      
      // Try to get content from result
      if (receiveddata.data?.result) {
        const result = receiveddata.data.result;
        
        // Check if result.content is an array
        if (Array.isArray(result.content) && result.content.length > 0) {
          // Get text from first content block
          const firstBlock = result.content[0];
          if (firstBlock.type === 'text' && firstBlock.text) {
            displayContent = firstBlock.text;
          }
        }
        // Also try old format
        else if (result.content?.[0]?.text) {
          displayContent = result.content[0].text;
        }
      }
      
      console.log("Display content:", displayContent);
      
      const aiMessage = {
        role: "Github Code Fixer:",
        content: displayContent || "No content available"
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      setPrompt("");
    } catch (error) {
      console.error("Error in handleSendPrompt:", error);
      setStatus("Failed to send message. Please try again.");
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
