import React, { useEffect, useState } from 'react';
import './ShowRubrics.css';
import Navbar from './Navbar'; // Importamos el nuevo navbar
import { FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import loadingImage from '../components/loading_image.gif'; // Importa la imagen de carga

function ShowRubrics() {
  const location = useLocation();
  const roles = location.state?.roles || []; // Obtén los roles del estado
  const userId = location.state?.userId;
  const [rubrics, setRubrics] = useState([]);
  const [showRubricDetails, setShowRubricDetails] = useState(false);
  const [rubricDetails, setRubricDetails] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para controlar si está cargando

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const response = await fetch('http://localhost:5000/rubricas/publicas');
        const data = await response.json();
        setRubrics(data);
      } catch (error) {
        console.error('Error al cargar las rúbricas:', error);
      } finally {
        setLoading(false); // Deja de cargar cuando la solicitud termina
      }
    };

    fetchRubrics();
  }, []);

  const handleMagicSearch = async (rubric) => {
    try {
      const response = await fetch(`http://localhost:5000/rubricas/${rubric.rubrica_id}`);
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
      <Navbar roles={roles} userId={userId} /> {/* Asegúrate de que roles sean pasados correctamente */}
      <div className="rubrics-container">
        {loading ? (
          <div className="loading-message">
            <p>Cargando información, espere un momento por favor...</p>
            <img src={loadingImage} alt="Cargando..." className="loading-gif" />
          </div>
        ) : rubrics.length > 0 ? (
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
