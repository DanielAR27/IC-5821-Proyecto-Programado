import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ roles, userId }) => {
  const getNavbarOptions = (roles = []) => {
    const options = []; // Inicializa opciones

    if (roles.includes('Administrador')) {
      options.push('Listar rúbricas públicas', 'Listar rúbricas creadas', 'Crear rúbricas', 'Listar rúbricas disponibles');
    } else if (roles.includes('Creador')) {
      options.push('Listar rúbricas públicas', 'Crear rúbricas', 'Listar rúbricas creadas');
    }

    if (roles.includes('Evaluador')) {
      options.push('Listar rúbricas públicas', 'Evaluar rúbricas');
    }

    if (roles.includes('Consultor')) {
      options.push('Listar rúbricas públicas');
    }

    return options;
  };

  const options = getNavbarOptions(roles); // Usa roles para obtener las opciones

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span>Rubrics App</span>
      </div>
      <div className="navbar-right">
        {options.map((option, index) => {
          let route = '';
          switch (option) {
            case 'Listar rúbricas públicas':
              route = '/rubrics/show_rubrics';
              break;
            case 'Crear rúbricas':
              route = '/rubrics/create';
              break;
            case 'Listar rúbricas creadas':
              route = '/rubrics/show_created_rubrics';
              break;
            case 'Listar rúbricas disponibles':
              route = '/rubrics/show_available_rubrics';
              break;
            default:
              break;
          }

          return (
            <Link key={index} to={route} state={{ roles, userId }}>
              {option}
            </Link>
          );
        })}

        {/* Dropdown para la opción Asignación solo para Evaluador */}
        {roles.includes('Administrador') && (
          <div className="dropdown">
            <span className="dropdown-toggle">
              Asignación
            </span>
            <div className="dropdown-menu">
              <Link to="/assign_rubric" state={{ roles, userId }}>
                Asignar Rúbrica
              </Link>
              <Link to="/assign_evaluator" state={{ roles, userId }}>
                Asignar Evaluador
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
