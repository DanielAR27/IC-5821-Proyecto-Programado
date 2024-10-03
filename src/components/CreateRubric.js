// src/components/CreateRubric.js
import React, { useState, useEffect} from 'react';
import './CreateRubric.css'; // Asegúrate de incluir todos los estilos combinados
import { useNavigate } from 'react-router-dom'; // Asegúrate de tener react-router-dom instalado

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

  // Estado para controlar la visualización del formulario o de la Matriz
  const [showMatrix, setShowMatrix] = useState(false); // Definir el estado para mostrar la matriz


  // Estado para controlar si el botón debe estar deshabilitado
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Validar si todos los campos están llenos
  useEffect(() => {
    const allFieldsFilled = Object.values(formData).every(field => field.trim() !== '');
    setIsButtonDisabled(!allFieldsFilled);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    console.log('Datos del formulario:', formData);
    // Solo continuar si no está deshabilitado
    if (!isButtonDisabled) {
      setShowMatrix(true); // Mostrar la Matriz
    }
  };

  return (
    <div className="create-rubric-wrapper">
      {/* Encabezado que abarca todo el ancho */}
      <div className="header">Rubrics App</div>

      {!showMatrix ? (
        <div className="create-rubric-container">
          {/* Formulario */}
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

          {/* Botón "Siguiente" ubicado debajo del formulario */}
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
  // Estados existentes
  const [numColumns, setNumColumns] = useState(0);
  const [numCriteria, setNumCriteria] = useState(0);
  const [currentCriterion, setCurrentCriterion] = useState(0);
  const [criteria, setCriteria] = useState([]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Nuevo estado para manejar la previsualización
  const [isPreview, setIsPreview] = useState(false);

  // Nuevo estado para mensajes de advertencia
  const [warningMessage, setWarningMessage] = useState('');

  const navigate = useNavigate(); // Hook para navegación

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

  const addRow = () => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[currentCriterion]) {
      updatedCriteria[currentCriterion].rows.push(Array(numColumns + 1).fill(''));
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

  // Función para cambiar a modo previsualización
  const previewRubric = () => {
    setIsPreview(true);
    setWarningMessage(''); // Limpiar mensajes previos
  };

  // Función para regresar al modo de edición desde la previsualización
  const backToEdit = () => {
    setIsPreview(false);
  };

  // Función para guardar la rúbrica
  const saveRubric = () => {
    // Validación: Verificar que cada criterio tenga al menos una fila
    const hasEmptyRows = criteria.some(criterion => criterion.rows.length === 0);
    if (hasEmptyRows) {
      setWarningMessage("Advertencia: Debe tener al menos una fila para cada criterio.");
      return;
    }

    // Validación: Verificar que todas las columnas de cada fila tengan texto
    const hasEmptyCells = criteria.some(criterion =>
      criterion.rows.some(row => row.some(cell => cell.trim() === ''))
    );
    if (hasEmptyCells) {
      setWarningMessage("Advertencia: Todas las columnas de cada fila deben contener texto.");
      return;
    }

    // Confirmación
    const confirmSave = window.confirm("¿Está seguro de que desea guardar la rúbrica?");
    if (confirmSave) {
      // Aquí puedes agregar la lógica para guardar la rúbrica en tu backend
      // Por ahora, simplemente redirige a /rubrics/create con el mensaje de éxito
      navigate('/rubrics/create', { state: { successMessage: "¡Se ha guardado la rúbrica!" } });
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
    setWarningMessage(''); // Limpiar mensajes
  };

  return (
    <div className="matrix-container">

      <h2>Matriz de Evaluación</h2>

      {!setupComplete ? (
        // Vista de configuración inicial
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
          {/* Botón "Regresar" añadido aquí */}
          <button onClick={onReturnToForm} className="reset-button">Regresar</button>
        </div>
      ) : isPreview ? (
        // Vista de previsualización
        <div className="preview-section">
          {/* Mostrar mensaje de advertencia si existe */}
          {warningMessage && (
            <div className="warning-message">
              {warningMessage}
            </div>
          )}

          <PreviewRubric criteria={criteria} numColumns={numColumns} />

          <div className="preview-buttons">
            <button onClick={backToEdit} className="edit-button">Regresar a edición</button>
            <button onClick={saveRubric} className="save-button">Guardar</button>
          </div>
        </div>
      ) : criteria[currentCriterion] ? (
        // Vista de edición de criterios
        <div className="criterion-section">
          <div className="criterion-container">
            {/* Título "Criterio #" */}
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
          {/* Botón "Regresar al paso inicial" debajo del cuadro blanco */}
          <button onClick={resetSetup} className="reset-button">Regresar al paso inicial</button>
        </div>
      ) : null}
    </div>
  );
}

// Componente para una fila de la tabla
function RubricRow({ rowIndex, row, numColumns, handleDescriptionChange, setSelectedRow, selectedRow }) {
  const handleChange = (columnIndex, value) => {
    handleDescriptionChange(rowIndex, columnIndex, value);
  };

  return (
    <tr
      onClick={() => setSelectedRow(rowIndex)}
      className={selectedRow === rowIndex ? 'selected-row' : ''}
    >
      <td>
        <textarea
          placeholder="Descripción del criterio"
          value={row[0]}
          onChange={(e) => handleChange(0, e.target.value)}
          className="text-box large-text-box"
        />
      </td>
      {row.slice(1).map((cell, columnIndex) => (
        <td key={columnIndex}>
          <textarea
            placeholder={`${columnIndex + 1} PTOS`}
            value={cell}
            onChange={(e) => handleChange(columnIndex + 1, e.target.value)}
            className="text-box large-text-box"
          />
        </td>
      ))}
    </tr>
  );
}

// Componente para la vista de previsualización
function PreviewRubric({ criteria, numColumns }) {
  return (
    <div className="preview-container">
      {criteria.map((criterion, criterionIndex) => (
        <div key={criterionIndex} className="preview-criterion">
          {/* Muestra "Criterio #: [Nombre]" */}
          <h3>Criterio {criterionIndex + 1}: {criterion.name || 'Sin nombre'}</h3>
          <table className="preview-table">
            <thead>
              <tr>
                <th>Descripción</th>
                {Array.from({ length: numColumns }, (_, i) => (
                  <th key={i}>{i + 1} PTOS</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criterion.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>{row[0]}</td>
                  {row.slice(1).map((cell, colIndex) => (
                    <td key={colIndex}>{cell}</td>
                  ))}
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
