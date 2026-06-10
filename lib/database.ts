import * as SQLite from 'expo-sqlite';

// Abrimos (o creamos) la base de datos local llamada "stock.db"
export const getDB = async () => {
  return await SQLite.openDatabaseAsync('stock.db');
};

// Función para crear las tablas si no existen + migraciones seguras
export const initializeDatabase = async () => {
  const db = await getDB();

  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serie TEXT UNIQUE NOT NULL,
      modelo TEXT NOT NULL,
      estado TEXT NOT NULL,
      contador_entrada INTEGER NOT NULL,
      contador_salida INTEGER NOT NULL,
      lugar_origen_id INTEGER,
      lugar_destino_id INTEGER,
      fecha_entrada TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS perfiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'changeme',
      rol TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS equipment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL,
      previous_location TEXT,
      new_location TEXT NOT NULL,
      previous_counter INTEGER,
      new_counter INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (equipment_id) REFERENCES equipos(id) ON DELETE CASCADE
    );

      CREATE INDEX IF NOT EXISTS idx_logs_equipment ON equipment_logs(equipment_id);
      CREATE INDEX IF NOT EXISTS idx_logs_created ON equipment_logs(created_at DESC);    
  `);

  // Migraciones seguras: agregan columnas si la BD ya existía sin ellas
  try {
    await db.execAsync(`ALTER TABLE equipos ADD COLUMN lugar_destino_id INTEGER;`);
  } catch (_) {
    // La columna ya existe, ignoramos el error
  }

  try {
    await db.execAsync(`ALTER TABLE perfiles ADD COLUMN password TEXT NOT NULL DEFAULT 'changeme';`);
  } catch (_) {
    // La columna ya existe, ignoramos el error
  }

  // Insertamos el admin por defecto si no existe
  await db.runAsync(
    `INSERT OR IGNORE INTO perfiles (email, password, rol) VALUES (?, ?, ?);`,
    ['admin@stock.com', 'admin123', 'admin']
  );

  console.log("¡Base de datos SQLite inicializada correctamente!");
};
