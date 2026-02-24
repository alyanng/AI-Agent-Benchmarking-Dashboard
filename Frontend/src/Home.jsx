import { useEffect } from "react";
//import { fetchUsers } from "./api/users"; 
import FileUploadwithtext from "./FileUploadwithtext";
import NavBar from "./NavBar";
import './Home.css'
import { useNavigate } from "react-router-dom";
import Send_to_Mcp from "./Send_to_Mcp";

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