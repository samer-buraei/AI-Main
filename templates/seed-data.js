/**
 * Seed Data Script
 * Utility script to populate knowledge files for a new project
 * 
 * Usage:
 *   node seed-data.js <projectId>
 * 
 * This will populate the 4 knowledge files with template content.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4000/api';

/**
 * Read template file content
 */
function readTemplate(templateName) {
  const templatePath = path.join(__dirname, 'knowledge-templates', `${templateName}.template`);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error reading template ${templateName}:`, error.message);
    return `# ${templateName}\n\nTemplate content for ${templateName}.\n\nUpdate this with project-specific information.`;
  }
}

/**
 * Seed knowledge files for a project
 */
async function seedKnowledgeFiles(projectId) {
  if (!projectId) {
    console.error('Error: projectId is required');
    console.log('Usage: node seed-data.js <projectId>');
    process.exit(1);
  }

  console.log(`Seeding knowledge files for project: ${projectId}`);
  console.log(`Backend API: ${BACKEND_API_URL}\n`);

  const fileTypes = [
    'PROJECT_MAP',
    'COMPONENT_SUMMARIES',
    'CHANGE_PATTERNS',
    'FILE_DEPENDENCIES',
  ];

  const results = [];

  for (const fileType of fileTypes) {
    try {
      const templateName = fileType;
      const content = readTemplate(templateName);

      console.log(`Updating ${fileType}...`);

      const response = await axios.put(
        `${BACKEND_API_URL}/knowledge`,
        {
          project_id: projectId,
          file_type: fileType,
          content: content,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      results.push({ fileType, status: 'success', message: response.data.message });
      console.log(`✓ ${fileType} updated successfully\n`);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      results.push({ fileType, status: 'error', message: errorMessage });
      console.error(`✗ Error updating ${fileType}:`, errorMessage);
      console.error('');
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  const successCount = results.filter((r) => r.status === 'success').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  console.log(`Success: ${successCount}/${fileTypes.length}`);
  console.log(`Errors: ${errorCount}/${fileTypes.length}`);

  if (errorCount > 0) {
    console.log('\nErrors:');
    results
      .filter((r) => r.status === 'error')
      .forEach((r) => {
        console.log(`  - ${r.fileType}: ${r.message}`);
      });
  }

  if (successCount === fileTypes.length) {
    console.log('\n✓ All knowledge files seeded successfully!');
    console.log('\nNext steps:');
    console.log('1. Review and customize the knowledge files in the dashboard');
    console.log('2. Update PROJECT_MAP with your actual project structure');
    console.log('3. Add component summaries as you build components');
    console.log('4. Document change patterns as you establish them');
    console.log('5. Map file dependencies as you discover them');
  } else {
    console.log('\n⚠ Some files failed to seed. Please check the errors above.');
    process.exit(1);
  }
}

// Get projectId from command line
const projectId = process.argv[2];

// Run the seed script
seedKnowledgeFiles(projectId).catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

