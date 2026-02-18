import "./Send_to_Mcp.css";
import React, { useState } from "react";
import codefixer from "../assets/codefixer.jpeg";
import ReactMarkdown from "react-markdown";

function Send_to_Mcp(data) {
  const [prompt, setPrompt] = useState(null);
  //   const [file, setFile] = useState(null);
  //   const [result, setResult] = useState(null);
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

    // alert("send success");
    setStatus("Sending..");
    // var formData = new FormData();
    // formData.append("prompt",prompt);
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

      console.log(receiveddata);
      //   setResult(receiveddata);
      setStatus("Message sent successfully..");
      const aiMessage = {
        role: "AI",
        content: receiveddata.data.result.content[0].text,
      };

      setChatHistory((prev) => [...prev, aiMessage]);

      setPrompt("");
    } catch (error) {
      console.log(error);
      setStatus("Failed to send message. Please try again.");
    }
  }

  return (
    <div className="sendtomcp">
      {/* <h3>Choose configuration</h3>
      <select name="" id="">
        <option>choose</option>
      </select> */}
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

      {/* <textarea id="receivedText" value={text} readOnly></textarea> */}
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
