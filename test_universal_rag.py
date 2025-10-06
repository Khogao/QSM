"""
Quick test: 10 files (PDF + Office formats)
"""

import os
import sys
import time
import warnings

warnings.filterwarnings('ignore', message='.*pin_memory.*')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, EasyOcrOptions
from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend

# Test files
TEST_FILES = [
    r"D:\Work\Coding\archi-query-master\Documents\Legals\RANH HT VA RANH GCN_GUI-Model.pdf",
    r"D:\Work\Coding\archi-query-master\Documents\220828 HLR068. HĐ Quy hoạch 1-500 Nguyễn Bình & Nhơn Đức.docx",
    r"D:\Work\Coding\archi-query-master\Documents\2019-0729-BANG THONG KE - Public Areas.xlsx",
    r"D:\Work\Coding\archi-query-master\Documents\30_05_2019_TechNewsThang6_Phuong-edit1 - Copy.docx",
]

def test_universal_rag():
    print("="*80)
    print("UNIVERSAL RAG TEST - PDF + OFFICE")
    print("="*80)
    print()
    
    # Setup converter
    print("Setting up converter...")
    ocr_options = EasyOcrOptions(force_full_page_ocr=False, use_gpu=False)
    pipeline_options = PdfPipelineOptions(do_ocr=True, do_table_structure=True, ocr_options=ocr_options)
    
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
        }
    )
    print("OK: Converter ready\n")
    
    # Test each file
    results = []
    for i, file_path in enumerate(TEST_FILES, 1):
        if not os.path.exists(file_path):
            print(f"[{i}/{len(TEST_FILES)}] SKIP: File not found - {os.path.basename(file_path)}")
            continue
        
        file_name = os.path.basename(file_path)
        ext = os.path.splitext(file_path)[1]
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        
        print(f"[{i}/{len(TEST_FILES)}] Processing: {file_name}")
        print(f"  Type: {ext}, Size: {size_mb:.2f} MB")
        
        try:
            start = time.time()
            result = converter.convert(file_path)
            markdown = result.document.export_to_markdown()
            elapsed = time.time() - start
            
            # Save output
            output_path = file_path.replace(ext, '.md')
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown)
            
            # Count Vietnamese chars
            vn_chars = sum(1 for c in markdown if '\u00C0' <= c <= '\u1EF9')
            
            print(f"  OK: {elapsed:.1f}s, {len(markdown):,} chars, {vn_chars} VN chars")
            print(f"  Saved: {output_path}")
            
            results.append({
                "file": file_name,
                "type": ext,
                "success": True,
                "time": elapsed,
                "length": len(markdown),
                "vn_chars": vn_chars
            })
            
        except Exception as e:
            print(f"  FAIL: {e}")
            results.append({
                "file": file_name,
                "type": ext,
                "success": False,
                "error": str(e)
            })
        
        print()
    
    # Summary
    print("="*80)
    print("SUMMARY")
    print("="*80)
    
    success = [r for r in results if r.get("success")]
    failed = [r for r in results if not r.get("success")]
    
    print(f"Success: {len(success)}/{len(results)}")
    print(f"Failed: {len(failed)}/{len(results)}")
    
    if success:
        print("\nBy format:")
        by_type = {}
        for r in success:
            t = r["type"]
            if t not in by_type:
                by_type[t] = []
            by_type[t].append(r)
        
        for ext, items in sorted(by_type.items()):
            avg_time = sum(i["time"] for i in items) / len(items)
            print(f"  {ext}: {len(items)} files, avg {avg_time:.1f}s")
    
    if failed:
        print("\nFailed files:")
        for r in failed:
            print(f"  {r['file']}: {r.get('error', 'Unknown error')[:60]}")
    
    print("\nOK: Universal RAG test complete!")

if __name__ == "__main__":
    test_universal_rag()
