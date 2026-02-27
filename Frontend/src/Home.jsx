import { useEffect } from "react";
//import { fetchUsers } from "./api/users"; 
import FileUploadwithtext from "./components/FileUploadwithtext";
import NavBar from "./components/NavBar";
import './Home.css'
import { useNavigate } from "react-router-dom";
import Send_to_Mcp from "./components/Send_to_Mcp";

function Home() {
  const navigate = useNavigate(); 

  return (
    <div className="Home">
      <div className="Home-NavBar"><NavBar/> </div>
      {/* <FileUploadwithtext/> */}
      <Send_to_Mcp/>
      
      
    </div>
  );
}

export default Home;