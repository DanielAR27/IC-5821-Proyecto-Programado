import React, { useState, useEffect } from 'react';
import './CreateRubric.css';
import Navbar from './Navbar'; // Importa el Navbar
import { useNavigate } from 'react-router-dom';  // Asegúrate de importar useNavigate
import { useLocation } from 'react-router-dom';

function CreateRubric() {
  const location = useLocation();
  const roles = location.state?.roles || []; // Obtén los roles del estado
  const userId = location.state?.userId;

  const [formData, setFormData] = useState({
    autor: '',
    fecha: '',
    titulo: '',
    descripcion: '',
    areaGeneral: 'VIE',
    areaEspecifica: '',
    aspectoEvaluar: '',
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

  const handleReturnToForm = (returnedFormData) => {
    setFormData(returnedFormData); // Actualiza el formData con el que se regresó
    setShowMatrix(false); // Muestra nuevamente el formulario
  };

  return (
    <div className="create-rubric-wrapper">
      <Navbar roles={roles} userId={userId} /> {/* Agrega el Navbar aquí */}

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
              <select
                name="areaGeneral"
                value= {formData.areaGeneral}
                onChange={handleChange}
              >
                <option value="VIE">VIE</option>
                <option value="FDU">FDU</option>
              </select>
            </div>
            <div className="form-group">
              <label>Área Específica:</label>
              <input
                type="text"
                name="areaEspecifica"
                value={formData.areaEspecifica}
                onChange={handleChange}
                placeholder="Ingresa el area específica"
              />
            </div>
            <div className="form-group">
              <label>Aspecto a Evaluar:</label>
              <input
                type="text"
                name="aspectoEvaluar"
                value={formData.aspectoEvaluar}
                onChange={handleChange}
                placeholder="Ingresa el aspecto a evaluar"
              />
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
        <Matrix formData={formData} onReturnToForm={handleReturnToForm} />
      )}
    </div>
  );
}

