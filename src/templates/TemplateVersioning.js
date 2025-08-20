/**
 * @fileoverview Template Versioning System for PromptBoost
 * Provides comprehensive version control for templates including
 * history tracking, rollback capabilities, and change management.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Template version entry structure
 * @typedef {Object} TemplateVersion
 * @property {string} id - Version ID
 * @property {number} version - Version number
 * @property {string} content - Template content
 * @property {string} changelog - Version changelog
 * @property {number} createdAt - Creation timestamp
 * @property {string} createdBy - Creator identifier
 * @property {Object} metadata - Additional version metadata
 */

/**
 * Template versioning system
 * @class TemplateVersioning
 */
class TemplateVersioning {
  /**
   * Creates TemplateVersioning instance
   * 
   * @constructor
   * @param {Object} options - Versioning options
   * @param {number} [options.maxVersions=10] - Maximum versions to keep
   * @param {boolean} [options.autoCleanup=true] - Auto cleanup old versions
   */
  constructor(options = {}) {
    this.logger = new Logger('TemplateVersioning');
    this.maxVersions = options.maxVersions || 10;
    this.autoCleanup = options.autoCleanup !== false;
  }

  /**
   * Creates a new version for a template
   * 
   * @method createVersion
   * @param {Object} template - Template object
   * @param {string} content - New template content
   * @param {string} [changelog] - Version changelog
   * @param {string} [createdBy='user'] - Creator identifier
   * @returns {TemplateVersion} New version object
   */
  createVersion(template, content, changelog = '', createdBy = 'user') {
    try {
      const versions = template.versions || [];
      const nextVersion = this.getNextVersionNumber(versions);

      const newVersion = {
        id: `v${nextVersion}_${Date.now()}`,
        version: nextVersion,
        content: content,
        changelog: changelog || `Version ${nextVersion}`,
        createdAt: Date.now(),
        createdBy: createdBy,
        metadata: {
          contentLength: content.length,
          hasTextPlaceholder: content.includes('{text}'),
          wordCount: content.split(/\s+/).length
        }
      };

      // Add new version
      versions.push(newVersion);

      // Auto cleanup if enabled
      if (this.autoCleanup && versions.length > this.maxVersions) {
        this.cleanupOldVersions(versions);
      }

      this.logger.debug(`Created version ${nextVersion} for template: ${template.name}`);
      return newVersion;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.createVersion');
      throw error;
    }
  }

  /**
   * Gets the next version number
   * 
   * @method getNextVersionNumber
   * @param {Array<TemplateVersion>} versions - Existing versions
   * @returns {number} Next version number
   */
  getNextVersionNumber(versions) {
    if (!versions || versions.length === 0) {
      return 1;
    }

    const maxVersion = Math.max(...versions.map(v => v.version));
    return maxVersion + 1;
  }

  /**
   * Gets version history for a template
   * 
   * @method getVersionHistory
   * @param {Object} template - Template object
   * @param {Object} [options={}] - Query options
   * @param {number} [options.limit] - Maximum versions to return
   * @param {number} [options.offset=0] - Offset for pagination
   * @param {string} [options.sortBy='version'] - Sort field
   * @param {string} [options.sortOrder='desc'] - Sort order
   * @returns {Array<TemplateVersion>} Version history
   */
  getVersionHistory(template, options = {}) {
    try {
      const {
        limit,
        offset = 0,
        sortBy = 'version',
        sortOrder = 'desc'
      } = options;

      let versions = template.versions || [];

      // Sort versions
      versions.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
      });

      // Apply pagination
      if (limit) {
        versions = versions.slice(offset, offset + limit);
      } else if (offset > 0) {
        versions = versions.slice(offset);
      }

