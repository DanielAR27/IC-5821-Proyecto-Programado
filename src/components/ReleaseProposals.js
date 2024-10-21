import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar'; // Usa el mismo navbar
import './ReleaseProposals.css'; // Estilos para esta página
import { FaPaperPlane, FaTrash } from 'react-icons/fa'; // Importamos los íconos
import loadingGif from './loading_image.gif'; 

function ReleaseProposals() {
  const [associations, setAssociations] = useState([]); // Estado para las asociaciones
  const [loading, setLoading] = useState(true); // Para manejar la carga
  const location = useLocation();
  const roles = location.state?.roles || [];
  const adminId = location.state?.userId;

  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        // Simulamos un retraso de 3 segundos antes de obtener los datos
        setTimeout(async () => {
          const response = await fetch('http://localhost:5000/get_associations'); // Cambiamos la ruta para usar el nuevo endpoint
          const data = await response.json();
          setAssociations(data); // Almacenamos las asociaciones en el estado
          setLoading(false); // Quitamos el estado de carga
        }, 3000); // 3 segundos de espera
      } catch (error) {
        console.error('Error al cargar las asociaciones:', error);
        setLoading(false); // Asegúrate de manejar el error y dejar de cargar
      }
    };

    fetchAssociations(); // Llamamos a la función cuando se monta el componente
  }, []);

  
  return (
    <div className="release-proposals-wrapper">
      <Navbar roles={roles} userId={adminId} /> {/* Navbar */}

      <div className="rubrics-container"> {/* Recuadro gris */}

        {loading ? (
          <div className="loading-message">
          <p>Cargando información, espere un momento por favor...</p>
          <img src={loadingGif} alt="Cargando" className="loading-gif" />
        </div>
        ) : associations.length > 0 ? (
          <table className="associations-table">
            <thead>
              <tr>
                <th>Nombre de Rúbrica</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th> {/* Columna para los íconos */}
              </tr>
            </thead>
            <tbody>
              {associations.map((association) => (
                <tr key={association.asociacion_id}>
                  <td>{association.nombre_rubrica}</td>
                  <td>{association.tipo}</td>
                  <td>{new Date(association.fecha).toLocaleDateString()}</td>
                  <td>{association.estado}</td>
                  <td>
                    <FaPaperPlane className="icon-action" title="Liberar Propuesta" />
                    <FaTrash className="icon-action" title="Borrar Propuesta" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay asociaciones para mostrar.</p>
        )}
      </div>
    </div>
  );
}

export default ReleaseProposals;
