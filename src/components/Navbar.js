import React from 'react';
import './Navbar.css';

const Navbar = ({ role }) => {
  const getOptions = () => {
    switch (role) {
      case 'administrador':
        return ['Crear Rúbrica', 'Ver Rúbricas', 'Gestión de Usuarios'];
      case 'creador':
        return ['Crear Rúbrica', 'Ver Rúbricas'];
      case 'evaluador':
        return ['Evaluar Rúbricas', 'Ver Rúbricas'];
      case 'consultor':
        return ['Ver Rúbricas'];
      default:
        return [];
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span>Rubrics App</span>
      </div>
      <div className="navbar-right">
        {getOptions().map((option, index) => (
          <a key={index} href={`/${option.replace(/\s+/g, '-').toLowerCase()}`}>
            {option}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
