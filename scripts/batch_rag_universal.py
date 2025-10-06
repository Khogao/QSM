"""
Universal Document RAG - PDF + Office Formats
==============================================

Supports:
- PDF files
- Microsoft Office: DOCX, XLSX, PPTX, DOC, XLS, PPT
- Vietnamese OCR optimization with EasyOCR
- Progress tracking and resume capability
- Error handling and logging
"""

import os
import sys
import json
import time
import warnings
from pathlib import Path
from datetime import datetime

# Suppress pin_memory warning
warnings.filterwarnings('ignore', message='.*pin_memory.*')

# Add QSM python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions, EasyOcrOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
    print("OK: Docling imported successfully")
except ImportError as e:
    print(f"ERROR: {e}")
    print("Run: D:\\Work\\Coding\\QSM\\python\\venv\\Scripts\\pip.exe install docling")
    sys.exit(1)

# Configuration
DOCUMENTS_ROOT = r"D:\Work\Coding\archi-query-master\Documents"
PROGRESS_FILE = r"D:\Work\Coding\QSM\batch_rag_progress.json"
ERROR_LOG = r"D:\Work\Coding\QSM\batch_rag_errors.log"
SKIP_EXISTING = True

# Supported formats
SUPPORTED_EXTENSIONS = {
    '.pdf',   # PDF
    '.docx',  # Word 2007+
    '.doc',   # Word 97-2003
    '.xlsx',  # Excel 2007+
    '.xls',   # Excel 97-2003
    '.pptx',  # PowerPoint 2007+
    '.ppt'    # PowerPoint 97-2003
}

# Statistics
stats = {
    "total_files": 0,
    "processed": 0,
    "skipped": 0,
    "errors": 0,
    "by_format": {}
}

def setup_docling_converter():
    """Setup Docling with Vietnamese OCR optimization"""
    print("Setting up Docling converter...")
    
    # Vietnamese OCR optimization
    ocr_options = EasyOcrOptions(
        force_full_page_ocr=False,  # Only OCR when needed
        use_gpu=False  # RX 580 not supported by EasyOCR
    )
    
    # Pipeline options for PDF
    pipeline_options = PdfPipelineOptions(
        do_ocr=True,
        do_table_structure=True,
        ocr_options=ocr_options
    )
    
    # Create converter with support for all formats
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
            # Docling auto-handles DOCX, XLSX, PPTX without special config
        }
    )
    
    print("OK: Docling converter ready (PDF + Office formats)")
    print("   - PDF: Vietnamese OCR with EasyOCR")
    print("   - Office: DOCX, XLSX, PPTX, DOC, XLS, PPT")
    return converter

def load_progress():
    """Load processing progress"""
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                progress = json.load(f)
                print(f"Loaded progress: {len(progress['completed'])} files already processed")
                return progress
        except Exception as e:
            print(f"WARNING: Could not load progress: {e}")
    
    return {
        "completed": [],
        "failed": [],
        "by_format": {},
        "last_updated": None
    }

def save_progress(progress):
    """Save processing progress"""
    progress["last_updated"] = datetime.now().isoformat()
    try:
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"WARNING: Could not save progress: {e}")

def log_error(file_path, error):
    """Log processing errors"""
    try:
        with open(ERROR_LOG, 'a', encoding='utf-8') as f:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] {file_path}\n")
            f.write(f"  Error: {error}\n\n")
    except Exception as e:
        print(f"WARNING: Could not write to error log: {e}")

def get_output_path(file_path):
    """Get output markdown path (same folder as source)"""
    file = Path(file_path)
    return str(file.with_suffix('.md'))

def find_all_documents(root_dir):
    """Find all supported document files recursively"""
    print(f"Scanning for documents in {root_dir}...")
    
    documents = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in SUPPORTED_EXTENSIONS:
                documents.append(os.path.join(root, file))
    
    # Count by format
    by_format = {}
    for doc in documents:
        ext = os.path.splitext(doc)[1].lower()
        by_format[ext] = by_format.get(ext, 0) + 1
    
    print(f"Found {len(documents)} supported documents:")
    for ext, count in sorted(by_format.items()):
        print(f"  {ext}: {count} files")
    
    return documents, by_format

