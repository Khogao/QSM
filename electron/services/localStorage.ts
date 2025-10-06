import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs-extra';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  dateAdded: number;
  folderId?: string;
  localPath: string;
  originalPath: string;
  content?: string;
  metadata?: string;
}

export class LocalStorage {
  private db: Database.Database;
  private dataDir: string;
  private documentsDir: string;

  constructor() {
    // Free version: Always use AppData
    this.dataDir = path.join(app.getPath('userData'), 'data');
    this.documentsDir = path.join(app.getPath('userData'), 'documents');
    
    // Ensure directories exist
    fs.ensureDirSync(this.dataDir);
    fs.ensureDirSync(path.join(this.documentsDir, 'imported'));
    fs.ensureDirSync(path.join(this.documentsDir, 'organized'));
    
    // Open database
    const dbPath = path.join(this.dataDir, 'archi-query.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER,
        dateAdded INTEGER,
        folderId TEXT,
        localPath TEXT,
        originalPath TEXT,
        content TEXT,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS chunks (
        id TEXT PRIMARY KEY,
        documentId TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding BLOB,
        metadata TEXT,
        FOREIGN KEY (documentId) REFERENCES documents(id)
      );

      CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parentId TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(documentId);
      CREATE INDEX IF NOT EXISTS idx_docs_folder ON documents(folderId);
    `);
  }

  async importDocument(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    const destPath = path.join(this.documentsDir, 'imported', fileName);
    
    // Copy file to local storage
    await fs.copy(filePath, destPath);
    
    // Store metadata
    const docId = this.generateId();
    const stats = await fs.stat(destPath);
    
    this.db.prepare(`
      INSERT INTO documents (id, name, type, size, dateAdded, localPath, originalPath)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      fileName,
      path.extname(fileName),
      stats.size,
      Date.now(),
      destPath,
      filePath
    );
    
    return docId;
  }

  getDocuments(): Document[] {
    return this.db.prepare('SELECT * FROM documents ORDER BY dateAdded DESC').all() as Document[];
  }

  deleteDocument(docId: string) {
    const doc = this.db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as Document;
    if (doc && doc.localPath) {
      // Delete physical file
      fs.removeSync(doc.localPath);
    }
    
    // Delete from database
    this.db.prepare('DELETE FROM documents WHERE id = ?').run(docId);
    this.db.prepare('DELETE FROM chunks WHERE documentId = ?').run(docId);
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
