import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './EvaluateRubric.css'; // Usando el mismo estilo que EvaluateRubric

function EvaluateRubric() {
  const { id } = useParams(); // Obteniendo el id de la URL
  const [rubricData, setRubricData] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({}); // Estado para almacenar las selecciones

  useEffect(() => {
    // Obtener los datos de la rúbrica desde la API
    const fetchRubric = async () => {
      try {
        const response = await fetch(`http://localhost:5000/rubricas/${id}`);
        const data = await response.json();
        setRubricData(data);
      } catch (error) {
        console.error('Error al cargar la rúbrica:', error);
      }
    };

    fetchRubric();
  }, [id]);

  // Manejador para cambiar la selección
  const handleOptionSelect = (subcriterioId, columnaIndex) => {
    setSelectedOptions(prev => ({
      ...prev,
      [subcriterioId]: columnaIndex, // Solo permite seleccionar una opción por subcriterio
    }));
  };

  const handleSubmit = () => {
    console.log('Evaluación enviada:', selectedOptions);
  };

  if (!rubricData) {
    return <div>Cargando rúbrica...</div>;
  }

  return (
    <div className="evaluate-rubric-container">
      <h2>{rubricData.titulo || 'Sin título'}</h2>
      <p>{rubricData.descripcion || 'Sin descripción'}</p>

      {rubricData.criterios && rubricData.criterios.length > 0 ? (
        rubricData.criterios.map((criterio, criterioIndex) => (
          <div key={criterioIndex} className="criterion-container">
            <h3>{criterio.nombrecriterio || `Criterio ${criterioIndex + 1}`}</h3>
            <table className="rubric-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  {/* Encabezados fijos para las columnas */}
                  {Array.from({ length: rubricData.cantidad_columnas || 0 }).map((_, index) => (
                    <th key={index}>{index} PTOS</th>
                  ))}
                  <th>Peso (%)</th>
                </tr>
              </thead>
              <tbody>
                {criterio.subcriterios && criterio.subcriterios.length > 0 ? (
                  criterio.subcriterios.map((subcriterio, subcriterioIndex) => (
                    <tr key={subcriterioIndex}>
                      <td>{subcriterio.descripcion || 'Sin descripción'}</td>
                      {subcriterio.columnas && subcriterio.columnas.length > 0 ? (
                        subcriterio.columnas.map((columna, columnaIndex) => (
                          <td
                            key={columnaIndex}
                            className={`selectable-cell ${
                              selectedOptions[subcriterio.subcriterioid] === columnaIndex ? 'selected' : ''
                            }`}
                            onClick={() => handleOptionSelect(subcriterio.subcriterioid, columnaIndex)}
                          >
                            {columna.textocolumna || 'Sin texto'}
                          </td>
                        ))
                      ) : (
                        <td colSpan={rubricData.cantidad_columnas}>Sin columnas</td>
                      )}
                      <td>{subcriterio.porcentaje || 0}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={rubricData.cantidad_columnas + 2}>No hay subcriterios definidos</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No hay criterios disponibles.</p>
      )}

      <button className="submit-button" onClick={handleSubmit}>
        Aceptar
      </button>
    </div>
  );
}

export default EvaluateRubric;
