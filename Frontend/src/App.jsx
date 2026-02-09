import { useState } from 'react';
import './App.css';
import Home from './Home.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Errors from "./Errors";
import Projects from "./Projects.jsx"; // Add your Projects page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />           {/* Home page */}
        <Route path="/errors" element={<Errors />} />   {/* Errors page */}
        <Route path="/projects" element={<Projects />} /> {/* Projects list page */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
