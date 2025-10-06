"""
QSM Batch Test Script - 100 Documents (Python)

Simplified version that directly tests Docling processing
without needing Node.js build artifacts.
"""

import os
import sys
import json
import time
import random
import hashlib
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from docling.document_converter import DocumentConverter
    from docling.datamodel.base_models import InputFormat
    DOCLING_AVAILABLE = True
except ImportError:
    print("❌ Error: docling not installed")
    print("Run: pip install docling")
    DOCLING_AVAILABLE = False
    sys.exit(1)

# Configuration
TEST_FOLDER = r"D:\Work\Coding\archi-query-master\Documents"
TARGET_COUNT = 100
RESULT_FILE = Path(__file__).parent.parent / "test_results_100.json"
LOG_FILE = Path(__file__).parent.parent / "test_log_100.txt"

# Results tracking
results = {
    "startTime": datetime.now().isoformat(),
    "testFolder": TEST_FOLDER,
    "targetCount": TARGET_COUNT,
    "totalFiles": 0,
    "processedFiles": 0,
    "failedFiles": 0,
    "totalProcessingTime": 0,
    "avgProcessingTime": 0,
    "files": [],
    "errors": [],
    "summary": {}
}

def log(message):
    """Log to console and file"""
    timestamp = datetime.now().isoformat()
    log_message = f"[{timestamp}] {message}"
    print(message)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(log_message + '\n')

def get_file_hash(filepath):
    """Calculate SHA256 hash of file"""
    hash_sha256 = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    except Exception as e:
        return None

def select_test_files():
    """Select 100 diverse files using stratified sampling"""
    log(f"📂 Scanning {TEST_FOLDER}...")
    
    # Collect all files by type
    files_by_type = defaultdict(list)
    all_files = []
    
    for root, dirs, files in os.walk(TEST_FOLDER):
        for file in files:
            filepath = os.path.join(root, file)
            ext = os.path.splitext(file)[1].lower()
            
            # Filter supported formats
            if ext in ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt', '.md']:
                try:
                    size = os.path.getsize(filepath)
                    files_by_type[ext].append({
                        'path': filepath,
                        'name': file,
                        'size': size,
                        'ext': ext
                    })
                    all_files.append(files_by_type[ext][-1])
                except Exception as e:
                    log(f"⚠️  Skipping {file}: {e}")
    
    total_available = len(all_files)
    log(f"📊 Found {total_available} documents")
    
    for ext, files in files_by_type.items():
        log(f"  {ext}: {len(files)} files")
    
    # Stratified sampling
    if total_available <= TARGET_COUNT:
        log(f"⚠️  Only {total_available} files available, using all")
        selected = all_files
    else:
        selected = []
        for ext, files in files_by_type.items():
            # Sample proportionally
            proportion = len(files) / total_available
            count_to_sample = max(1, int(TARGET_COUNT * proportion))
            
            # Don't sample more than available
            count_to_sample = min(count_to_sample, len(files))
            
            sampled = random.sample(files, count_to_sample)
            selected.extend(sampled)
            log(f"  Sampled {count_to_sample} {ext} files")
        
        # If we're under target, randomly sample more
        if len(selected) < TARGET_COUNT:
            remaining_files = [f for f in all_files if f not in selected]
            additional = random.sample(remaining_files, min(TARGET_COUNT - len(selected), len(remaining_files)))
            selected.extend(additional)
    
    # Shuffle for random order
    random.shuffle(selected)
    
    log(f"✅ Selected {len(selected)} files for testing\n")
    return selected[:TARGET_COUNT]

def process_file(filepath, index, total):
    """Process single file with Docling"""
    filename = os.path.basename(filepath)
    log(f"[{index}/{total}] Processing: {filename}")
    
    result = {
        'index': index,
        'name': filename,
        'path': filepath,
        'size': os.path.getsize(filepath),
        'ext': os.path.splitext(filename)[1].lower(),
        'hash': get_file_hash(filepath),
        'success': False,
        'processingTime': 0,
        'chunks': 0,
        'wordCount': 0,
        'pageCount': 0,
        'tableCount': 0,
        'error': None
    }
    
    start_time = time.time()
    
    try:
        # Initialize Docling converter with default options
        # Note: backend parameter removed - not supported in current Docling version
        converter = DocumentConverter()  # Auto-detect format and use defaults
        
        # Convert document
        doc_result = converter.convert(filepath)
        
        # Extract metrics
        text = doc_result.document.export_to_markdown()
        result['wordCount'] = len(text.split())
        result['chunks'] = len(text) // 1000  # Rough estimate (1000 chars per chunk)
        
        # Page count (if available)
        if hasattr(doc_result.document, 'pages'):
            result['pageCount'] = len(doc_result.document.pages)
        
        # Table count (if available)
        if hasattr(doc_result.document, 'tables'):
            result['tableCount'] = len(doc_result.document.tables)
        
        result['success'] = True
        log(f"  ✅ Success: {result['wordCount']} words, {result['pageCount']} pages, {result['tableCount']} tables")
        
    except Exception as e:
        result['error'] = str(e)
        log(f"  ❌ Error: {e}")
    
    finally:
        result['processingTime'] = time.time() - start_time
        log(f"  ⏱️  Time: {result['processingTime']:.2f}s\n")
    
    return result

