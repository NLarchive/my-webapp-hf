/**
 * Documentation Generator Agent
 * Auto-generates documentation for project files
 */

import { projectService } from '../services/project.js';
import { geminiService } from '../services/gemini.js';
import { logger } from '../config/logger.js';

class DocGeneratorAgent {
  /**
   * Generate documentation for project structure
   * @param {Object} structure - Project structure
   * @returns {Promise<string>} Generated documentation
   */
  async generateProjectDocumentation(structure) {
    try {
      const prompt = `Generate concise documentation for this project structure. Include:
1. Project overview
2. Directory structure explanation
3. Key files purpose
4. How to get started

Project structure:
- Files: ${structure.files.map((f) => f.name).join(', ')}
- Directories: ${structure.directories.map((d) => d.name).join(', ')}`;

      const doc = await geminiService.generate(prompt);
      return doc;
    } catch (error) {
      logger.error('Failed to generate documentation', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate file-specific documentation
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File documentation
   */
  async generateFileDocumentation(filePath) {
    try {
      const content = await projectService.getFileContent(filePath);
      const language = this.getLanguageFromPath(filePath);

      const prompt = `Analyze this ${language} file and generate:
1. Purpose/Summary
2. Key functions or exports
3. Dependencies
4. Usage example (if applicable)

Code:
\`\`\`${language}
${content.substring(0, 2000)}
\`\`\``;

      const doc = await geminiService.generate(prompt);
      return doc;
    } catch (error) {
      logger.error('Failed to generate file documentation', {
        error: error.message,
        file: filePath,
      });
      throw error;
    }
  }

  /**
   * Generate README for project
   * @returns {Promise<string>} Generated README
   */
  async generateReadme() {
    try {
      const structure = await projectService.getProjectStructure();
      const keyFiles = structure.files.filter(
        (f) =>
          f.name.match(/package\.json|\.env\.example|Dockerfile|docker-compose/i) ||
          f.name.endsWith('.md')
      );

      const prompt = `Create a professional README.md for a Node.js AI agent project. Include:
1. Project title and description
2. Features
3. Prerequisites
4. Installation steps
5. Configuration (with example .env)
6. Running the application
7. API documentation
8. Architecture overview
9. Contributing
10. License

Key files in project: ${keyFiles.map((f) => f.name).join(', ')}`;

      const readme = await geminiService.generate(prompt);
      return readme;
    } catch (error) {
      logger.error('Failed to generate README', { error: error.message });
      throw error;
    }
  }

  /**
   * Helper: Get language from file path
   * @param {string} filePath - File path
   * @returns {string} Language
   */
  getLanguageFromPath(filePath) {
    if (filePath.endsWith('.js')) return 'javascript';
    if (filePath.endsWith('.ts')) return 'typescript';
    if (filePath.endsWith('.jsx')) return 'jsx';
    if (filePath.endsWith('.tsx')) return 'tsx';
    if (filePath.endsWith('.py')) return 'python';
    if (filePath.endsWith('.java')) return 'java';
    if (filePath.endsWith('.go')) return 'go';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml';
    return 'text';
  }
}

export const docGeneratorAgent = new DocGeneratorAgent();
