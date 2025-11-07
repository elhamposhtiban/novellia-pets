import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PetList from "./pages/PetList";
import PetDetail from "./pages/PetDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pets" element={<PetList />} />
        <Route path="/pets/:id" element={<PetDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
