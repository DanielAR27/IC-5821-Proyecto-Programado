const express = require('express');
const pool = require('./config/db'); // Importar la conexión a la base de datos
const cors = require('cors');

const app = express();

// Middleware para habilitar CORS y analizar JSON
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend
app.use(express.json()); // Analiza las solicitudes JSON

// Ruta para crear una rúbrica
app.post('/rubricas/crear', async (req, res) => {
  const { titulo, descripcion, cantidad_criterios, cantidad_columnas, creador_id, publica, fecha_creacion, autor, area_general, area_especifica, aspecto_evaluar, tipo_proyecto_id } = req.body;

  // Validar que todos los campos obligatorios estén presentes
  if (!titulo || !descripcion || !cantidad_criterios || !cantidad_columnas || !creador_id || !tipo_proyecto_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // Intentar guardar la rúbrica en la base de datos
    const result = await pool.query(
      `INSERT INTO Rubricas (Titulo, Descripcion, Cantidad_Criterios, Cantidad_Columnas, CreadorID, Publica, FechaCreacion, Autor, AreaGeneral, AreaEspecifica, AspectoEvaluar, TipoProyectoID)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11) RETURNING *`,
      [titulo, descripcion, cantidad_criterios, cantidad_columnas, creador_id, publica || false, autor, area_general, area_especifica, aspecto_evaluar, tipo_proyecto_id]
    );
    
    // Devolver la rúbrica recién creada
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear la rúbrica:', error);
    res.status(500).json({ error: 'Hubo un error al crear la rúbrica.' });
  }
});

// Iniciar el servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
