import React, { useState, useEffect } from 'react';
import './CreateRubric.css';

/*TODO: Queda por modificar 
1) El creador debe seleccionar el tipo de propuesta para la rúbrica?
o eso debería hacerlo manualmente el administrador?
2) El id_creador debe estar dado por el login actual del creador.
*/

function CreateRubric() {
  const [formData, setFormData] = useState({
    autor: '',
    fecha: '',
    titulo: '',
    descripcion: '',
    areaGeneral: '',
    areaEspecifica: 'opción #1',
    aspectoEvaluar: 'opción #1',
  });

  const [showMatrix, setShowMatrix] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    const allFieldsFilled = Object.values(formData).every(field => field.trim() !== '');
    setIsButtonDisabled(!allFieldsFilled);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    if (!isButtonDisabled) {
      setShowMatrix(true);
    }
  };

  return (
    <div className="create-rubric-wrapper">
      <div className="header">Rubrics App</div>

      {!showMatrix ? (
        <div className="create-rubric-container">
          <form className="rubric-form">
            {/* Campos del formulario */}
            <div className="form-group">
              <label>Autor:</label>
              <input
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                placeholder="Ingresa el nombre del autor"
              />
            </div>
            <div className="form-group">
              <label>Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Título:</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ingresa el título"
              />
            </div>
            <div className="form-group">
              <label>Descripción:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Ingresa una descripción"
              ></textarea>
            </div>
            <div className="form-group">
              <label>Área General:</label>
              <input
                type="text"
                name="areaGeneral"
                value={formData.areaGeneral}
                onChange={handleChange}
                placeholder="Ingresa el área general"
              />
            </div>
            <div className="form-group">
              <label>Área Específica:</label>
              <select
                name="areaEspecifica"
                value={formData.areaEspecifica}
                onChange={handleChange}
              >
                <option value="opción #1">opción #1</option>
                <option value="opción #2">opción #2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Aspecto a Evaluar:</label>
              <select
                name="aspectoEvaluar"
                value={formData.aspectoEvaluar}
                onChange={handleChange}
              >
                <option value="opción #1">opción #1</option>
                <option value="opción #2">opción #2</option>
              </select>
            </div>
          </form>

          <button
            type="button"
            onClick={handleNext}
            className={`next-button ${isButtonDisabled ? 'disabled' : ''}`}
            disabled={isButtonDisabled}
          >
            Siguiente
          </button>
        </div>
      ) : (
        <Matrix formData={formData} />
      )}
    </div>
  );
}