def generate_summary(file_results):
    """Generate test summary statistics"""
    summary = {
        'successRate': 0,
        'avgProcessingTime': 0,
        'fastestFile': None,
        'slowestFile': None,
        'byType': {}
    }
    
    # Overall stats
    successful = [r for r in file_results if r['success']]
    failed = [r for r in file_results if not r['success']]
    
    if file_results:
        summary['successRate'] = f"{len(successful) / len(file_results) * 100:.1f}%"
    
    if successful:
        times = [r['processingTime'] for r in successful]
        summary['avgProcessingTime'] = f"{sum(times) / len(times):.2f}s"
        
        fastest = min(successful, key=lambda x: x['processingTime'])
        slowest = max(successful, key=lambda x: x['processingTime'])
        
        summary['fastestFile'] = {
            'name': fastest['name'],
            'time': f"{fastest['processingTime']:.2f}s"
        }
        summary['slowestFile'] = {
            'name': slowest['name'],
            'time': f"{slowest['processingTime']:.2f}s"
        }
    
    # By file type
    by_type = defaultdict(lambda: {'total': 0, 'success': 0, 'times': []})
    for r in file_results:
        ext = r['ext']
        by_type[ext]['total'] += 1
        if r['success']:
            by_type[ext]['success'] += 1
            by_type[ext]['times'].append(r['processingTime'])
    
    for ext, stats in by_type.items():
        summary['byType'][ext] = {
            'total': stats['total'],
            'success': stats['success'],
            'successRate': f"{stats['success'] / stats['total'] * 100:.1f}%",
            'avgTime': f"{sum(stats['times']) / len(stats['times']):.2f}s" if stats['times'] else "N/A"
        }
    
    return summary

def main():
    """Main test runner"""
    log("🔍 QSM Batch Test - 100 Documents (Python)")
    log("=" * 50)
    
    # Clear log file
    if LOG_FILE.exists():
        LOG_FILE.unlink()
    
    # Select test files
    test_files = select_test_files()
    results['totalFiles'] = len(test_files)
    
    if not test_files:
        log("❌ No files found to test!")
        return
    
    log("🚀 Starting batch processing...\n")
    start_time = time.time()
    
    # Process each file
    for i, file_info in enumerate(test_files, 1):
        result = process_file(file_info['path'], i, len(test_files))
        results['files'].append(result)
        
        if result['success']:
            results['processedFiles'] += 1
        else:
            results['failedFiles'] += 1
            results['errors'].append({
                'file': result['name'],
                'error': result['error']
            })
    
    # Calculate summary
    results['totalProcessingTime'] = time.time() - start_time
    results['avgProcessingTime'] = results['totalProcessingTime'] / len(test_files)
    results['summary'] = generate_summary(results['files'])
    results['endTime'] = datetime.now().isoformat()
    
    # Save results
    with open(RESULT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Print summary
    log("\n" + "=" * 50)
    log("📊 BATCH TEST SUMMARY")
    log("=" * 50)
    log(f"Total Files:     {results['totalFiles']}")
    log(f"Processed:       {results['processedFiles']} ({results['summary']['successRate']})")
    log(f"Failed:          {results['failedFiles']}")
    log(f"Total Time:      {results['totalProcessingTime']:.1f}s ({results['totalProcessingTime']/60:.1f} min)")
    log(f"Avg Time:        {results['summary']['avgProcessingTime']}")
    
    if results['summary'].get('fastestFile'):
        log(f"Fastest:         {results['summary']['fastestFile']['name']} ({results['summary']['fastestFile']['time']})")
    if results['summary'].get('slowestFile'):
        log(f"Slowest:         {results['summary']['slowestFile']['name']} ({results['summary']['slowestFile']['time']})")
    
    log("\nBy Type:")
    for ext, stats in results['summary']['byType'].items():
        log(f"  {ext}: {stats['success']}/{stats['total']} ({stats['successRate']}), avg {stats['avgTime']}")
    
    if results['errors']:
        log(f"\n⚠️  {len(results['errors'])} Errors:")
        for error in results['errors'][:5]:  # Show first 5
            log(f"  - {error['file']}: {error['error'][:100]}")
    
    log(f"\n✅ Results saved to: {RESULT_FILE}")
    log(f"📋 Full log saved to: {LOG_FILE}")
    log("=" * 50)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        log("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        log(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