function Matrix({ formData, onReturnToForm }) {
  const location = useLocation();
  const creadorId = location.state?.userId;
  const navigate = useNavigate();  // Inicializa useNavigate para redirección

  const [numColumns, setNumColumns] = useState(0);
  const [numCriteria, setNumCriteria] = useState(0);
  const [currentCriterion, setCurrentCriterion] = useState(0);
  const [criteria, setCriteria] = useState([]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false); 
  const [isPreview, setIsPreview] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const handleStart = () => {
    if (numColumns > 0 && numCriteria > 0) {
      const initialCriteria = Array.from({ length: numCriteria }, () => ({
        name: '',
        rows: [],
      }));
      setCriteria(initialCriteria);
      setSetupComplete(true);
      setCurrentCriterion(0);
    }
  };

  const addRow = () => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[currentCriterion]) {
      const newRow = {
        descripcion: '',
        weight: 0,
        ...Array.from({ length: numColumns }).reduce((acc, _, i) => {
          acc[`puntaje_${i}`] = '';
          return acc;
        }, {}),
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
    setWarningMessage('');
  };

  const [successMessage, setSuccessMessage] = useState('');

  const saveRubric = async () => {
    if (!criteria || criteria.length === 0) {
      setWarningMessage('No hay criterios definidos. Por favor, agregue criterios.');
      return;
    }

  // Validación de que cada criterio tiene una descripción
  for (const criterion of criteria) {
    if (!criterion.name || criterion.name.trim() === '') {
      setWarningMessage('Cada criterio debe tener una descripción.');
      return;
    }

    // Validación de que cada subcriterio tiene una descripción y todas las columnas están llenas
    for (const row of criterion.rows) {
      if (!row.descripcion || row.descripcion.trim() === '') {
        setWarningMessage('Cada subcriterio debe tener una descripción.');
        return;
      }
      
      for (let indexCol = 0; indexCol < numColumns; indexCol++) {
        if (!row[`puntaje_${indexCol}`] || row[`puntaje_${indexCol}`].trim() === '') {
          setWarningMessage(`Cada columna debe tener un valor en los subcriterios del criterio ${criterion.name}.`);
          return;
        }
      }
    }
  }

    const totalPercentage = criteria.reduce((total, criterion) => {
      return total + criterion.rows.reduce((sum, row) => sum + (parseFloat(row.weight) || 0), 0);
    }, 0);
    
    console.log(totalPercentage);
    
    if (totalPercentage !== 100) {
      setWarningMessage('La suma total de los porcentajes de los subcriterios debe ser 100%.');
      return;
    }
    

    const rubricData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      cantidad_criterios: numCriteria,
      cantidad_columnas: numColumns,
      creador_id: creadorId,
      publica: false,
      fecha_creacion: formData.fecha,
      autor: formData.autor,
      area_general: formData.areaGeneral,
      area_especifica: formData.areaEspecifica,
      aspecto_evaluar: formData.aspectoEvaluar,
      criterios: criteria.map((criterion, index) => ({
        nombre: criterion.name || `Criterio ${index + 1}`,
        subcriterios: criterion.rows.map((row, indexRow) => ({
          descripcion: row.descripcion || `Subcriterio ${indexRow + 1}`,
          porcentaje: row.weight || 0,
          columnas: Array.from({ length: numColumns }, (_, indexCol) => ({
            textoColumna: row[`puntaje_${indexCol}`] || '',
          })),
        })),
      })),
    };
  
    try {
      setIsSaveDisabled(true);  // Deshabilitar el botón al hacer clic
  
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
  
      await response.json();
      setSuccessMessage('¡La rúbrica se ha guardado exitosamente!');
  
      // Redirigir a la página de rúbricas públicas después de 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/rubrics/show_rubrics', {
          state: {
            roles: location.state?.roles,  // Mantén los roles del usuario
            userId: location.state?.userId  // Mantén el ID del usuario
          },
        });
      }, 3000);
    } catch (error) {
      setWarningMessage('Hubo un error al guardar la rúbrica.');
      setIsSaveDisabled(false);  // Volver a habilitar el botón si hay un error
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

      {successMessage && <div className="success-message">{successMessage}</div>}
      {warningMessage && <div className="warning-message">{warningMessage}</div>}

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
            <button className="start-button" onClick={handleStart} disabled={numColumns <= 0 || numCriteria <= 0}>
              Iniciar
            </button>
          </div>
          <button onClick={() => onReturnToForm(formData)} className="reset-button">
            Regresar
          </button>
        </div>
      ) : isPreview ? (
        <div className="preview-section">
          <PreviewRubric criteria={criteria} numColumns={numColumns} />
          <div className="preview-buttons">
            <button onClick={backToEdit} className="edit-button">
              Regresar a edición
            </button>
            <button onClick={saveRubric} className="save-button" disabled={isSaveDisabled}>
              Guardar
            </button>
          </div>
        </div>
      ) : criteria[currentCriterion] ? (
        <div className="criterion-section">
          <div className="criterion-container">
            <h3 className="criterion-number">Criterio {currentCriterion + 1}</h3>

            <input
              type="text"
              placeholder="Inserte el nombre del criterio"
              value={criteria[currentCriterion].name}
              onChange={(e) => handleCriterionNameChange(e.target.value)}
              className="criterion-name-input"
            />

            <table className="rubric-table">
              <thead>
                <tr>
                  <th>{criteria[currentCriterion].name || 'Criterio'}</th>
                  {Array.from({ length: numColumns }, (_, i) => (
                    <th key={i}>{i} PTOS</th>
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
              <button onClick={addRow} className="add-button">
                +
              </button>
              <button onClick={deleteRow} disabled={selectedRow === null} className="delete-button">
                x
              </button>
            </div>

            <div className="navigation-buttons">
              <button
                onClick={() => {
                  if (currentCriterion === 0) {
                    resetSetup();
                  } else {
                    prevCriterion();
                  }
                }}
                className="nav-button"
              >
                Regresar
              </button>
              {currentCriterion < numCriteria - 1 ? (
                <button onClick={nextCriterion} className="nav-button">
                  Siguiente
                </button>
              ) : (
                <button onClick={previewRubric} className="nav-button preview-button">
                  Previsualizar
                </button>
              )}
            </div>
          </div>
          <button onClick={resetSetup} className="reset-button">
            Regresar al paso inicial
          </button>
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
    <tr onClick={() => setSelectedRow(rowIndex)} className={selectedRow === rowIndex ? 'selected-row' : ''}>
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
            placeholder={`${columnIndex} PTOS`}
            value={row[`puntaje_${columnIndex}`] || ''}
            onChange={(e) => handleChange(`puntaje_${columnIndex}`, e.target.value)}
            className="text-box large-text-box"
          />
        </td>
      ))}

      <td>
        <div>
          <input
            type="range"
            min="0"
            max="100"
            value={row.weight || 0}
            onChange={(e) => handleChange('weight', e.target.value)}
          />
          <input
            type="number"
            min="0"
            max="100"
            value={row.weight || 0}
            onChange={(e) => {
              let value = parseInt(e.target.value);
              if (isNaN(value)) value = 0;
              if (value < 0) value = 0;
              if (value > 100) value = 100;
              handleChange('weight', value);
            }}
            className="percentage-input"
          />
          %
        </div>
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
                  <th key={i}>{i} PTOS</th>
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

export default CreateRubric