/**
 * QSM Batch Test Script - 100 Documents
 * 
 * Automatically selects and processes 100 diverse documents from test folder
 * Measures: processing time, memory usage, success rate, error patterns
 */

const fs = require('fs-extra');
const path = require('path');
const { processDocument } = require('../dist/utils/documentProcessor');
const { performance } = require('perf_hooks');

// Configuration
const TEST_FOLDER = 'D:\\Work\\Coding\\archi-query-master\\Documents';
const RESULT_FILE = path.join(__dirname, '..', 'test_results_100.json');
const LOG_FILE = path.join(__dirname, '..', 'test_log_100.txt');
const TARGET_COUNT = 100;

// Test configuration
const config = {
  chunkSize: 320,
  chunkOverlap: 50
};

// Results tracking
const results = {
  startTime: new Date().toISOString(),
  config,
  totalFiles: 0,
  processedFiles: 0,
  failedFiles: 0,
  totalProcessingTime: 0,
  avgProcessingTime: 0,
  files: [],
  errors: [],
  summary: {}
};

// Logging utility
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Select diverse files
async function selectTestFiles() {
  log(`📂 Scanning ${TEST_FOLDER}...`);
  
  const allFiles = [];
  
  // Recursively get all files
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.pptx'].includes(ext)) {
          allFiles.push({
            path: fullPath,
            name: item,
            size: stat.size,
            ext
          });
        }
      }
    }
  }
  
  scanDir(TEST_FOLDER);
  
  log(`✅ Found ${allFiles.length} documents`);
  
  // Select diverse sample (stratified by size and type)
  const selected = [];
  
  // Group by type
  const byType = {
    '.pdf': allFiles.filter(f => f.ext === '.pdf'),
    '.docx': allFiles.filter(f => f.ext === '.docx'),
    '.doc': allFiles.filter(f => f.ext === '.doc'),
    '.txt': allFiles.filter(f => f.ext === '.txt'),
    '.xlsx': allFiles.filter(f => f.ext === '.xlsx'),
    '.pptx': allFiles.filter(f => f.ext === '.pptx')
  };
  
  // Distribute proportionally
  const totalFiles = allFiles.length;
  for (const [ext, files] of Object.entries(byType)) {
    if (files.length === 0) continue;
    
    const proportion = files.length / totalFiles;
    const targetCount = Math.max(1, Math.floor(TARGET_COUNT * proportion));
    
    // Sample evenly across size ranges
    files.sort((a, b) => a.size - b.size);
    const step = Math.max(1, Math.floor(files.length / targetCount));
    
    for (let i = 0; i < files.length && selected.length < TARGET_COUNT; i += step) {
      selected.push(files[i]);
    }
  }
  
  // Fill remaining with random selection if needed
  while (selected.length < TARGET_COUNT && selected.length < allFiles.length) {
    const remaining = allFiles.filter(f => !selected.includes(f));
    if (remaining.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[randomIndex]);
  }
  
  log(`✅ Selected ${selected.length} files for testing`);
  log(`📊 Distribution: ${JSON.stringify(
    selected.reduce((acc, f) => {
      acc[f.ext] = (acc[f.ext] || 0) + 1;
      return acc;
    }, {})
  )}`);
  
  return selected;
}

