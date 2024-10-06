const express = require('express');
const pool = require('./config/db'); // Importar la conexión a la base de datos
const cors = require('cors');

const app = express();

// Middleware para habilitar CORS y analizar JSON
app.use(cors()); // Habilita CORS para permitir solicitudes desde tu frontend
app.use(express.json()); // Analiza las solicitudes JSON

// Ruta para crear una rúbrica con criterios, subcriterios y columnas
app.post('/rubricas/crear', async (req, res) => {
  const {
    titulo, descripcion, cantidad_criterios, cantidad_columnas, creador_id, publica,
    fecha_creacion, autor, area_general, area_especifica, aspecto_evaluar, tipo_proyecto_id,
    criterios
  } = req.body;

  if (!titulo || !descripcion || !cantidad_criterios || !cantidad_columnas || !creador_id || !tipo_proyecto_id) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // 1. Guardar la rúbrica principal
    const resultRubrica = await pool.query(
      `INSERT INTO Rubricas (Titulo, Descripcion, Cantidad_Criterios, Cantidad_Columnas, CreadorID, Publica, FechaCreacion, Autor, AreaGeneral, AreaEspecifica, AspectoEvaluar, TipoProyectoID)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING RubricaID`,
      [titulo, descripcion, cantidad_criterios, cantidad_columnas, creador_id, publica || false, fecha_creacion, autor, area_general, area_especifica, aspecto_evaluar, tipo_proyecto_id]
    );
    const rubricaId = resultRubrica.rows[0].rubricaid;

    // 2. Guardar los criterios
    for (const [indexCriterio, criterio] of criterios.entries()) {
      const resultCriterio = await pool.query(
        `INSERT INTO Criterios (RubricaID, NombreCriterio, Orden) VALUES ($1, $2, $3) RETURNING CriterioID`,
        [rubricaId, criterio.nombre, indexCriterio]
      );
      const criterioId = resultCriterio.rows[0].criterioid;

      // 3. Guardar los subcriterios (filas) de cada criterio
      for (const [indexSubcriterio, subcriterio] of criterio.subcriterios.entries()) {
        const resultSubcriterio = await pool.query(
          `INSERT INTO Subcriterios (CriterioID, Descripcion, Porcentaje, Orden) VALUES ($1, $2, $3, $4) RETURNING SubcriterioID`,
          [criterioId, subcriterio.descripcion, subcriterio.porcentaje, indexSubcriterio]
        );
        const subcriterioId = resultSubcriterio.rows[0].subcriterioid;

        // 4. Guardar las columnas asociadas a cada subcriterio
        for (const [indexColumna, columna] of subcriterio.columnas.entries()) {
          await pool.query(
            `INSERT INTO Columnas (SubcriterioID, TextoColumna, Orden) VALUES ($1, $2, $3)`,
            [subcriterioId, columna.textoColumna, indexColumna]
          );
        }
      }
    }

    // Respuesta exitosa
    res.status(201).json({ message: 'Rúbrica creada exitosamente', rubricaId });

  } catch (error) {
    console.error('Error al crear la rúbrica:', error);
    res.status(500).json({ error: 'Hubo un error al crear la rúbrica.' });
  }
});

// Ruta para obtener una rúbrica por su ID
// Ruta para obtener una rúbrica específica
app.get('/rubricas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener la rúbrica por ID
    const rubricaResult = await pool.query('SELECT * FROM Rubricas WHERE RubricaID = $1', [id]);

    if (rubricaResult.rows.length === 0) {
      return res.status(404).json({ message: 'Rúbrica no encontrada' });
    }

    const rubrica = rubricaResult.rows[0];

    // Obtener los criterios de la rúbrica
    const criteriosResult = await pool.query('SELECT * FROM Criterios WHERE RubricaID = $1', [id]);
    const criterios = criteriosResult.rows;

    console.log(criterios);
    
    for (const criterio of criteriosResult.rows) {
      const subcriteriosResult = await pool.query(
        'SELECT * FROM Subcriterios WHERE CriterioID = $1 ORDER BY Orden',
        [criterio.criterioid]
      );
    
      criterio.subcriterios = subcriteriosResult.rows;
    
      // Paso 3: Consulta las Columnas para cada Subcriterio
      for (const subcriterio of subcriteriosResult.rows) {
        const columnasResult = await pool.query(
          'SELECT * FROM Columnas WHERE SubcriterioID = $1 ORDER BY Orden',
          [subcriterio.subcriterioid]
        );
    
        subcriterio.columnas = columnasResult.rows; // Añade las columnas al subcriterio
      }
    }
    
    // Devolver la rúbrica con sus criterios, subcriterios y columnas
    res.json({ ...rubrica, criterios });
  } catch (error) {
    console.error('Error al obtener la rúbrica:', error);  // Esto imprimirá el error detalladamente
    res.status(500).json({ message: 'Error al obtener la rúbrica' });
  }
});



// Iniciar el servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
