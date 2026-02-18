import './NavBar.css';
import { useNavigate, useLocation } from 'react-router-dom';

function NavBar(){
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleBack = () => {
    // If there's history, go back; otherwise, fallback to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className='NavBar'>
      {!isHome && (
        <button 
          onClick={handleBack}
          className="NavBar-back-button"
          title="Go back"
          aria-label="Go back to previous page"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon points="14,4 6,10 14,16" />
          </svg>
        </button>
      )}
      <p>AI-Agent-Benchmarking-Dashboard</p>
      <div className="NavBar-menu">
      <a href="/#Home">Home</a>
      <a href="/projects">Review</a>
      <a href='/projectlist'>Config</a>
      </div>
        
    </div>
  );
}

export default NavBar;


  // <div className="review">
  //     <h3>Review my record</h3>
  //     <button id="review_button" onClick={() => navigate("/projects")}>Review</button>
    
  //     </div>