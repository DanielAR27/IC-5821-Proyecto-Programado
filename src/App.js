import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CreateRubric from './components/CreateRubric';
import EvaluateRubric from './components/EvaluateRubric'

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route path="/" element={<Login />} />
        {/* Ruta para el registro */}
        <Route path="/register" element={<Register />} />
        <Route path="/rubrics/create" element={<CreateRubric />} />
        <Route path="/rubrics/evaluate/:id" element={<EvaluateRubric />} />
      </Routes>
    </Router>
  );
}

export default App;
