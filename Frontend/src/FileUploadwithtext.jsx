import React,{useState} from "react";
import './FileUploadwithtext.css'


function FileUploadwithtext(){

    const [file,setFile]= useState(null);
    const [prompt,setPrompt] = useState("");
function handleFileChange(event){

    var selectedFile = event.target.files[0];
    setFile(selectedFile);
}
function handleTextChange(event){

    var inputPrompt = event.target.value;
    setPrompt(inputPrompt);
}


async function handleUpload(){

    if(!file){
        alert("Please select a file first");
        return;
    }

    var formData = new FormData();
    formData.append("file",file);
    formData.append("prompt",prompt || "");


    try{
var response = await fetch(import.meta.env.VITE_API_BASE_URL+"/upload_ai_data", {
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
        <div className="fileUpload" >
                 <h3>Add a new record</h3>
        <div id="inputfile">
<input type="file" accept=".json" onChange={handleFileChange}></input></div>
<h3>system prompt</h3>

<textarea id="prompt_input" type="text" value={prompt} onChange={handleTextChange} placeholder="Type in system prompt..."></textarea>

<button id="submit_button" onClick={handleUpload}>Submit</button>

      
</div >
        
    )
    
}
export default FileUploadwithtext;