def process_single_document(file_path, converter, progress):
    """
    Process a single document file
    
    Returns:
        (success: bool, message: str, time_seconds: float)
    """
    file_name = os.path.basename(file_path)
    ext = os.path.splitext(file_path)[1].lower()
    
    # Check if already completed
    if file_path in progress['completed']:
        return True, f"Already processed: {file_name}", 0
    
    # Check if output already exists
    output_path = get_output_path(file_path)
    if SKIP_EXISTING and os.path.exists(output_path):
        progress['completed'].append(file_path)
        return True, f"Output exists, skipped: {file_name}", 0
    
    try:
        start_time = time.time()
        
        # Convert document to markdown
        result = converter.convert(file_path)
        
        # Export to markdown
        markdown_content = result.document.export_to_markdown()
        
        # Save to file (same folder as source)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        elapsed = time.time() - start_time
        
        # Update progress
        progress['completed'].append(file_path)
        
        # Track by format
        if ext not in progress['by_format']:
            progress['by_format'][ext] = {'success': 0, 'failed': 0}
        progress['by_format'][ext]['success'] += 1
        
        # Count Vietnamese characters (for quality check)
        vietnamese_chars = sum(1 for c in markdown_content if '\u00C0' <= c <= '\u1EF9')
        
        return True, f"OK: {file_name} ({elapsed:.1f}s, {len(markdown_content)} chars, {vietnamese_chars} VN chars)", elapsed
        
    except Exception as e:
        error_msg = str(e)
        progress['failed'].append(file_path)
        log_error(file_path, error_msg)
        
        # Track by format
        if ext not in progress['by_format']:
            progress['by_format'][ext] = {'success': 0, 'failed': 0}
        progress['by_format'][ext]['failed'] += 1
        
        return False, f"FAIL: {file_name}: {error_msg[:80]}", 0

def batch_process_documents(documents, converter, progress):
    """Process documents sequentially with progress tracking"""
    
    # Filter out already completed
    remaining = [doc for doc in documents if doc not in progress['completed']]
    
    if not remaining:
        print("All files already processed!")
        return
    
    print("\n" + "="*80)
    print("STARTING BATCH PROCESSING")
    print("="*80)
    print(f"Total documents: {len(documents)}")
    print(f"Already done: {len(progress['completed'])}")
    print(f"Remaining: {len(remaining)}")
    print()
    
    start_time = time.time()
    
    for i, doc_path in enumerate(remaining, 1):
        print(f"\n[{i}/{len(remaining)}] Processing: {os.path.basename(doc_path)}")
        
        success, message, elapsed = process_single_document(doc_path, converter, progress)
        print(f"  {message}")
        
        stats["processed"] += 1
        if not success:
            stats["errors"] += 1
        
        # Save progress every 10 files
        if stats["processed"] % 10 == 0:
            save_progress(progress)
            
            # Show progress
            total_elapsed = time.time() - start_time
            avg_time = total_elapsed / stats["processed"]
            remaining_time = avg_time * (len(remaining) - i)
            
            print()
            print(f"PROGRESS: {stats['processed']}/{len(remaining)} ({stats['processed']/len(remaining)*100:.1f}%)")
            print(f"  Success: {stats['processed'] - stats['errors']}")
            print(f"  Errors: {stats['errors']}")
            print(f"  Elapsed: {total_elapsed/60:.1f} min")
            print(f"  Estimated remaining: {remaining_time/60:.1f} min")
            print()
    
    # Final save
    save_progress(progress)

def main():
    """Main entry point"""
    print("="*80)
    print("UNIVERSAL DOCUMENT RAG - PDF + OFFICE FORMATS")
    print("="*80)
    print()
    
    # Validate paths
    if not os.path.exists(DOCUMENTS_ROOT):
        print(f"ERROR: Documents folder not found: {DOCUMENTS_ROOT}")
        return
    
    # Setup
    converter = setup_docling_converter()
    progress = load_progress()
    documents, by_format = find_all_documents(DOCUMENTS_ROOT)
    
    if not documents:
        print("ERROR: No supported documents found!")
        return
    
    stats["total_files"] = len(documents)
    stats["by_format"] = by_format
    
    # Confirm with user
    print()
    print(f"WARNING: ABOUT TO PROCESS {len(documents)} DOCUMENTS")
    total_size = sum(os.path.getsize(d) for d in documents if os.path.exists(d))
    print(f"  Total size: {total_size/1024/1024:.0f} MB")
    print(f"  Output: Markdown files in same folders as source")
    print(f"  Progress saved to: {PROGRESS_FILE}")
    print(f"  Errors logged to: {ERROR_LOG}")
    print()
    
    response = input("Continue? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled by user")
        return
    
    # Start processing
    try:
        batch_process_documents(documents, converter, progress)
        
        print("\n" + "="*80)
        print("BATCH PROCESSING COMPLETE!")
        print("="*80)
        print()
        print("FINAL STATISTICS:")
        print(f"  Total files: {stats['total_files']}")
        print(f"  Processed: {stats['processed'] - stats['errors']}")
        print(f"  Errors: {stats['errors']}")
        print()
        
        print("BY FORMAT:")
        for ext, counts in progress.get('by_format', {}).items():
            print(f"  {ext}: {counts['success']} success, {counts['failed']} failed")
        print()
        
        if stats['errors'] > 0:
            print(f"WARNING: Check error log: {ERROR_LOG}")
        
        print(f"Output files saved in Documents folder (*.md)")
        print()
        
    except KeyboardInterrupt:
        print("\n\nINTERRUPTED BY USER")
        print("Progress has been saved. Run again to resume.")
        save_progress(progress)
    
    except Exception as e:
        print(f"\n\nFATAL ERROR: {e}")
        save_progress(progress)
        raise

if __name__ == "__main__":
    main()
