"""
Test RAG Processing với 20 PDFs sample
========================================

Test với variety of file sizes để đánh giá:
- Processing speed
- Output quality
- Error rate
- Estimated time for full batch
"""

import os
import sys
import json
import time
from pathlib import Path
from datetime import datetime

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

# Configuration
DOCUMENTS_ROOT = r"D:\Work\Coding\archi-query-master\Documents"
SAMPLE_SIZE = 20
RESULT_FILE = r"D:\Work\Coding\QSM\sample_test_results.json"

def setup_docling():
    """Setup Docling converter"""
    print("⚙️  Setting up Docling converter (CPU mode)...")
    
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
    return converter

def get_sample_pdfs():
    """Get diverse sample of PDFs (small, medium, large)"""
    print(f"🔍 Scanning for PDFs in {DOCUMENTS_ROOT}...")
    
    all_pdfs = []
    for root, dirs, files in os.walk(DOCUMENTS_ROOT):
        for file in files:
            if file.lower().endswith('.pdf'):
                path = os.path.join(root, file)
                size = os.path.getsize(path)
                all_pdfs.append((path, size))
    
    print(f"📚 Found {len(all_pdfs)} total PDFs")
    
    # Sort by size
    all_pdfs.sort(key=lambda x: x[1])
    
    # Get diverse sample: 7 small, 7 medium, 6 large
    total = len(all_pdfs)
    sample = []
    
    # Small (bottom 33%)
    small_section = all_pdfs[:total//3]
    sample.extend([p[0] for p in small_section[:7]])
    
    # Medium (middle 33%)
    medium_section = all_pdfs[total//3:2*total//3]
    sample.extend([p[0] for p in medium_section[:7]])
    
    # Large (top 33%)
    large_section = all_pdfs[2*total//3:]
    sample.extend([p[0] for p in large_section[:6]])
    
    print(f"✅ Selected {len(sample)} diverse samples")
    return sample

def process_pdf(pdf_path, converter):
    """Process single PDF and return results"""
    pdf_name = os.path.basename(pdf_path)
    size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    
    result = {
        "file": pdf_name,
        "path": pdf_path,
        "size_mb": round(size_mb, 2),
        "success": False,
        "time_seconds": 0,
        "output_length": 0,
        "error": None
    }
    
    print(f"\n📄 Processing: {pdf_name} ({size_mb:.2f} MB)")
    
    try:
        start_time = time.time()
        
        # Convert
        doc_result = converter.convert(pdf_path)
        markdown = doc_result.document.export_to_markdown()
        
        # Save output
        output_path = pdf_path.replace('.pdf', '.md')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        elapsed = time.time() - start_time
        
        result["success"] = True
        result["time_seconds"] = round(elapsed, 2)
        result["output_length"] = len(markdown)
        
        print(f"   ✅ Success - {elapsed:.1f}s - {len(markdown):,} chars")
        
    except Exception as e:
        result["error"] = str(e)
        print(f"   ❌ Error: {e}")
    
    return result

def analyze_results(results):
    """Analyze test results and provide estimates"""
    print("\n" + "="*80)
    print("📊 TEST RESULTS ANALYSIS")
    print("="*80 + "\n")
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    print()
    
    if successful:
        # Speed analysis
        times = [r["time_seconds"] for r in successful]
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)
        
        print(f"⏱️  PROCESSING SPEED:")
        print(f"   Average: {avg_time:.2f} seconds/file")
        print(f"   Min: {min_time:.2f}s")
        print(f"   Max: {max_time:.2f}s")
        print()
        
        # Size vs speed correlation
        print(f"📊 SIZE vs SPEED:")
        for r in sorted(successful, key=lambda x: x["size_mb"]):
            speed = r["output_length"] / r["time_seconds"] if r["time_seconds"] > 0 else 0
            print(f"   {r['size_mb']:6.2f} MB -> {r['time_seconds']:6.1f}s ({speed:,.0f} chars/sec)")
        print()
        
        # Output quality
        output_lengths = [r["output_length"] for r in successful]
        avg_output = sum(output_lengths) / len(output_lengths)
        
        print(f"📝 OUTPUT QUALITY:")
        print(f"   Average length: {avg_output:,.0f} characters")
        print(f"   Min: {min(output_lengths):,} chars")
        print(f"   Max: {max(output_lengths):,} chars")
        print()
        
        # Estimate full batch
        total_pdfs = 759  # From earlier scan
        estimated_time = avg_time * total_pdfs
        
        print(f"⏰ FULL BATCH ESTIMATE (759 PDFs):")
        print(f"   Average time per file: {avg_time:.1f}s")
        print(f"   Total estimated time: {estimated_time/60:.0f} minutes ({estimated_time/3600:.1f} hours)")
        print(f"   With {len(failed)} failures: ~{(total_pdfs - len(failed) * total_pdfs / len(results)) / total_pdfs * 100:.0f}% success rate")
        print()
    
    if failed:
        print(f"❌ FAILED FILES:")
        for r in failed:
            print(f"   {r['file']}: {r['error'][:80]}")
        print()
    
    # Recommendation
    print("💡 RECOMMENDATION:")
    if len(successful) >= 15:  # 75%+ success rate
        print("   ✅ Quality looks good! Safe to run full batch.")
        print(f"   ⏱️  Estimated time: {estimated_time/3600:.1f} hours")
        print()
        print("   Run full batch with:")
        print("   cd D:\\Work\\Coding\\QSM")
        print("   .\\python\\venv\\Scripts\\python.exe scripts\\batch_rag_documents.py")
    else:
        print("   ⚠️  Too many failures. Need to investigate issues first.")
        print("   Check error log and fix common problems before full batch.")
    
    print()

def main():
    print("="*80)
    print("🧪 SAMPLE RAG TEST - 20 PDFs")
    print("="*80)
    print()
    
    # Setup
    converter = setup_docling()
    sample_pdfs = get_sample_pdfs()
    
    if len(sample_pdfs) < SAMPLE_SIZE:
        print(f"⚠️  Only found {len(sample_pdfs)} PDFs (expected {SAMPLE_SIZE})")
    
    print()
    print("="*80)
    print("🚀 STARTING PROCESSING")
    print("="*80)
    
    results = []
    start_time = time.time()
    
    for i, pdf_path in enumerate(sample_pdfs, 1):
        print(f"\n[{i}/{len(sample_pdfs)}]", end=" ")
        result = process_pdf(pdf_path, converter)
        results.append(result)
    
    total_time = time.time() - start_time
    
    print("\n" + "="*80)
    print(f"✅ SAMPLE TEST COMPLETE - {total_time/60:.1f} minutes")
    print("="*80)
    
    # Save results
    output = {
        "timestamp": datetime.now().isoformat(),
        "sample_size": len(sample_pdfs),
        "total_time_seconds": round(total_time, 2),
        "results": results
    }
    
    with open(RESULT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Results saved to: {RESULT_FILE}\n")
    
    # Analysis
    analyze_results(results)

if __name__ == "__main__":
    main()
