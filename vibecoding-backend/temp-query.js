const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_FILE = path.join(__dirname, 'vibecoding.db');
const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.all("SELECT * FROM projects WHERE name LIKE '%FireSwarm%'", (err, rows) => {
    if (err) { console.error(err); return; }
    console.log('Projects:', rows);
    
    if (rows.length > 0) {
      const projectId = rows[0].id;
      db.all("SELECT * FROM tasks WHERE project_id = ?", [projectId], (err, tasks) => {
        console.log('Tasks:', tasks);
      });
      
       db.all("SELECT * FROM knowledge_files WHERE project_id = ?", [projectId], (err, kfs) => {
        console.log('Knowledge Files:', kfs.map(k => k.file_type));
      });
    }
  });
});

