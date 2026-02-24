import NavBar from "./NavBar";
import './Home.css'
import Send_to_Mcp from "./Send_to_Mcp";

function Home() {
  return (
    <div className="Home">
      <div className="Home-NavBar"><NavBar/> </div>
  
      <Send_to_Mcp/>
    </div>
  );
}

export default Home;