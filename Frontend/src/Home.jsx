import { useEffect } from "react";
// import { fetchUsers } from "./api/users"; 
import FileUploadwithtext from "./FileUploadwithtext";
import NavBar from "./NavBar";
import './Home.css'
import { useNavigate } from "react-router-dom";

function Home() {


  return (
    <div className="Home">
      
          <div className="Home-NavBar"><NavBar/> </div>
          <div className="review">
 <h3>Review my record</h3>
 <button id="review_button" onClick={() => navigate("/project_page")}>Review</button></div>
      
    
  <FileUploadwithtext/>

    </div>
  );
}

export default Home;