/**
 * Organization IPC Handlers
 * 
 * IPC handlers for document organization features:
 * - Batch summarization
 * - Duplicate detection
 * - Folder suggestions
 * - Statistics
 */

import { ipcMain } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';
// import { OrganizationService } from '../src/services/organizationService';

const DB_PATH = path.join(__dirname, '../database/qsm.db');

export function registerOrganizationHandlers() {
  console.log('📋 Registering organization IPC handlers...');
  
  // Get organization statistics
  ipcMain.handle('organization:get-stats', async () => {
    try {
      const db = new Database(DB_PATH);
      
      // Count total documents
      const totalDocs = db.prepare('SELECT COUNT(*) as count FROM documents').get() as { count: number };
      
      // Count summarized documents
      const summarized = db.prepare('SELECT COUNT(*) as count FROM document_summaries').get() as { count: number };
      
      // Count duplicate groups
      const duplicates = db.prepare(`
        SELECT COUNT(DISTINCT original_id) as count 
        FROM document_duplicates 
        WHERE status = 'pending'
      `).get() as { count: number };
      
      // Count clusters
      const clusters = db.prepare('SELECT COUNT(*) as count FROM document_clusters').get() as { count: number };
      
      // Count folder suggestions
      const suggestions = db.prepare(`
        SELECT COUNT(*) as count 
        FROM folder_suggestions 
        WHERE status = 'suggested'
      `).get() as { count: number };
      
      db.close();
      
      return {
        totalDocuments: totalDocs.count,
        summarized: summarized.count,
        duplicates: duplicates.count,
        clusters: clusters.count,
        suggestions: suggestions.count
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      return {
        totalDocuments: 0,
        summarized: 0,
        duplicates: 0,
        clusters: 0,
        suggestions: 0
      };
    }
  });
  
  // Batch summarize documents
  ipcMain.handle('organization:batch-summarize', async (event) => {
    try {
      const db = new Database(DB_PATH);
      
      // Get all documents without summaries
      const docs = db.prepare(`
        SELECT d.id, d.name, d.content 
        FROM documents d
        LEFT JOIN document_summaries s ON d.id = s.document_id
        WHERE s.id IS NULL
        LIMIT 100
      `).all();
      
      console.log(`📝 Summarizing ${docs.length} documents...`);
      
      let success = 0;
      let failed = 0;
      
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i] as { id: string; name: string; content: string };
        
        try {
          // Send progress update
          event.sender.send('organization:summarize-progress', i + 1, docs.length);
          
          // TODO: Call LLM for summarization
          // For now, create basic summary
          const shortSummary = doc.content ? doc.content.substring(0, 200) : 'No content';
          
          db.prepare(`
            INSERT INTO document_summaries (
              document_id, short_summary, full_summary, 
              keywords, topics, language, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `).run(
            doc.id,
            shortSummary,
            shortSummary,
            JSON.stringify(['keyword1', 'keyword2']),
            JSON.stringify(['topic1']),
            'en'
          );
          
          success++;
        } catch (err) {
          console.error(`❌ Failed to summarize ${doc.name}:`, err);
          failed++;
        }
      }
      
      db.close();
      
      console.log(`✅ Summarization complete: ${success} success, ${failed} failed`);
      
      return { success, failed };
    } catch (error) {
      console.error('❌ Batch summarize error:', error);
      throw error;
    }
  });
  
  // Detect duplicates
  ipcMain.handle('organization:detect-duplicates', async () => {
    try {
      const db = new Database(DB_PATH);
      
      // Get duplicate groups
      const duplicates = db.prepare(`
        SELECT 
          d1.id as original_id,
          d1.name as original_name,
          d2.id as duplicate_id,
          d2.name as duplicate_name,
          dd.similarity_score
        FROM document_duplicates dd
        JOIN documents d1 ON dd.original_id = d1.id
        JOIN documents d2 ON dd.duplicate_id = d2.id
        WHERE dd.status = 'pending'
        ORDER BY d1.name, dd.similarity_score DESC
      `).all();
      
      // Group by original_id
      const groups = new Map<string, any>();
      
      for (const dup of duplicates as any[]) {
        if (!groups.has(dup.original_id)) {
          groups.set(dup.original_id, {
            originalId: dup.original_id,
            originalName: dup.original_name,
            duplicates: []
          });
        }
        
        groups.get(dup.original_id)!.duplicates.push({
          id: dup.duplicate_id,
          name: dup.duplicate_name,
          similarity: dup.similarity_score
        });
      }
      
      db.close();
      
      const result = Array.from(groups.values());
      console.log(`🔍 Found ${result.length} duplicate groups`);
      
      return result;
    } catch (error) {
      console.error('❌ Detect duplicates error:', error);
      throw error;
    }
  });
  
  // Suggest folders
  ipcMain.handle('organization:suggest-folders', async () => {
    try {
      const db = new Database(DB_PATH);
      
      // Get existing suggestions
      const suggestions = db.prepare(`
        SELECT 
          id, folder_name as name, description, 
          category, confidence_score as confidence, 
          document_count as documentCount
        FROM folder_suggestions
        WHERE status = 'suggested'
        ORDER BY confidence_score DESC
        LIMIT 10
      `).all();
      
      db.close();
      
      console.log(`📁 Retrieved ${suggestions.length} folder suggestions`);
      
      return suggestions;
    } catch (error) {
      console.error('❌ Suggest folders error:', error);
      throw error;
    }
  });
  
  // Delete duplicate
  ipcMain.handle('organization:delete-duplicate', async (_event, duplicateId: string) => {
    try {
      const db = new Database(DB_PATH);
      
      // Mark as deleted
      db.prepare(`
        UPDATE document_duplicates 
        SET status = 'deleted', reviewed = 1 
        WHERE duplicate_id = ?
      `).run(duplicateId);
      
      // TODO: Actually delete the file/document
      
      db.close();
      
      console.log(`🗑️  Marked duplicate ${duplicateId} as deleted`);
    } catch (error) {
      console.error('❌ Delete duplicate error:', error);
      throw error;
    }
  });
  
  // Apply folder suggestion
  ipcMain.handle('organization:apply-folder-suggestion', async (_event, suggestionId: number) => {
    try {
      const db = new Database(DB_PATH);
      
      // Mark as applied
      db.prepare(`
        UPDATE folder_suggestions 
        SET status = 'accepted', applied = 1 
        WHERE id = ?
      `).run(suggestionId);
      
      // TODO: Create actual folder and move documents
      
      db.close();
      
      console.log(`✅ Applied folder suggestion ${suggestionId}`);
    } catch (error) {
      console.error('❌ Apply folder suggestion error:', error);
      throw error;
    }
  });
  
  console.log('✅ Organization handlers registered');
}
