import { useState } from 'react'
import './App.css'
import Home from './Home.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Errors from "./Errors";
import Configurations from "./configurations.jsx";

function App() {
 

  return (
   
       <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/project_page" element={<ProjectPage />} /> */}
        <Route path="/errors" element={<Errors />} />
        <Route path="/configurations" element={<Configurations />} />
        
      </Routes>
    </BrowserRouter>

  )
}


export default App
