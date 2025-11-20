const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'vibecoding.db');
const db = new sqlite3.Database(DB_FILE);

console.log('🔧 Fixing Database Schema...');

db.serialize(() => {
  // Drop the table so it can be recreated with the new schema (allowing NULL project_id)
  db.run("DROP TABLE IF EXISTS orchestration_sessions", (err) => {
    if (err) {
      console.error('❌ Error dropping table:', err.message);
    } else {
      console.log('✅ Dropped table: orchestration_sessions');
      console.log('🚀 Restart the backend to recreate it with the correct schema.');
    }
    db.close();
  });
});

