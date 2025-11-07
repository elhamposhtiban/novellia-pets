import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PetList from "./pages/PetList";
import PetDetail from "./pages/PetDetail";
import EditPet from "./pages/EditPet";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pets" element={<PetList />} />
        <Route path="/pets/:id" element={<PetDetail />} />
        <Route path="/pets/:id/edit" element={<EditPet />} />
      </Routes>
    </Router>
  );
}

export default App;
