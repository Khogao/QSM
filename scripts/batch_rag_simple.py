"""
Batch RAG Simple - Serial Processing (For Testing)
===================================================

Chạy tuần tự (không parallel) để dễ debug
"""

import os
import sys
import json
import time
import warnings
from pathlib import Path
from datetime import datetime

# Suppress warnings
warnings.filterwarnings('ignore', message='.*pin_memory.*')
warnings.filterwarnings('ignore', message='.*Deprecated field.*')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions, EasyOcrOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
except ImportError as e:
    print(f"ERROR: {e}")
    sys.exit(1)

# Config
DOCUMENTS_ROOT = r"D:\Work\Coding\archi-query-master\Documents"
PROGRESS_FILE = r"D:\Work\Coding\QSM\batch_simple_progress.json"
LIMIT = 10  # Process only first 10 for testing

def setup_converter():
    """Setup với Vietnamese OCR"""
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    
    easyocr_options = EasyOcrOptions(
        lang=["vi", "en"],
        use_gpu=False,
        force_full_page_ocr=True,
        confidence_threshold=0.5,
        download_enabled=True
    )
    pipeline_options.ocr_options = easyocr_options
    pipeline_options.images_scale = 2.5
    pipeline_options.generate_page_images = True
    
    return DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
        }
    )

def find_pdfs():
    """Find all PDFs"""
    pdfs = []
    for root, dirs, files in os.walk(DOCUMENTS_ROOT):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdfs.append(os.path.join(root, file))
    return pdfs

def load_progress():
    """Load progress"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {"completed": [], "failed": []}

def save_progress(progress):
    """Save progress"""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def process_pdf(pdf_path, converter, progress):
    """Process single PDF"""
    if pdf_path in progress['completed']:
        print(f"SKIP: {os.path.basename(pdf_path)} (already done)")
        return True
    
    output_path = pdf_path.replace('.pdf', '.md')
    if os.path.exists(output_path):
        print(f"SKIP: {os.path.basename(pdf_path)} (output exists)")
        progress['completed'].append(pdf_path)
        return True
    
    print(f"\nProcessing: {os.path.basename(pdf_path)}")
    start = time.time()
    
    try:
        result = converter.convert(pdf_path)
        markdown = result.document.export_to_markdown()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        elapsed = time.time() - start
        progress['completed'].append(pdf_path)
        print(f"  OK - {elapsed:.1f}s - {len(markdown)} chars")
        return True
        
    except Exception as e:
        progress['failed'].append(pdf_path)
        print(f"  FAIL - {e}")
        return False

def main():
    print("="*80)
    print("BATCH RAG - SIMPLE MODE (Testing)")
    print("="*80)
    print()
    
    print("Setup...")
    converter = setup_converter()
    progress = load_progress()
    
    print(f"Finding PDFs in {DOCUMENTS_ROOT}...")
    all_pdfs = find_pdfs()
    
    # Limit for testing
    pdfs_to_process = [p for p in all_pdfs if p not in progress['completed']][:LIMIT]
    
    print(f"\nTotal PDFs: {len(all_pdfs)}")
    print(f"Already done: {len(progress['completed'])}")
    print(f"Will process: {len(pdfs_to_process)} (limit={LIMIT})")
    print()
    
    if not pdfs_to_process:
        print("Nothing to process!")
        return
    
    input("Press ENTER to start...")
    print()
    print("="*80)
    print("PROCESSING...")
    print("="*80)
    
    start_time = time.time()
    
    for i, pdf in enumerate(pdfs_to_process, 1):
        print(f"\n[{i}/{len(pdfs_to_process)}]", end=" ")
        process_pdf(pdf, converter, progress)
        
        # Save progress every file
        save_progress(progress)
    
    total_time = time.time() - start_time
    
    print()
    print("="*80)
    print(f"DONE - {total_time/60:.1f} minutes")
    print("="*80)
    print(f"Completed: {len([p for p in pdfs_to_process if p in progress['completed']])}")
    print(f"Failed: {len([p for p in pdfs_to_process if p in progress['failed']])}")
    print()

if __name__ == "__main__":
    main()
