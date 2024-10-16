import React, { useEffect, useState } from 'react';
import './ShowAvailableRubrics.css';
import Navbar from './Navbar';
import { FaSearch, FaPen, FaTrash, FaChartBar } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import loadingGif from './loading_image.gif';

function ShowAvailableRubrics() {
  const location = useLocation();
  const roles = location.state?.roles || [];
  const creadorId = location.state?.userId;
  const [rubrics, setRubrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRubricDetails, setShowRubricDetails] = useState(false);
  const [rubricDetails, setRubricDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchRubrics = async () => {
      try {
        const response = await fetch('http://localhost:5000/rubricas/disponibles');
        const data = await response.json();
        setRubrics(data);
      } catch (error) {
        console.error('Error al cargar las rúbricas disponibles:', error);
      } finally {
        setIsLoading(false);
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

  const handleEdit = (rubric) => {
    console.log("Editando rúbrica:", rubric);
  };

  const handleDelete = (rubric) => {
    setConfirmDelete(rubric);
  };

  const togglePublicStatus = async (rubric) => {
    try {
      const newPublicStatus = !rubric.publica; // Cambia el estado de publica
      const response = await fetch(`http://localhost:5000/rubricas/${rubric.rubrica_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publica: newPublicStatus }),
      });
  
      if (response.ok) {
        setRubrics((prevRubrics) =>
          prevRubrics.map((r) =>
            r.rubrica_id === rubric.rubrica_id ? { ...r, publica: newPublicStatus } : r
          )
        );
      } else {
        console.error('Error al actualizar el estado de pública de la rúbrica.');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de pública de la rúbrica:', error);
    }
  };
  

  const confirmDeleteRubric = async () => {
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/rubricas/${confirmDelete.rubrica_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        setRubrics(rubrics.filter(r => r.rubrica_id !== confirmDelete.rubrica_id));
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        console.error('Error al eliminar la rúbrica');
      }
    } catch (error) {
      console.error('Error al eliminar la rúbrica:', error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowRubricDetails(false);
    setRubricDetails(null);
  };

  return (
    <div className="show-rubrics-wrapper">
      <Navbar roles={roles} userId={creadorId} />
      {successMessage && <div className="success-message">{successMessage}</div>}
      <div className="rubrics-container">
        {isLoading ? (
          <div className="loading-message">
            <p>Cargando información, espere un momento por favor...</p>
            <img src={loadingGif} alt="Cargando" className="loading-gif" />
          </div>
        ) : rubrics.length > 0 ? (
          rubrics.map((rubric, index) => (
            <div key={index} className="rubric-item">
              <div className="rubric-info">
                <div className="rubric-title">{rubric.titulo}</div>
                <div className="rubric-author">Autor: {rubric.autor}</div>
              </div>
              <div className="rubric-icons">
                <FaSearch className="icon" onClick={() => handleMagicSearch(rubric)} />
                <FaPen className="icon" onClick={() => handleEdit(rubric)} />
                <FaChartBar className="icon" />
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={rubric.publica}
                    onChange={() => togglePublicStatus(rubric)}
                  />
                  <span className="slider round"></span>
                </label>
                <FaTrash className="icon" onClick={() => handleDelete(rubric)} />
              </div>
            </div>
          ))
        ) : (
          <p>No hay rúbricas disponibles.</p>
        )}
      </div>

      {confirmDelete && (
        <div className="modal-overlay">
            <div className="modal-content">
            <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
                ¿Está seguro de borrar esta rúbrica: {confirmDelete.titulo}?
            </p>
            <p style={{textAlign: 'center', marginTop: '10px' }}>
                Advertencia: Esta acción es irreversible
            </p>
            <div className="confirmation-buttons">
                <button className="confirm-yes" onClick={confirmDeleteRubric}>Sí</button>
                <button className="confirm-no" onClick={() => setConfirmDelete(null)}>No</button>
            </div>
            </div>
        </div>
        )}


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

export default ShowAvailableRubrics;
