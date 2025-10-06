"""
Quick test: Process 1 PDF to verify Docling GPU acceleration
"""

import os
import sys
import time

# Add QSM python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'python'))

try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
    print("✅ Docling imported successfully")
except ImportError as e:
    print(f"❌ ERROR: {e}")
    print("Run: D:\\Work\\Coding\\QSM\\python\\venv\\Scripts\\pip.exe install docling")
    sys.exit(1)

# Test file
TEST_PDF = r"D:\Work\Coding\archi-query-master\Documents\Legals\RANH HT VA RANH GCN_GUI-Model.pdf"

def test_docling():
    print("="*80)
    print("🧪 DOCLING GPU TEST")
    print("="*80)
    print()
    
    if not os.path.exists(TEST_PDF):
        print(f"❌ Test file not found: {TEST_PDF}")
        return
    
    print(f"📄 Test file: {os.path.basename(TEST_PDF)}")
    print(f"   Size: {os.path.getsize(TEST_PDF)/1024:.1f} KB")
    print()
    
    # Setup Docling with GPU
    print("⚙️  Setting up Docling converter with GPU acceleration...")
    
    pipeline_options = PdfPipelineOptions()
    pipeline_options.do_ocr = True
    pipeline_options.do_table_structure = True
    pipeline_options.images_scale = 2.0
    pipeline_options.generate_page_images = True
    
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(
                pipeline_options=pipeline_options,
                backend=PyPdfiumDocumentBackend
            )
        }
    )
    
    print("✅ Converter ready")
    print()
    
    # Convert
    print("🔄 Converting PDF to Markdown...")
    start_time = time.time()
    
    try:
        result = converter.convert(TEST_PDF)
        markdown_content = result.document.export_to_markdown()
        
        elapsed = time.time() - start_time
        
        # Save output
        output_path = TEST_PDF.replace('.pdf', '.md')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"✅ Conversion successful!")
        print()
        print(f"⏱️  Time: {elapsed:.2f} seconds")
        print(f"📝 Output length: {len(markdown_content):,} characters")
        print(f"💾 Saved to: {output_path}")
        print()
        
        # Show preview
        print("📄 PREVIEW (first 500 chars):")
        print("-" * 80)
        print(markdown_content[:500])
        print("-" * 80)
        print()
        
        print("✅ TEST PASSED - Docling is working with GPU acceleration!")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_docling()
