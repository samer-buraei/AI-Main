const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'vibecoding.db');

console.log(`📂 DB Path: ${DB_FILE}`);
if (!fs.existsSync(DB_FILE)) {
  console.error('❌ Database file not found!');
  process.exit(1);
}

const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  // Get latest project
  db.get('SELECT * FROM projects ORDER BY rowid DESC LIMIT 1', [], (err, project) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    if (!project) {
      console.log('❌ No projects found.');
      return;
    }

    console.log(`✅ Latest Project: ${project.name} (${project.id})`);

    // Get Tasks
    db.all('SELECT * FROM tasks WHERE project_id = ?', [project.id], (err, tasks) => {
      console.log(`📋 Tasks (${tasks.length}):`);
      tasks.forEach(t => console.log(`   - [${t.status}] ${t.title}`));
    });

    // Get Knowledge Files
    db.all('SELECT * FROM knowledge_files WHERE project_id = ?', [project.id], (err, kfs) => {
      console.log(`📚 Knowledge Files (${kfs.length}):`);
      kfs.forEach(k => console.log(`   - ${k.file_type}`));
    });
    
    // Get Knowledge Docs
    db.all('SELECT * FROM knowledge_docs WHERE project_id = ?', [project.id], (err, docs) => {
      console.log(`📖 Knowledge Docs (${docs.length}):`);
      docs.forEach(d => console.log(`   - ${d.title}`));
    });
  });
});

