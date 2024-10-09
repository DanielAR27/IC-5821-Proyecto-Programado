const express = require('express');
const pool = require('./config/db'); // Importar la conexión a la base de datos
const bcrypt = require('bcrypt');
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

// Ruta para obtener las rúbricas públicas
app.get('/rubricas/publicas', async (req, res) => {
  try {
    const result = await pool.query('SELECT RubricaID, Titulo, Autor FROM Rubricas WHERE Publica = true');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las rúbricas públicas:', error);
    res.status(500).json({ error: 'Error al obtener las rúbricas públicas.' });
  }
});

// Ruta para obtener las rúbricas creadas por un usuario específico
app.get('/rubricas/creadas/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Asegúrate de que la consulta sea correcta y devuelva las rúbricas creadas por el usuario
    const result = await pool.query(
      'SELECT RubricaID, Titulo, Autor FROM Rubricas WHERE CreadorID = $1',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener las rúbricas creadas:', error);
    res.status(500).json({ error: 'Error al obtener las rúbricas creadas.' });
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

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;

  try {
    // Verificar si el correo ya existe
    const existingUser = await pool.query('SELECT * FROM Usuarios WHERE Correo = $1', [correo]);
    
    if (existingUser.rows.length > 0) {
      // El correo ya existe, enviar mensaje de error
      return res.status(400).json({ error: 'El correo ya se encuentra asociado a una cuenta.' });
    }

    // Encriptar la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    // Insertar el nuevo usuario
    const result = await pool.query(
      'INSERT INTO Usuarios (Nombre, Apellido, Correo, Contraseña) VALUES ($1, $2, $3, $4) RETURNING UsuarioID',
      [nombre, apellido, correo, hashedPassword]
    );

    const userId = result.rows[0].usuarioid;

    // Asignar el rol de 'Consultor' por defecto (TipoUsuarioID = 1)
    await pool.query('INSERT INTO RolesAsignados (UsuarioID, TipoUsuarioID) VALUES ($1, 1)', [userId]);

    // Enviar respuesta de éxito
    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Hubo un problema al registrar el usuario' });
  }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  try {
    // 1. Buscar el usuario por correo
    const result = await pool.query('SELECT * FROM Usuarios WHERE Correo = $1', [correo]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Intente de nuevo.' });
    }

    const user = result.rows[0];

    // 2. Verificar la contraseña desencriptada usando bcrypt
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Intente de nuevo.' });
    }

    // 3. Si la contraseña es válida, iniciar sesión exitosamente
    res.status(200).json({ message: 'Inicio de sesión exitoso', usuarioId: user.usuarioid });
    
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Hubo un error en el servidor.' });
  }
});

app.get('/roles/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const rolesResult = await pool.query(
      `SELECT tu.nombretipo 
       FROM RolesAsignados ra 
       JOIN TiposUsuario tu ON ra.tipousuarioid = tu.tipousuarioid 
       WHERE ra.usuarioid = $1`, 
      [userId]
    );

    const roles = rolesResult.rows.map(row => row.nombretipo);
    
    res.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
});



// Iniciar el servidor en el puerto 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
