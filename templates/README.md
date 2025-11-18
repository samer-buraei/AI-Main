# Templates and Seed Data

This directory contains templates and utilities for initializing new projects in the Vibecoding system.

## Knowledge File Templates

The `knowledge-templates/` directory contains template files for the 4 key knowledge files:

1. **PROJECT_MAP.md.template** - Project structure and file locations
2. **COMPONENT_SUMMARIES.md.template** - Key component documentation
3. **CHANGE_PATTERNS.md.template** - Common change patterns and recipes
4. **FILE_DEPENDENCIES.md.template** - Critical file dependency mappings

## Cursor Configuration Templates

The `cursor-config/` directory contains templates for Cursor IDE configuration:

1. **.cursorrules.template** - Rules and guidelines for AI agents
2. **agents.md.template** - Agent role definitions

## Seed Data Script

The `seed-data.js` script populates knowledge files for a new project with template content.

### Usage

```bash
# Make sure the backend is running
cd templates
node seed-data.js <projectId>
```

### Example

```bash
# After creating a project in the dashboard, get its ID
# Then run:
node seed-data.js abc-123-def-456
```

This will:
1. Read all 4 knowledge file templates
2. Upload them to the backend for the specified project
3. Provide a summary of what was created

### Customization

After seeding, you should:
1. Review each knowledge file in the dashboard
2. Customize them with project-specific information
3. Update them as the project evolves

## Template Customization

### For New Projects

1. Copy templates to your project if needed
2. Customize with project-specific details
3. Keep templates updated as patterns emerge

### For Existing Projects

1. Review current knowledge files
2. Update templates if you discover better patterns
3. Use templates as reference when documenting

## Best Practices

- **Keep templates current**: Update templates as you learn better patterns
- **Customize for projects**: Each project may have unique needs
- **Document patterns**: Add new patterns to CHANGE_PATTERNS as you discover them
- **Map dependencies**: Keep FILE_DEPENDENCIES updated as architecture evolves
- **Summarize components**: Add to COMPONENT_SUMMARIES as you build

## Notes

- Templates use `.template` extension to avoid conflicts
- Templates are markdown files for easy editing
- Seed script requires backend API to be running
- Templates are starting points - customize as needed

