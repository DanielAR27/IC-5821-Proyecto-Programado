import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Para obtener el ID de la rúbrica desde la URL
import './ModifyRubric.css'; // Puedes usar el mismo CSS de CreateRubric
import Navbar from './Navbar';

function ModifyRubric() {
  const location = useLocation();
  const roles = location.state?.roles || [];
  const creadorId = location.state?.userId;
  const { id } = useParams(); // Obtén el id de la rúbrica desde la URL
  const [formData, setFormData] = useState(null); // Inicializa formData como null
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  console.log("Su rubrica corresponde a : ", id);
  // Carga los datos de la rúbrica al montar el componente
  useEffect(() => {
    const fetchRubric = async () => {
      try {
        const response = await fetch(`http://localhost:5000/rubricas/basic/${id}`);
        const data = await response.json();
  
        if (data.fechacreacion) {
          data.fechacreacion = new Date(data.fechacreacion).toISOString().split('T')[0];
        }
    
        setFormData(data); // Actualiza formData con los datos de la rúbrica
      } catch (error) {
        console.error('Error al cargar la rúbrica:', error);
      }
    };
  
    fetchRubric();
  }, [id]);
  

  useEffect(() => {
    if (formData) {
      // Valida solo los campos que deben ser validados como strings
      const allFieldsFilled = ['autor', 'titulo', 'descripcion', 'areageneral', 'areaespecifica', 'aspectoevaluar']
        .every(field => formData[field] && formData[field].trim() !== '');
      
      // Asegúrate de que la fecha esté seleccionada y no vacía
      const isDateValid = formData.fechacreacion && formData.fechacreacion !== '';
  
      // Si todos los campos están llenos y la fecha es válida, habilita el botón
      setIsButtonDisabled(!(allFieldsFilled && isDateValid));
    }
  }, [formData]);
  
  
    // Función para manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
      
        setFormData((prevData) => ({
          ...prevData,
          [name]: value, // Asegúrate de que el 'name' sea correcto y actualiza el campo
        }));
      };
      

  const handleSubmit = () => {
    // Aquí puedes agregar la lógica para enviar los datos actualizados al servidor
  };

  if (!formData) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras los datos se están obteniendo
  }

  console.log("roles: ", roles);
  console.log("usuario: ", creadorId);
  return (
    <div className="create-rubric-wrapper">
      <Navbar roles={roles} userId={creadorId}/>
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
                name="fechacreacion" // Asegúrate de que el nombre coincida con el campo en formData
                value={formData.fechacreacion} // Si es undefined o null, poner un string vacío
                onChange={handleChange} // Asegúrate de usar la función correcta para manejar cambios
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
                name="areageneral" // El 'name' debe coincidir con la clave en formData
                value={formData.areageneral} // Asegúrate de que el valor venga de formData
                onChange={handleChange} // Asocia correctamente la función de cambio
                placeholder="Ingresa el área general"
            />
        </div>

          <div className="form-group">
            <label>Área Específica:</label>
            <select
              name="areaespecifica"
              value={formData.areaespecifica}
              onChange={handleChange}
            >
              <option value="opción #1">opción #1</option>
              <option value="opción #2">opción #2</option>
            </select>
          </div>
          <div className="form-group">
            <label>Aspecto a Evaluar:</label>
            <select
              name="aspectoevaluar"
              value={formData.aspectoevaluar}
              onChange={handleChange}
            >
              <option value="opción #1">opción #1</option>
              <option value="opción #2">opción #2</option>
            </select>
          </div>
        </form>

        <button
          type="button"
          onClick={handleSubmit}
          className={`next-button ${isButtonDisabled ? 'disabled' : ''}`}
          disabled={isButtonDisabled}
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

export default ModifyRubric;
