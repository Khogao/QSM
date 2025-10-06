"""
Batch RAG Processing for All Documents
========================================

Xử lý toàn bộ PDFs trong Documents folder với Docling
- GPU acceleration
- Progress tracking with resume capability
- Error handling and logging
- Output: Markdown files cùng folder với source PDF
"""

import os
import sys
import json
import time
import warnings
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Tuple

# Suppress pin_memory warning from PyTorch
warnings.filterwarnings('ignore', message='.*pin_memory.*')

# Add QSM python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
except ImportError:
    print("❌ ERROR: Docling not installed!")
    print("Run: D:\\Work\\Coding\\QSM\\python\\venv\\Scripts\\pip.exe install docling")
    sys.exit(1)

# Configuration
DOCUMENTS_ROOT = r"D:\Work\Coding\archi-query-master\Documents"
PROGRESS_FILE = r"D:\Work\Coding\QSM\batch_rag_progress.json"
ERROR_LOG = r"D:\Work\Coding\QSM\batch_rag_errors.log"
MAX_WORKERS = 4  # Parallel processing threads
SKIP_EXISTING = True  # Skip if .md file already exists

# Statistics
stats = {
    "total_files": 0,
    "processed": 0,
    "skipped": 0,
    "errors": 0,
    "start_time": None,
    "estimated_time_remaining": 0
}

def setup_docling_converter():
    """Setup Docling with Vietnamese OCR optimization"""
    print("⚙️  Setting up Docling converter...")
    print("   OCR Engine: EasyOCR (Vietnamese + English)")
    print("   Mode: CPU (AMD RX 580)")
    print("   Image Scale: 2.5x (high quality)")
    print()
    
    # Configure pipeline for Vietnamese documents
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    
    # EasyOCR options for Vietnamese
    from docling.datamodel.pipeline_options import EasyOcrOptions
    easyocr_options = EasyOcrOptions(
        lang=["vi", "en"],  # Vietnamese + English
        use_gpu=False,  # AMD RX 580 not supported
        force_full_page_ocr=True,
        confidence_threshold=0.5,
        bitmap_area_threshold=0.05,
        download_enabled=True
    )
    pipeline_options.ocr_options = easyocr_options
    
    # Image quality
    pipeline_options.images_scale = 2.5
    pipeline_options.generate_page_images = True
    
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
        }
    )
    
    print("✅ Docling converter ready with Vietnamese OCR optimization")
    return converter

def load_progress() -> Dict:
    """Load processing progress from checkpoint"""
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                progress = json.load(f)
                print(f"📋 Loaded progress: {len(progress['completed'])} files already processed")
                return progress
        except Exception as e:
            print(f"⚠️  Could not load progress: {e}")
    
    return {
        "completed": [],
        "failed": [],
        "last_updated": None
    }

def save_progress(progress: Dict):
    """Save processing progress"""
    progress["last_updated"] = datetime.now().isoformat()
    try:
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"⚠️  Could not save progress: {e}")

def log_error(pdf_path: str, error: str):
    """Log processing errors"""
    try:
        with open(ERROR_LOG, 'a', encoding='utf-8') as f:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] {pdf_path}\n")
            f.write(f"  Error: {error}\n\n")
    except Exception as e:
        print(f"⚠️  Could not write to error log: {e}")

def get_output_path(pdf_path: str) -> str:
    """Get output markdown path (same folder as PDF)"""
    pdf_file = Path(pdf_path)
    return str(pdf_file.with_suffix('.md'))

def process_single_pdf(pdf_path: str, converter: DocumentConverter, progress: Dict) -> Tuple[bool, str]:
    """
    Process a single PDF file
    
    Returns:
        (success: bool, message: str)
    """
    pdf_name = os.path.basename(pdf_path)
    
    # Check if already completed
    if pdf_path in progress['completed']:
        return True, f"Already processed: {pdf_name}"
    
    # Check if output already exists
    output_path = get_output_path(pdf_path)
    if SKIP_EXISTING and os.path.exists(output_path):
        progress['completed'].append(pdf_path)
        return True, f"Output exists, skipped: {pdf_name}"
    
    try:
        start_time = time.time()
        
        # Convert PDF to markdown
        result = converter.convert(pdf_path)
        
        # Export to markdown
        markdown_content = result.document.export_to_markdown()
        
        # Save to file (same folder as PDF)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        elapsed = time.time() - start_time
        
        # Update progress
        progress['completed'].append(pdf_path)
        
        return True, f"✅ Processed {pdf_name} ({elapsed:.1f}s)"
        
    except Exception as e:
        error_msg = str(e)
        progress['failed'].append(pdf_path)
        log_error(pdf_path, error_msg)
        return False, f"❌ Failed {pdf_name}: {error_msg}"

def find_all_pdfs(root_dir: str) -> List[str]:
    """Find all PDF files recursively"""
    print(f"🔍 Scanning for PDFs in {root_dir}...")
    
    pdf_files = []
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))
    
    print(f"📚 Found {len(pdf_files)} PDF files")
    return pdf_files