// Process single file
async function processFile(file, index, total) {
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed;
  
  log(`\n[${index + 1}/${total}] Processing: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
  try {
    // Create File object (simulate browser File API)
    const buffer = await fs.readFile(file.path);
    const fileObj = {
      name: file.name,
      size: file.size,
      type: file.ext === '.pdf' ? 'application/pdf' : 'application/octet-stream',
      arrayBuffer: async () => buffer
    };
    
    // Process document
    const result = await processDocument(
      fileObj,
      file.name,
      (progress) => {
        if (progress % 25 === 0) {
          log(`  ⏳ Progress: ${progress}%`);
        }
      },
      null, // No embedding pipeline for test
      config.chunkSize,
      config.chunkOverlap
    );
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;
    const processingTime = (endTime - startTime) / 1000; // seconds
    const memoryUsed = (endMemory - startMemory) / 1024 / 1024; // MB
    
    log(`  ✅ SUCCESS - ${processingTime.toFixed(2)}s, ${result.chunks} chunks, ${result.metadata.wordCount} words`);
    
    results.processedFiles++;
    results.totalProcessingTime += processingTime;
    results.files.push({
      name: file.name,
      path: file.path,
      size: file.size,
      ext: file.ext,
      status: 'success',
      processingTime,
      memoryUsed,
      chunks: result.chunks,
      wordCount: result.metadata.wordCount,
      pageCount: result.metadata.pageCount,
      tableCount: result.metadata.tableCount,
      confidence: result.metadata.confidence
    });
    
    return true;
  } catch (error) {
    const endTime = performance.now();
    const processingTime = (endTime - startTime) / 1000;
    
    log(`  ❌ FAILED - ${error.message}`);
    
    results.failedFiles++;
    results.files.push({
      name: file.name,
      path: file.path,
      size: file.size,
      ext: file.ext,
      status: 'failed',
      processingTime,
      error: error.message
    });
    
    results.errors.push({
      file: file.name,
      error: error.message,
      stack: error.stack
    });
    
    return false;
  }
}

// Main test runner
async function runBatchTest() {
  log('🚀 Starting QSM Batch Test - 100 Documents\n');
  log(`📋 Configuration: chunk_size=${config.chunkSize}, chunk_overlap=${config.chunkOverlap}\n`);
  
  // Select files
  const files = await selectTestFiles();
  results.totalFiles = files.length;
  
  log(`\n${'='.repeat(60)}`);
  log('🔄 STARTING BATCH PROCESSING');
  log('='.repeat(60) + '\n');
  
  // Process files sequentially (avoid memory issues)
  for (let i = 0; i < files.length; i++) {
    await processFile(files[i], i, files.length);
    
    // Memory cleanup
    if (global.gc && i % 10 === 0) {
      global.gc();
    }
  }
  
  // Calculate summary
  results.endTime = new Date().toISOString();
  results.avgProcessingTime = results.totalProcessingTime / results.processedFiles;
  
  results.summary = {
    successRate: `${((results.processedFiles / results.totalFiles) * 100).toFixed(2)}%`,
    avgProcessingTime: `${results.avgProcessingTime.toFixed(2)}s`,
    totalTime: `${(results.totalProcessingTime / 60).toFixed(2)} minutes`,
    fastestFile: results.files.filter(f => f.status === 'success').sort((a, b) => a.processingTime - b.processingTime)[0],
    slowestFile: results.files.filter(f => f.status === 'success').sort((a, b) => b.processingTime - a.processingTime)[0],
    byType: {}
  };
  
  // Statistics by file type
  for (const ext of ['.pdf', '.docx', '.doc', '.txt', '.xlsx', '.pptx']) {
    const typeFiles = results.files.filter(f => f.ext === ext);
    if (typeFiles.length > 0) {
      const successCount = typeFiles.filter(f => f.status === 'success').length;
      results.summary.byType[ext] = {
        total: typeFiles.length,
        success: successCount,
        failed: typeFiles.length - successCount,
        avgTime: typeFiles
          .filter(f => f.status === 'success')
          .reduce((sum, f) => sum + f.processingTime, 0) / successCount || 0
      };
    }
  }
  
  // Save results
  await fs.writeJson(RESULT_FILE, results, { spaces: 2 });
  
  // Print summary
  log(`\n${'='.repeat(60)}`);
  log('📊 TEST SUMMARY');
  log('='.repeat(60));
  log(`Total Files:      ${results.totalFiles}`);
  log(`Processed:        ${results.processedFiles} ✅`);
  log(`Failed:           ${results.failedFiles} ❌`);
  log(`Success Rate:     ${results.summary.successRate}`);
  log(`Total Time:       ${results.summary.totalTime}`);
  log(`Avg Time/File:    ${results.summary.avgProcessingTime}`);
  log(`Fastest:          ${results.summary.fastestFile?.name} (${results.summary.fastestFile?.processingTime.toFixed(2)}s)`);
  log(`Slowest:          ${results.summary.slowestFile?.name} (${results.summary.slowestFile?.processingTime.toFixed(2)}s)`);
  log(`\n📁 By File Type:`);
  for (const [ext, stats] of Object.entries(results.summary.byType)) {
    log(`  ${ext}: ${stats.success}/${stats.total} (${(stats.avgTime || 0).toFixed(2)}s avg)`);
  }
  log(`\n💾 Results saved to: ${RESULT_FILE}`);
  log(`📄 Log saved to: ${LOG_FILE}`);
  log('='.repeat(60) + '\n');
}

// Run test
if (require.main === module) {
  runBatchTest().catch(err => {
    log(`\n❌ FATAL ERROR: ${err.message}`);
    log(err.stack);
    process.exit(1);
  });
}

module.exports = { runBatchTest, selectTestFiles };