function Matrix({ formData, onReturnToForm }) {
  const [numColumns, setNumColumns] = useState(0);
  const [numCriteria, setNumCriteria] = useState(0);
  const [currentCriterion, setCurrentCriterion] = useState(0);
  const [criteria, setCriteria] = useState([]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isPreview, setIsPreview] = useState(false);
  const [warningMessage, setWarningMessage] = useState(''); // Ya usado

  const handleStart = () => {
    if (numColumns > 0 && numCriteria > 0) {
      const initialCriteria = Array.from({ length: numCriteria }, () => ({
        name: '',
        rows: []
      }));
      setCriteria(initialCriteria);
      setSetupComplete(true);
      setCurrentCriterion(0);
    }
  };

  // El resto del código sigue igual...
  
  const addRow = () => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[currentCriterion]) {
      const newRow = {
        descripcion: '',
        weight: 0,
        ...Array.from({ length: numColumns }).reduce((acc, _, i) => {
          acc[`puntaje_${i}`] = '';
          return acc;
        }, {})
      };
      updatedCriteria[currentCriterion].rows.push(newRow);
      setCriteria(updatedCriteria);
    }
  };

  const deleteRow = () => {
    if (selectedRow !== null) {
      const updatedCriteria = [...criteria];
      if (updatedCriteria[currentCriterion]) {
        updatedCriteria[currentCriterion].rows.splice(selectedRow, 1);
        setCriteria(updatedCriteria);
        setSelectedRow(null);
      }
    }
  };

  const handleDescriptionChange = (rowIndex, columnIndex, value) => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[currentCriterion]) {
      updatedCriteria[currentCriterion].rows[rowIndex][columnIndex] = value;
      setCriteria(updatedCriteria);
    }
  };

  const handleCriterionNameChange = (value) => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[currentCriterion]) {
      updatedCriteria[currentCriterion].name = value;
      setCriteria(updatedCriteria);
    }
  };

  const nextCriterion = () => {
    if (currentCriterion < numCriteria - 1) {
      setCurrentCriterion(currentCriterion + 1);
    }
  };

  const prevCriterion = () => {
    if (currentCriterion > 0) {
      setCurrentCriterion(currentCriterion - 1);
    }
  };

  const previewRubric = () => {
    setIsPreview(true);
    setWarningMessage('');
  };

  const backToEdit = () => {
    setIsPreview(false);
    setWarningMessage(''); // Limpiar cualquier mensaje de advertencia
    setSuccessMessage(''); // Limpiar el mensaje de éxito al regresar a edición
  };

  const [successMessage, setSuccessMessage] = useState(''); // Estado para manejar el mensaje de éxito

  const saveRubric = async () => {
    if (!criteria || criteria.length === 0) {
      setWarningMessage("No hay criterios definidos. Por favor, agregue criterios.");
      return;
    }

    // Calcular la suma total de los porcentajes de todas las filas (subcriterios)
    const totalPercentage = criteria.reduce((total, criterion) => {
      return total + criterion.rows.reduce((sum, row) => sum + (row.weight || 0), 0);
    }, 0);

    // Validar que la suma total de los porcentajes sea 100
    if (totalPercentage !== 100) {
      setWarningMessage("La suma total de los porcentajes de los subcriterios debe ser 100%.");
      return;
    }

      // Validar que todas las casillas de las columnas (textoColumna) tengan un valor
    for (const criterion of criteria) {
      for (const row of criterion.rows) {
        for (let indexCol = 0; indexCol < numColumns; indexCol++) {
          if (!row[`puntaje_${indexCol}`] || row[`puntaje_${indexCol}`].trim() === "") {
            setWarningMessage("Todos los campos de las columnas deben estar llenos.");
            return;
          }
        }
      }
    }
    
    const rubricData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      cantidad_criterios: numCriteria,
      cantidad_columnas: numColumns,
      creador_id: 1, // Hardcodeado por ahora
      publica: false,
      fecha_creacion: formData.fecha,
      autor: formData.autor,
      area_general: formData.areaGeneral,
      area_especifica: formData.areaEspecifica,
      aspecto_evaluar: formData.aspectoEvaluar,
      tipo_proyecto_id: 2,
      criterios: criteria.map((criterion, index) => ({
        nombre: criterion.name || `Criterio ${index + 1}`,
        subcriterios: criterion.rows.map((row, indexRow) => ({
          descripcion: row.descripcion || `Subcriterio ${indexRow + 1}`,
          porcentaje: row.weight || 0,
          columnas: Array.from({ length: numColumns }, (_, indexCol) => ({
            textoColumna: row[`puntaje_${indexCol}`] || '' // Las columnas ahora se asocian a cada fila (subcriterio)
          }))
        }))
      }))
    };
  
    try {
      const response = await fetch('http://localhost:5000/rubricas/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rubricData),
      });
  
      if (!response.ok) {
        throw new Error('Error en la solicitud POST');
      }
  
      const data = await response.json();
      console.log("Rubrica guardada:", data);
      setSuccessMessage("¡La rúbrica se ha guardado exitosamente!");
  
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
  
    } catch (error) {
      console.error("Error al guardar la rúbrica:", error);
      if (!warningMessage) {
        setWarningMessage("Hubo un error al guardar la rúbrica.");
      }
    }
  };
  
  const resetSetup = () => {
    setSetupComplete(false);
    setCriteria([]);
    setNumColumns(0);
    setNumCriteria(0);
    setCurrentCriterion(0);
    setSelectedRow(null);
    setIsPreview(false);
    setWarningMessage('');
  };

  return (
    <div className="matrix-container">
      <h2>Matriz de Evaluación</h2>

      {/* Mostrar mensaje de éxito */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Mostrar mensaje de advertencia si es necesario */}
      {warningMessage && (
        <div className="warning-message">
          {warningMessage}
        </div>
      )}

      {!setupComplete ? (
        <div className="setup-box">
          <div className="setup-section">
            <div className="setup-input">
              <label htmlFor="numColumns">Número de columnas: </label>
              <input
                type="number"
                id="numColumns"
                min="1"
                value={numColumns || ''}
                onChange={(e) => setNumColumns(parseInt(e.target.value))}
              />
            </div>
            <div className="setup-input">
              <label htmlFor="numCriteria">Número de criterios: </label>
              <input
                type="number"
                id="numCriteria"
                min="1"
                value={numCriteria || ''}
                onChange={(e) => setNumCriteria(parseInt(e.target.value))}
              />
            </div>
            <button
              className="start-button"
              onClick={handleStart}
              disabled={numColumns <= 0 || numCriteria <= 0}
            >
              Iniciar
            </button>
          </div>
          <button onClick={resetSetup} className="reset-button">Regresar</button>
        </div>
      ) : isPreview ? (
        <div className="preview-section">

          <PreviewRubric criteria={criteria} numColumns={numColumns} />

          <div className="preview-buttons">
            <button onClick={backToEdit} className="edit-button">Regresar a edición</button>
            <button onClick={saveRubric} className="save-button">Guardar</button>
          </div>
        </div>
      ) : criteria[currentCriterion] ? (
        <div className="criterion-section">
          <div className="criterion-container">
            <h3 className="criterion-number">Criterio {currentCriterion + 1}</h3>

            <input
              type="text"
              placeholder="Nombre del criterio"
              value={criteria[currentCriterion].name}
              onChange={(e) => handleCriterionNameChange(e.target.value)}
              className="criterion-name-input"
            />

            <table className="rubric-table">
              <thead>
                <tr>
                  <th>{criteria[currentCriterion].name || 'Criterio'}</th>
                  {Array.from({ length: numColumns }, (_, i) => (
                    <th key={i}>{i + 1} PTOS</th>
                  ))}
                  <th>PESO (%)</th>
                </tr>
              </thead>
              <tbody>
                {criteria[currentCriterion].rows.map((row, rowIndex) => (
                  <RubricRow
                    key={rowIndex}
                    rowIndex={rowIndex}
                    row={row}
                    numColumns={numColumns}
                    handleDescriptionChange={handleDescriptionChange}
                    setSelectedRow={setSelectedRow}
                    selectedRow={selectedRow}
                  />
                ))}
              </tbody>
            </table>

            <div className="add-row-buttons">
              <button onClick={addRow} className="add-button">+</button>
              <button onClick={deleteRow} disabled={selectedRow === null} className="delete-button">x</button>
            </div>

            <div className="navigation-buttons">
              {currentCriterion > 0 && (
                <button onClick={prevCriterion} className="nav-button">Regresar</button>
              )}
              {currentCriterion < numCriteria - 1 ? (
                <button onClick={nextCriterion} className="nav-button">Siguiente</button>
              ) : (
                <button onClick={previewRubric} className="nav-button preview-button">Previsualizar</button>
              )}
            </div>
          </div>
          <button onClick={resetSetup} className="reset-button">Regresar al paso inicial</button>
        </div>
      ) : null}
    </div>
  );
}

