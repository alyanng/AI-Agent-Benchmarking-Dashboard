import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="Home">
      <h1>Welcome to the AI Agent Dashboard</h1>
      <p>This is the Home page.</p>
      <Link to="/projects">
        <button>Go to Project Submission</button>
      </Link>
    </div>
  );
}

export default Home;
