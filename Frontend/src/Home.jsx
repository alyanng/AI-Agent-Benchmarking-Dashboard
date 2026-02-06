import { useEffect } from "react";
import { fetchUsers } from "./api/users"; 

function Home() {
    // coonect to backend
  useEffect(() => {
    fetchUsers().then(data => {
      console.log(data);
    });
  }, []); 

  return (
    <div className="Home">
      <h3>This is my Home page</h3>
    </div>
  );
}

export default Home;