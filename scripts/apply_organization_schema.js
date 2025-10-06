/**
 * Apply Organization Schema to Database
 * 
 * This script applies the organization schema (document_summaries, 
 * document_clusters, etc.) to the existing QSM database.
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database path (adjust if needed)
const DB_PATH = path.join(__dirname, '..', 'database', 'qsm.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema_organization.sql');

console.log('📦 QSM Organization Schema Applier');
console.log('='.repeat(50));
console.log(`Database: ${DB_PATH}`);
console.log(`Schema: ${SCHEMA_PATH}`);

// Check if files exist
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Database not found: ${DB_PATH}`);
  process.exit(1);
}

if (!fs.existsSync(SCHEMA_PATH)) {
  console.error(`❌ Schema file not found: ${SCHEMA_PATH}`);
  process.exit(1);
}

// Read schema SQL
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');

// Split SQL into individual statements
const statements = schemaSql
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`\n📄 Found ${statements.length} SQL statements\n`);

// Connect to database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Apply schema statements
let successCount = 0;
let errorCount = 0;

const applyStatement = (index) => {
  if (index >= statements.length) {
    // Done
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));
    
    // Verify tables created
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'document_%' OR name LIKE 'folder_%' OR name LIKE 'organization_%'",
      [],
      (err, rows) => {
        if (err) {
          console.error('❌ Failed to verify tables:', err.message);
        } else {
          console.log('\n📋 Organization Tables Created:');
          rows.forEach(row => {
            console.log(`  ✓ ${row.name}`);
          });
        }
        
        // Verify views
        db.all(
          "SELECT name FROM sqlite_master WHERE type='view' AND name LIKE 'v_%'",
          [],
          (err, rows) => {
            if (err) {
              console.error('❌ Failed to verify views:', err.message);
            } else {
              console.log('\n👁️  Views Created:');
              rows.forEach(row => {
                console.log(`  ✓ ${row.name}`);
              });
            }
            
            // Verify triggers
            db.all(
              "SELECT name FROM sqlite_master WHERE type='trigger'",
              [],
              (err, rows) => {
                if (err) {
                  console.error('❌ Failed to verify triggers:', err.message);
                } else {
                  console.log('\n⚡ Triggers Created:');
                  rows.forEach(row => {
                    console.log(`  ✓ ${row.name}`);
                  });
                }
                
                db.close((err) => {
                  if (err) {
                    console.error('❌ Error closing database:', err.message);
                  } else {
                    console.log('\n✅ Database closed successfully');
                  }
                });
              }
            );
          }
        );
      }
    );
    
    return;
  }
  
  const stmt = statements[index];
  const preview = stmt.substring(0, 60).replace(/\s+/g, ' ');
  
  db.run(stmt, (err) => {
    if (err) {
      // Check if it's just a "table already exists" error
      if (err.message.includes('already exists')) {
        console.log(`⚠️  [${index + 1}/${statements.length}] Already exists: ${preview}...`);
        successCount++;
      } else {
        console.error(`❌ [${index + 1}/${statements.length}] Error: ${err.message}`);
        console.error(`   Statement: ${preview}...`);
        errorCount++;
      }
    } else {
      console.log(`✅ [${index + 1}/${statements.length}] ${preview}...`);
      successCount++;
    }
    
    // Process next statement
    applyStatement(index + 1);
  });
};

// Start applying statements
console.log('🚀 Applying schema...\n');
applyStatement(0);
