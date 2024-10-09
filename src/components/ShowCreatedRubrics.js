import React, { useEffect, useState } from 'react';
import './ShowCreatedRubrics.css';
import Navbar from './Navbar';
import { FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

function ShowCreatedRubrics() {
  const location = useLocation();
  const roles = location.state?.roles || []; // Obtén los roles del estado
  const creadorId = location.state?.userId; // Asegúrate de pasar el userId en la navegación
  const [rubrics, setRubrics] = useState([]);
  const [showCreatedRubricDetails, setShowCreatedRubricDetails] = useState(false);
  const [rubricDetails, setRubricDetails] = useState(null);

  console.log("Creador id: ", creadorId);

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const response = await fetch(`http://localhost:5000/rubricas/creadas/${creadorId}`);
        const data = await response.json();
        console.log("Info obtenida: ", data);
        setRubrics(data);
      } catch (error) {
        console.error('Error al cargar las rúbricas creadas:', error);
      }
    };

    fetchRubrics();
  }, [creadorId]);

  const handleMagicSearch = async (rubric) => {
    try {
      const response = await fetch(`http://localhost:5000/rubricas/${rubric.rubricaid}`);
      const data = await response.json();
      setRubricDetails(data);
      setShowCreatedRubricDetails(true);
    } catch (error) {
      console.error('Error al obtener la rúbrica:', error);
    }
  };

  const handleCloseModal = () => {
    setShowCreatedRubricDetails(false);
    setRubricDetails(null);
  };

  return (
    <div className="show-rubrics-wrapper">
      <Navbar roles={roles} userId={creadorId} /> {/* Asegúrate de que roles sea pasado correctamente */}
      <div className="rubrics-container">
        {rubrics.length > 0 ? (
          rubrics.map((rubric, index) => (
            <div key={index} className="rubric-item">
              <div className="rubric-info">
                <div className="rubric-title">{rubric.titulo}</div>
                <div className="rubric-author">Autor: {rubric.autor}</div>
              </div>
              <div className="rubric-search-icon" onClick={() => handleMagicSearch(rubric)}>
                <FaSearch />
              </div>
            </div>
          ))
        ) : (
          <p>No hay rúbricas creadas disponibles.</p>
        )}
      </div>

      {/* Modal para mostrar los detalles de la rúbrica */}
      {showCreatedRubricDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{rubricDetails.titulo}</h2>
            <p>{rubricDetails.descripcion}</p>
            {rubricDetails.criterios && rubricDetails.criterios.map((criterio, index) => (
              <div key={index} className="criterio-container">
                <h3>{criterio.nombrecriterio}</h3>
                <table className="rubric-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      {criterio.subcriterios[0]?.columnas.map((columna, colIndex) => (
                        <th key={colIndex}>{colIndex + 1} PTOS</th>
                      ))}
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criterio.subcriterios.map((subcriterio, subIndex) => (
                      <tr key={subIndex}>
                        <td>{subcriterio.descripcion}</td>
                        {subcriterio.columnas.map((columna, colIndex) => (
                          <td key={colIndex}>{columna.textocolumna}</td>
                        ))}
                        <td>{subcriterio.porcentaje}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button onClick={handleCloseModal}>Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShowCreatedRubrics;
