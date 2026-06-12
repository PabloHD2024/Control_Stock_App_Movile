import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('stock.db');
  return dbInstance;
};

export const initializeDatabase = async () => {
  const db = await getDB();

  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serie TEXT UNIQUE NOT NULL,
      modelo TEXT NOT NULL,
      estado TEXT NOT NULL,
      contador_entrada INTEGER NOT NULL,
      contador_salida INTEGER NOT NULL DEFAULT 0,
      lugar_origen_id INTEGER,
      lugar_destino_id INTEGER,
      fecha_entrada TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS perfiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'changeme',
      rol TEXT NOT NULL
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      email TEXT
    );
  `);

  // equipment_logs ahora incluye usuario_email para rastrear quién hizo cada movimiento
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS equipment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL,
      usuario_email TEXT,
      previous_location TEXT,
      new_location TEXT NOT NULL,
      previous_counter INTEGER,
      new_counter INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (equipment_id) REFERENCES equipos(id) ON DELETE CASCADE
    );
  `);

  // Migración: agregar columna usuario_email si no existe (bases ya creadas)
  try {
    await db.execAsync(`ALTER TABLE equipment_logs ADD COLUMN usuario_email TEXT;`);
  } catch (_) {}

  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_logs_equipment ON equipment_logs(equipment_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_logs_created ON equipment_logs(created_at DESC);`);

  // Migración de password por si la tabla ya existía sin esa columna
  try {
    await db.execAsync(`ALTER TABLE perfiles ADD COLUMN password TEXT NOT NULL DEFAULT 'changeme';`);
  } catch (_) {}

  // Depósito propio siempre presente con ID 1
  await db.runAsync(
    `INSERT OR IGNORE INTO clientes (id, nombre, direccion, telefono) VALUES (?, ?, ?, ?);`,
    [1, 'Depósito Propio', 'Casa central', '-']
  );

  // Admin principal siempre presente
  await db.runAsync(
    `INSERT OR IGNORE INTO perfiles (email, password, rol) VALUES (?, ?, ?);`,
    ['admin@stock.com', 'admin123', 'admin']
  );

  console.log('Base de datos SQLite inicializada correctamente.');
};

/**
 * Si la base de datos ya tiene datos, este seed no hará nada. Solo inserta datos de ejemplo la primera vez que se ejecuta.
 */
export const seedDatabase = async () => {
  const db = await getDB();

  // Crear tabla de control si no existe
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Verificar si el seed ya se ejecutó
  const seedDone = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_config WHERE key = 'seed_done'`
  );

  if (seedDone?.value === '1') {
    console.log('Seed ya ejecutado anteriormente. Omitiendo.');
    return;
  }

  // --- Insertar datos de ejemplo solo la primera vez ---

  const usuarios = [
    ['carlos.garcia@empresa.com', 'pass1234', 'user'],
    ['maria.lopez@empresa.com', 'pass1234', 'user'],
    ['jorge.admin@empresa.com', 'admin456', 'admin'],
  ];
  for (const u of usuarios) {
    await db.runAsync(`INSERT OR IGNORE INTO perfiles (email, password, rol) VALUES (?, ?, ?);`, u);
  }

  const clientes = [
    ['Empresa ABC S.A.', 'Av. Corrientes 1234, CABA', '011-4444-1234', 'contacto@abc.com'],
    ['Distribuidora XYZ', 'San Martín 567, La Plata', '0221-555-9876', 'info@xyz.com'],
    ['Comercial Norte', 'Belgrano 890, Mar del Plata', '0223-444-5678', 'norte@comercial.com'],
    ['Estudio Jurídico Pérez', 'Florida 321, CABA', '011-5555-4321', 'perez@estudio.com'],
    ['Clínica San Lucas', 'Mitre 1100, Quilmes', '011-4253-7890', 'admin@sanlucas.com'],
  ];
  for (const c of clientes) {
    await db.runAsync(
      `INSERT OR IGNORE INTO clientes (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?);`,
      c
    );
  }

  const fecha = new Date().toISOString();
  const equipos = [
    ['SN-RICOH-001', 'Ricoh Aficio MP 301', 'Disponible', 12500, 0, fecha],
    ['SN-BROTHER-002', 'Brother DCP-L2540DW', 'Activo', 8300, 8300, fecha],
    ['SN-HP-003', 'HP LaserJet M404dn', 'En reparación', 45200, 45200, fecha],
    ['SN-CANON-004', 'Canon imageRUNNER 2425', 'Disponible', 3100, 0, fecha],
    ['SN-EPSON-005', 'Epson EcoTank L3250', 'Activo', 21000, 21000, fecha],
    ['SN-XEROX-006', 'Xerox WorkCentre 3335', 'Disponible', 0, 0, fecha],
    ['SN-KYOCERA-007', 'Kyocera ECOSYS M2040dn', 'Activo', 67800, 67800, fecha],
    ['SN-RICOH-008', 'Ricoh MP C3004', 'Disponible', 5400, 0, fecha],
  ];
  for (const e of equipos) {
    await db.runAsync(
      `INSERT OR IGNORE INTO equipos (serie, modelo, estado, contador_entrada, contador_salida, fecha_entrada) VALUES (?, ?, ?, ?, ?, ?);`,
      e
    );
  }

  // Marcar seed como ejecutado
  await db.runAsync(
    `INSERT OR REPLACE INTO app_config (key, value) VALUES ('seed_done', '1');`
  );

  console.log('Datos de ejemplo insertados (primera ejecución).');
};
