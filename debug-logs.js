/**
 * Debug Log Viewer
 * Run this to see the last 20 errors from the backend
 */

const fs = require('fs');
const path = require('path');

const errorLogPath = path.join(__dirname, 'vibecoding-backend/logs/error.log');

console.log('🔍 Scanning Error Logs...\n');

if (!fs.existsSync(errorLogPath)) {
  console.log('✅ No error logs found. (Good news!)');
} else {
  const content = fs.readFileSync(errorLogPath, 'utf8');
  const lines = content.trim().split('\n');
  const lastErrors = lines.slice(-20); // Get last 20

  lastErrors.forEach(line => {
    try {
      const log = JSON.parse(line);
      console.log(`[${log.timestamp}] 🔴 ${log.message}`);
      if (log.error) console.log(`   ↳ ${log.error}`);
      if (log.stack) console.log(`   ↳ Stack: ${log.stack.split('\n')[0]}...`); // First line of stack
      console.log('');
    } catch (e) {
      console.log('Raw:', line);
    }
  });
}

