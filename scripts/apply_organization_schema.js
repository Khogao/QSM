/**
 * Apply Organization Schema to Database
 * 
 * This script applies the organization schema (document_summaries, 
 * document_clusters, etc.) to the existing QSM database.
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Database path (AppData for Electron app)
const appDataPath = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const DB_PATH = path.join(appDataPath, 'qsm', 'data', 'archi-query.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema_organization.sql');

console.log('📦 QSM Organization Schema Applier');
console.log('='.repeat(50));
console.log(`Database: ${DB_PATH}`);
console.log(`Schema: ${SCHEMA_PATH}`);

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  console.log(`📁 Creating database directory: ${dbDir}`);
  fs.mkdirSync(dbDir, { recursive: true });
}

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`❌ Schema file not found: ${SCHEMA_PATH}`);
  process.exit(1);
}

// Read schema SQL
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Remove comments and clean up
const cleanedSql = schemaSql
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
  .join('\n');

console.log(`\n📄 Executing full schema as single transaction\n`);

// Connect to database (creates if not exists)
let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  console.log('✅ Connected to database');
} catch (err) {
  console.error('❌ Failed to connect to database:', err.message);
  process.exit(1);
}

// Apply schema (execute as single transaction)
console.log('🚀 Applying schema...\n');

try {
  db.exec(cleanedSql);
  console.log('✅ Schema applied successfully!');
} catch (err) {
  console.error('❌ Failed to apply schema:', err.message);
  console.error('First 100 chars of error:', err.stack.substring(0, 100));
  
  // Try to provide more context
  if (err.message.includes('no such table')) {
    console.error('\n💡 Hint: Tables might not exist yet. Make sure main documents table exists.');
  }
}

console.log('\n' + '='.repeat(50));

// Verify tables created
try {
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'document_%' OR name LIKE 'folder_%' OR name LIKE 'organization_%')"
  ).all();
  
  console.log('\n📋 Organization Tables Created:');
  tables.forEach(row => {
    console.log(`  ✓ ${row.name}`);
  });
  
  // Verify views
  const views = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='view' AND name LIKE 'v_%'"
  ).all();
  
  console.log('\n👁️  Views Created:');
  views.forEach(row => {
    console.log(`  ✓ ${row.name}`);
  });
  
  // Verify triggers
  const triggers = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='trigger'"
  ).all();
  
  console.log('\n⚡ Triggers Created:');
  triggers.forEach(row => {
    console.log(`  ✓ ${row.name}`);
  });
} catch (err) {
  console.error('❌ Failed to verify objects:', err.message);
}

// Close database
db.close();
console.log('\n✅ Database closed successfully');
