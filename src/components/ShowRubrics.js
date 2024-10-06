import React, { useEffect, useState } from 'react';
import './ShowRubrics.css';
import Navbar from './Navbar'; // Importamos el nuevo navbar
import { FaSearch } from 'react-icons/fa';

function ShowRubrics({ userRole }) {
  const [rubrics, setRubrics] = useState([]);
  const [showRubricDetails, setShowRubricDetails] = useState(false);
  const [rubricDetails, setRubricDetails] = useState(null);

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const response = await fetch('http://localhost:5000/rubricas/publicas');
        const data = await response.json();
        setRubrics(data);
      } catch (error) {
        console.error('Error al cargar las rúbricas:', error);
      }
    };

    fetchRubrics();
  }, []);

  const handleMagicSearch = async (rubric) => {
    try {
      const response = await fetch(`http://localhost:5000/rubricas/${rubric.rubricaid}`);
      const data = await response.json();
      setRubricDetails(data);
      setShowRubricDetails(true);
    } catch (error) {
      console.error('Error al obtener la rúbrica:', error);
    }
  };

  const handleCloseModal = () => {
    setShowRubricDetails(false);
    setRubricDetails(null);
  };

  return (
    <div className="show-rubrics-wrapper">
      <Navbar role={userRole} />
      {/* Eliminar la línea siguiente */}
      {/* <div className="header">Rúbricas Públicas</div> */}

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
          <p>No hay rúbricas públicas disponibles.</p>
        )}
      </div>

      {/* Modal para mostrar los detalles de la rúbrica */}
      {showRubricDetails && (
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

export default ShowRubrics;
