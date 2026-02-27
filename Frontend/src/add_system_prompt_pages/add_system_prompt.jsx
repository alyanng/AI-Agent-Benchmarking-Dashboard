import React,{useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";

function AddSystemPrompt(){
    const [prompt,setPrompt] = useState("");
    const { projectId } = useParams();
   
    function handleTextChange(event){
    var inputPrompt = event.target.value;
    setPrompt(inputPrompt);
    }

    async function handleUpload(){
        if(!prompt){
            alert("Please enter a system prompt");
        return;
        }
        var formData = new FormData();
        formData.append("prompt",prompt || "");
        try{
            var response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload_system_prompt?projectid=${projectId}`, {
                method:"POST",
                body:formData
            });
            var data= await response.json();
            alert ("Upload success");
            console.log(data);    
        }
        catch(error){
            console.log(error);
            alert("Upload Failed");
        }
    
    }

    return(
        <>
        <NavBar />
        <div className="fileUpload" >
            <h3>Add new system prompt</h3>
            <textarea id="prompt_input" type="text" value={prompt} onChange={handleTextChange} placeholder="Type in system prompt..."></textarea>
            <button id="submit_button" onClick={handleUpload}>Add</button>
        </div >  
        </>
    )
}
export default AddSystemPrompt;