// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import CreateRubric from './components/CreateRubric';
import EvaluateRubric from './components/EvaluateRubric';
import ShowRubrics from './components/ShowRubrics';
import ShowCreatedRubrics from './components/ShowCreatedRubrics'
import ShowAvailableRubrics from './components/ShowAvailableRubrics';

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
          <Route path="/rubrics/show_rubrics" element={<ShowRubrics />} />
          <Route path="/rubrics/show_created_rubrics" element={<ShowCreatedRubrics />} />
          <Route  path='/rubrics/show_available_rubrics' element={<ShowAvailableRubrics/>}/>
        </Routes>
      </Router>
  );
}

export default App;
