import { useState } from 'react'
import './App.css'
import Home from './Home.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
 

  return (
   
       <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/project_page" element={<ProjectPage />} /> */}
      </Routes>
    </BrowserRouter>

  )
}


export default App