      return versions;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.getVersionHistory');
      return [];
    }
  }

  /**
   * Gets a specific version
   * 
   * @method getVersion
   * @param {Object} template - Template object
   * @param {number|string} versionIdentifier - Version number or ID
   * @returns {TemplateVersion|null} Version object or null
   */
  getVersion(template, versionIdentifier) {
    try {
      const versions = template.versions || [];

      // Search by version number or ID
      const version = versions.find(v =>
        v.version === versionIdentifier ||
        v.id === versionIdentifier
      );

      return version || null;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.getVersion');
      return null;
    }
  }

  /**
   * Rolls back template to a specific version
   * 
   * @method rollbackToVersion
   * @param {Object} template - Template object
   * @param {number|string} versionIdentifier - Version to rollback to
   * @param {string} [changelog] - Rollback changelog
   * @returns {Object} Updated template object
   */
  rollbackToVersion(template, versionIdentifier, changelog = '') {
    try {
      const targetVersion = this.getVersion(template, versionIdentifier);

      if (!targetVersion) {
        throw new Error(`Version ${versionIdentifier} not found`);
      }

      // Create new version with rollback content
      const rollbackChangelog = changelog || `Rolled back to version ${targetVersion.version}`;
      const newVersion = this.createVersion(
        template,
        targetVersion.content,
        rollbackChangelog,
        'rollback'
      );

      // Update template content and version
      const updatedTemplate = {
        ...template,
        template: targetVersion.content,
        version: newVersion.version,
        versions: template.versions,
        updatedAt: Date.now()
      };

      this.logger.info(`Rolled back template ${template.name} to version ${targetVersion.version}`);
      return updatedTemplate;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.rollbackToVersion');
      throw error;
    }
  }

  /**
   * Compares two versions
   * 
   * @method compareVersions
   * @param {TemplateVersion} version1 - First version
   * @param {TemplateVersion} version2 - Second version
   * @returns {Object} Comparison result
   */
  compareVersions(version1, version2) {
    try {
      const changes = {
        contentChanged: version1.content !== version2.content,
        lengthDiff: version2.content.length - version1.content.length,
        wordCountDiff: version2.metadata.wordCount - version1.metadata.wordCount,
        timeDiff: version2.createdAt - version1.createdAt,
        createdByDiff: version1.createdBy !== version2.createdBy
      };

      // Simple diff for content changes
      if (changes.contentChanged) {
        changes.diff = this.generateSimpleDiff(version1.content, version2.content);
      }

      return changes;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.compareVersions');
      return { error: error.message };
    }
  }

  /**
   * Generates a simple diff between two strings
   * 
   * @method generateSimpleDiff
   * @param {string} oldContent - Old content
   * @param {string} newContent - New content
   * @returns {Object} Diff result
   */
  generateSimpleDiff(oldContent, newContent) {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    const diff = {
      added: [],
      removed: [],
      modified: []
    };

    const maxLines = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        diff.added.push({ line: i + 1, content: newLine });
      } else if (newLine === undefined) {
        diff.removed.push({ line: i + 1, content: oldLine });
      } else if (oldLine !== newLine) {
        diff.modified.push({
          line: i + 1,
          old: oldLine,
          new: newLine
        });
      }
    }

    return diff;
  }

  /**
   * Cleans up old versions
   * 
   * @method cleanupOldVersions
   * @param {Array<TemplateVersion>} versions - Version array to cleanup
   * @returns {Array<TemplateVersion>} Cleaned up versions
   */
  cleanupOldVersions(versions) {
    try {
      if (versions.length <= this.maxVersions) {
        return versions;
      }

      // Sort by version number (descending) and keep the latest versions
      versions.sort((a, b) => b.version - a.version);
      const keptVersions = versions.slice(0, this.maxVersions);
      const removedCount = versions.length - this.maxVersions;

      this.logger.debug(`Cleaned up ${removedCount} old versions`);
      return keptVersions;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.cleanupOldVersions');
      return versions;
    }
  }

  /**
   * Exports version history
   * 
   * @method exportVersionHistory
   * @param {Object} template - Template object
   * @param {Object} [options={}] - Export options
   * @returns {Object} Exported version data
   */
  exportVersionHistory(template, options = {}) {
    try {
      const versions = this.getVersionHistory(template, options);

      return {
        templateId: template.id,
        templateName: template.name,
        exportedAt: Date.now(),
        totalVersions: template.versions?.length || 0,
        exportedVersions: versions.length,
        versions: versions.map(version => ({
          ...version,
          // Remove large content for summary export
          content: options.includeContent ? version.content : `[${version.content.length} characters]`
        }))
      };
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.exportVersionHistory');
      return { error: error.message };
    }
  }

  /**
   * Gets version statistics
   * 
   * @method getVersionStatistics
   * @param {Object} template - Template object
   * @returns {Object} Version statistics
   */
  getVersionStatistics(template) {
    try {
      const versions = template.versions || [];

      if (versions.length === 0) {
        return {
          totalVersions: 0,
          averageContentLength: 0,
          totalChanges: 0,
          creationSpan: 0,
          creators: []
        };
      }

      const contentLengths = versions.map(v => v.content.length);
      const creators = [...new Set(versions.map(v => v.createdBy))];
      const timestamps = versions.map(v => v.createdAt);

      return {
        totalVersions: versions.length,
        averageContentLength: Math.round(contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length),
        minContentLength: Math.min(...contentLengths),
        maxContentLength: Math.max(...contentLengths),
        totalChanges: versions.length - 1,
        creationSpan: Math.max(...timestamps) - Math.min(...timestamps),
        creators: creators,
        firstVersion: Math.min(...timestamps),
        lastVersion: Math.max(...timestamps)
      };
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateVersioning.getVersionStatistics');
      return { error: error.message };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateVersioning };
} else if (typeof window !== 'undefined') {
  window.TemplateVersioning = TemplateVersioning;
}