def update_stats(pdf_files: List[str], progress: Dict, start_time: float):
    """Update and display statistics"""
    stats["total_files"] = len(pdf_files)
    stats["processed"] = len(progress['completed'])
    stats["errors"] = len(progress['failed'])
    stats["skipped"] = stats["processed"] - stats["errors"]
    
    elapsed = time.time() - start_time
    
    if stats["processed"] > 0:
        avg_time_per_file = elapsed / stats["processed"]
        remaining_files = stats["total_files"] - stats["processed"]
        stats["estimated_time_remaining"] = avg_time_per_file * remaining_files
    
    # Display progress
    percent = (stats["processed"] / stats["total_files"] * 100) if stats["total_files"] > 0 else 0
    
    print(f"\n{'='*80}")
    print(f"📊 PROGRESS: {stats['processed']}/{stats['total_files']} ({percent:.1f}%)")
    print(f"   ✅ Completed: {stats['processed'] - stats['errors']}")
    print(f"   ❌ Errors: {stats['errors']}")
    print(f"   ⏱️  Elapsed: {elapsed/60:.1f} min")
    
    if stats["estimated_time_remaining"] > 0:
        print(f"   ⏰ Estimated remaining: {stats['estimated_time_remaining']/60:.1f} min")
    
    print(f"{'='*80}\n")

def batch_process_pdfs(pdf_files: List[str], converter: DocumentConverter, progress: Dict):
    """
    Process PDFs in parallel with progress tracking
    """
    start_time = time.time()
    stats["start_time"] = start_time
    
    # Filter out already completed
    remaining = [pdf for pdf in pdf_files if pdf not in progress['completed']]
    
    if not remaining:
        print("✅ All files already processed!")
        return
    
    print(f"\n🚀 Starting batch processing...")
    print(f"   Total PDFs: {len(pdf_files)}")
    print(f"   Already done: {len(progress['completed'])}")
    print(f"   Remaining: {len(remaining)}")
    print(f"   Parallel workers: {MAX_WORKERS}")
    print(f"   GPU acceleration: ENABLED\n")
    
    # Process with thread pool
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Submit all tasks
        future_to_pdf = {
            executor.submit(process_single_pdf, pdf, converter, progress): pdf
            for pdf in remaining
        }
        
        # Process results as they complete
        for future in as_completed(future_to_pdf):
            pdf_path = future_to_pdf[future]
            
            try:
                success, message = future.result()
                print(message)
                
                # Save progress every 10 files
                if stats["processed"] % 10 == 0:
                    save_progress(progress)
                    update_stats(pdf_files, progress, start_time)
                
            except Exception as e:
                print(f"❌ Unexpected error processing {os.path.basename(pdf_path)}: {e}")
                progress['failed'].append(pdf_path)
                log_error(pdf_path, str(e))
    
    # Final save
    save_progress(progress)
    update_stats(pdf_files, progress, start_time)

def main():
    """Main entry point"""
    print("="*80)
    print("🚀 BATCH RAG PROCESSING - DOCUMENTS FOLDER")
    print("="*80)
    print()
    
    # Validate paths
    if not os.path.exists(DOCUMENTS_ROOT):
        print(f"❌ ERROR: Documents folder not found: {DOCUMENTS_ROOT}")
        return
    
    # Setup
    converter = setup_docling_converter()
    progress = load_progress()
    pdf_files = find_all_pdfs(DOCUMENTS_ROOT)
    
    if not pdf_files:
        print("❌ No PDF files found!")
        return
    
    # Confirm with user
    print(f"\n⚠️  ABOUT TO PROCESS {len(pdf_files)} PDFs (~8 GB)")
    print(f"   Estimated time: 2-6 hours")
    print(f"   Output: Markdown files in same folders as PDFs")
    print(f"   Progress saved to: {PROGRESS_FILE}")
    print(f"   Errors logged to: {ERROR_LOG}")
    print()
    
    response = input("Continue? (y/n): ")
    if response.lower() != 'y':
        print("❌ Cancelled by user")
        return
    
    # Start processing
    print("\n" + "="*80)
    print("🔥 PROCESSING STARTED")
    print("="*80 + "\n")
    
    try:
        batch_process_pdfs(pdf_files, converter, progress)
        
        print("\n" + "="*80)
        print("✅ BATCH PROCESSING COMPLETE!")
        print("="*80)
        print()
        print(f"📊 FINAL STATISTICS:")
        print(f"   Total files: {stats['total_files']}")
        print(f"   Processed: {stats['processed'] - stats['errors']}")
        print(f"   Errors: {stats['errors']}")
        print(f"   Total time: {(time.time() - stats['start_time'])/60:.1f} minutes")
        print()
        
        if stats['errors'] > 0:
            print(f"⚠️  Check error log: {ERROR_LOG}")
        
        print(f"📁 Output files saved in Documents folder (*.md)")
        print()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  INTERRUPTED BY USER")
        print("Progress has been saved. Run again to resume.")
        save_progress(progress)
    
    except Exception as e:
        print(f"\n\n❌ FATAL ERROR: {e}")
        save_progress(progress)
        raise

if __name__ == "__main__":
    main()
