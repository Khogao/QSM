import { dialog } from 'electron';
import { LocalStorage } from './localStorage';
import fs from 'fs-extra';
import path from 'path';

export class FileImport {
  constructor(private storage: LocalStorage) {}

  async importFiles(): Promise<{ success: number; failed: number }> {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt'] }
      ]
    });

    if (result.canceled) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;

    for (const filePath of result.filePaths) {
      try {
        await this.storage.importDocument(filePath);
        success++;
      } catch (error) {
        console.error(`Failed to import ${filePath}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  async importFolder(): Promise<{ success: number; failed: number }> {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled) return { success: 0, failed: 0 };

    const folderPath = result.filePaths[0];
    const files = await this.scanFolder(folderPath);

    let success = 0;
    let failed = 0;

    for (const file of files) {
      try {
        await this.storage.importDocument(file);
        success++;
      } catch (error) {
        console.error(`Failed to import ${file}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }

  private async scanFolder(folderPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.scanFolder(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }
}
