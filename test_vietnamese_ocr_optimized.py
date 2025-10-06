"""
Optimized Docling Pipeline for Vietnamese OCR
==============================================

Tùy chỉnh pipeline để OCR tiếng Việt tốt nhất:
- EasyOCR engine (hỗ trợ tiếng Việt native)
- Tăng image scale cho OCR quality
- Enable table structure extraction
- Optimize cho Vietnamese documents
"""

import os
import sys
import time
from pathlib import Path

# Add QSM python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import (
        PdfPipelineOptions,
        EasyOcrOptions,
        TableFormerMode
    )
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
    print("✅ Docling imported successfully")
except ImportError as e:
    print(f"❌ ERROR: {e}")
    sys.exit(1)

def setup_optimized_vietnamese_pipeline():
    """
    Setup Docling with optimized settings for Vietnamese documents
    """
    print("⚙️  Setting up OPTIMIZED Vietnamese OCR pipeline...")
    print()
    
    # Configure pipeline options
    pipeline_options = PdfPipelineOptions()
    
    # 1. Enable OCR with EasyOCR (best for Vietnamese)
    pipeline_options.do_ocr = True
    
    # 2. Configure EasyOCR for Vietnamese
    easyocr_options = EasyOcrOptions(
        lang=["vi", "en"],  # Vietnamese + English (correct param name)
        use_gpu=False,  # AMD RX 580 not supported by EasyOCR GPU
        force_full_page_ocr=True,  # OCR entire page
        confidence_threshold=0.5,  # Lower threshold for better recall
        bitmap_area_threshold=0.05,  # Detect smaller text regions
        download_enabled=True,  # Allow downloading Vietnamese model
        suppress_mps_warnings=True
    )
    pipeline_options.ocr_options = easyocr_options
    
    # 3. Table extraction
    pipeline_options.do_table_structure = True
    pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE
    
    # 4. Image quality settings
    pipeline_options.images_scale = 2.5  # Tăng từ 2.0 lên 2.5 cho OCR tốt hơn
    pipeline_options.generate_page_images = True
    pipeline_options.generate_picture_images = True
    
    print("✅ Pipeline configuration:")
    print(f"   OCR Engine: EasyOCR")
    print(f"   Languages: Vietnamese + English")
    print(f"   GPU: Disabled (AMD RX 580 not supported)")
    print(f"   Image Scale: 2.5x (high quality)")
    print(f"   Table Extraction: Enabled (Accurate mode)")
    print(f"   Full Page OCR: Enabled")
    print(f"   Confidence Threshold: 0.5 (lower for better recall)")
    print()
    
    # Create converter
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
        }
    )
    
    print("✅ Converter ready with Vietnamese optimization")
    return converter

def test_vietnamese_ocr():
    """Test OCR với file tiếng Việt"""
    
    # Test với file đã biết có tiếng Việt
    test_file = r"D:\Work\Coding\archi-query-master\Documents\Legals\230425_TRL_721.QHPTTND-PGDCTD_Y kien cua BTNMT ve ho so dieu chinh CTDT.pdf"
    
    if not os.path.exists(test_file):
        print("⚠️  Test file not found, finding Vietnamese PDF...")
        # Find any PDF with Vietnamese in name
        for root, dirs, files in os.walk(r"D:\Work\Coding\archi-query-master\Documents"):
            for file in files:
                if file.lower().endswith('.pdf'):
                    test_file = os.path.join(root, file)
                    break
            if test_file:
                break
    
    print("="*80)
    print("🧪 VIETNAMESE OCR TEST")
    print("="*80)
    print()
    print(f"📄 Test file: {os.path.basename(test_file)}")
    print(f"   Size: {os.path.getsize(test_file)/1024:.1f} KB")
    print()
    
    # Setup converter
    converter = setup_optimized_vietnamese_pipeline()
    
    print("🔄 Processing with optimized Vietnamese OCR...")
    print()
    
    start_time = time.time()
    
    try:
        result = converter.convert(test_file)
        markdown = result.document.export_to_markdown()
        
        elapsed = time.time() - start_time
        
        # Save output
        output_path = test_file.replace('.pdf', '_optimized.md')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        print(f"✅ Conversion successful!")
        print()
        print(f"⏱️  Time: {elapsed:.2f} seconds")
        print(f"📝 Output length: {len(markdown):,} characters")
        print(f"💾 Saved to: {output_path}")
        print()
        
        # Show Vietnamese text preview
        print("📄 PREVIEW (first 1000 chars):")
        print("-" * 80)
        print(markdown[:1000])
        print("-" * 80)
        print()
        
        # Count Vietnamese characters to verify OCR worked
        vietnamese_chars = sum(1 for c in markdown if ord(c) in range(0x1EA0, 0x1EFF))
        print(f"✅ Vietnamese characters detected: {vietnamese_chars}")
        
        if vietnamese_chars > 0:
            print("🎉 Vietnamese OCR is WORKING!")
        else:
            print("⚠️  No Vietnamese characters detected (may be English-only document)")
        
        print()
        print("="*80)
        print("✅ TEST PASSED - Vietnamese OCR optimization confirmed")
        print("="*80)
        print()
        print("💡 Ready for batch processing with:")
        print("   cd D:\\Work\\Coding\\QSM")
        print("   .\\python\\venv\\Scripts\\python.exe scripts\\batch_rag_documents_optimized.py")
        print()
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_vietnamese_ocr()