function RubricRow({ rowIndex, row, numColumns, handleDescriptionChange, setSelectedRow, selectedRow }) {
  const handleChange = (field, value) => {
    handleDescriptionChange(rowIndex, field, value);
  };

  return (
    <tr
      onClick={() => setSelectedRow(rowIndex)}
      className={selectedRow === rowIndex ? 'selected-row' : ''}
    >
      <td>
        <textarea
          placeholder="Descripción del criterio"
          value={row.descripcion || ''}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          className="text-box large-text-box"
        />
      </td>

      {Array.from({ length: numColumns }).map((_, columnIndex) => (
        <td key={columnIndex}>
          <textarea
            placeholder={`${columnIndex + 1} PTOS`}
            value={row[`puntaje_${columnIndex}`] || ''}
            onChange={(e) => handleChange(`puntaje_${columnIndex}`, e.target.value)}
            className="text-box large-text-box"
          />
        </td>
      ))}

      <td>
        <input
          type="range"
          min="0"
          max="100"
          value={row.weight || 0}
          onChange={(e) => handleChange('weight', e.target.value)}
          className="slider"
        />
        <input
          type="number"
          min="0"
          max="100"
          value={row.weight || 0}
          onChange={(e) => {
            const value = e.target.value;
            if (value >= 0 && value <= 100) {
              handleChange('weight', value);
            }
          }}
          onBlur={(e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 0) value = 0;
            if (value > 100) value = 100;
            handleChange('weight', value);
          }}
          className="percentage-input"
        />%
      </td>

    </tr>
  );
}

function PreviewRubric({ criteria, numColumns }) {
  return (
    <div className="preview-container">
      {criteria.map((criterion, criterionIndex) => (
        <div key={criterionIndex} className="preview-criterion">
          <h3>Criterio {criterionIndex + 1}: {criterion.name || 'Sin nombre'}</h3>
          <table className="preview-table">
            <thead>
              <tr>
                <th>Descripción</th>
                {Array.from({ length: numColumns }, (_, i) => (
                  <th key={i}>{i + 1} PTOS</th>
                ))}
                <th>Peso (%)</th>
              </tr>
            </thead>
            <tbody>
              {criterion.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row.descripcion || 'Sin descripción'}</td>
                  {Array.from({ length: numColumns }).map((_, colIndex) => (
                    <td key={colIndex}>{row[`puntaje_${colIndex}`] || ''}</td>
                  ))}
                  <td>{row.weight || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default CreateRubric;
