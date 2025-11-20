/**
 * Quick Verification Script
 * Run this to check if everything is set up correctly
 * 
 * Usage: node verify-setup.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'vibecoding-backend/vibecoding.db');

console.log('🔍 Verifying FireSwarm Setup...\n');

// Check 1: Database file exists
console.log('1. Checking database file...');
if (fs.existsSync(DB_FILE)) {
  console.log('   ✅ Database file exists:', DB_FILE);
} else {
  console.log('   ⚠️  Database file not found. It will be created on first backend start.');
  console.log('   📝 Run: cd vibecoding-backend && npm start');
  process.exit(0);
}

// Check 2: Database schema
console.log('\n2. Checking database schema...');
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('   ❌ Cannot open database:', err.message);
    process.exit(1);
  }
});

// Check if knowledge_docs table exists
db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='knowledge_docs'", (err, rows) => {
  if (err) {
    console.error('   ❌ Error checking tables:', err.message);
    db.close();
    process.exit(1);
  }

  if (rows.length > 0) {
    console.log('   ✅ knowledge_docs table exists');
  } else {
    console.log('   ⚠️  knowledge_docs table not found');
    console.log('   📝 Restart your backend server to create it');
  }

  // Check other required tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, allTables) => {
    if (err) {
      console.error('   ❌ Error listing tables:', err.message);
      db.close();
      process.exit(1);
    }

    const requiredTables = ['projects', 'tasks', 'knowledge_files', 'knowledge_docs', 'workflow_state', 'orchestration_sessions'];
    const existingTables = allTables.map(t => t.name);
    
    console.log('\n3. Checking all required tables...');
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ⚠️  ${table} (missing)`);
      }
    });

    // Check 4: Verify orchestrator.js has regex patterns
    console.log('\n4. Checking Skill Detective patterns...');
    const orchestratorPath = path.join(__dirname, 'vibecoding-backend/src/routes/orchestrator.js');
    if (fs.existsSync(orchestratorPath)) {
      const content = fs.readFileSync(orchestratorPath, 'utf8');
      if (content.includes('const PATTERNS = {')) {
        console.log('   ✅ Regex patterns found in orchestrator.js');
        
        // Count patterns
        const hardwareMatches = content.match(/hardware:\s*\[/);
        const dataScientistMatches = content.match(/data_scientist:\s*\[/);
        const devopsMatches = content.match(/devops:\s*\[/);
        const soraMatches = content.match(/sora_compliance:\s*\[/);
        
        if (hardwareMatches && dataScientistMatches && devopsMatches && soraMatches) {
          console.log('   ✅ All 4 pattern categories found (hardware, data_scientist, devops, sora_compliance)');
        } else {
          console.log('   ⚠️  Some pattern categories missing');
        }
      } else {
        console.log('   ⚠️  PATTERNS object not found in orchestrator.js');
      }
    } else {
      console.log('   ⚠️  orchestrator.js not found');
    }

    // Check 5: Verify bootstrap endpoint
    console.log('\n5. Checking Bootstrap Sprint endpoint...');
    if (content.includes('INSERT INTO knowledge_docs')) {
      console.log('   ✅ Bootstrap endpoint creates knowledge_docs');
    } else {
      console.log('   ⚠️  Bootstrap endpoint may not create knowledge_docs');
    }

    if (content.includes('fireswarm_phase0')) {
      console.log('   ✅ FireSwarm Phase 0 tasks defined');
    } else {
      console.log('   ⚠️  FireSwarm Phase 0 tasks not found');
    }

    // Check 6: Verify frontend components
    console.log('\n6. Checking frontend components...');
    const knowledgeBasePath = path.join(__dirname, 'vibecoding-dashboard/src/components/KnowledgeBase.js');
    if (fs.existsSync(knowledgeBasePath)) {
      const kbContent = fs.readFileSync(knowledgeBasePath, 'utf8');
      if (kbContent.includes('activeTab') && kbContent.includes('knowledgeDocs')) {
        console.log('   ✅ KnowledgeBase component has tabbed interface');
      } else {
        console.log('   ⚠️  KnowledgeBase component may be missing tabbed interface');
      }
    } else {
      console.log('   ⚠️  KnowledgeBase.js not found');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Verification Summary');
    console.log('='.repeat(50));
    console.log('✅ Database file exists');
    console.log(existingTables.includes('knowledge_docs') ? '✅ knowledge_docs table exists' : '⚠️  knowledge_docs table missing (restart backend)');
    console.log(content.includes('const PATTERNS = {') ? '✅ Skill Detective patterns found' : '⚠️  Skill Detective patterns missing');
    console.log(content.includes('INSERT INTO knowledge_docs') ? '✅ Bootstrap creates knowledge_docs' : '⚠️  Bootstrap may not create docs');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Restart backend: cd vibecoding-backend && npm start');
    console.log('   2. Restart frontend: cd vibecoding-dashboard && npm start');
    console.log('   3. Test the wizard with your 3 FireSwarm repos');
    console.log('   4. Click Bootstrap Sprint and verify tasks + docs are created');
    console.log('\n📋 See GO-LIVE-VERIFICATION.md for detailed testing steps\n');

    db.close();
  });
});

