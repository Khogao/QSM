"""
QSM - QueryMaster: Docling Document Processor

This script processes documents using IBM Docling for advanced document understanding.
Supports PDF, DOCX, images with TableFormer, OCR, and enrichment features.

Usage:
    python docling_processor.py <input_file> [options]

Options:
    --output-format: markdown, json, html (default: markdown)
    --enable-ocr: Enable OCR for scanned documents
    --enable-tables: Enable table structure recognition
    --ocr-lang: Comma-separated language codes (default: en,vi)
    --enable-formulas: Enable formula to LaTeX conversion
    --enable-code: Enable code block recognition
"""

import sys
import json
import argparse
from pathlib import Path
from typing import Optional, Dict, List, Any

# Check if docling is installed
try:
    from docling.document_converter import DocumentConverter, PdfFormatOption
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import (
        PdfPipelineOptions,
        EasyOcrOptions,
        TableFormerMode
    )
    DOCLING_AVAILABLE = True
except ImportError:
    DOCLING_AVAILABLE = False
    print(json.dumps({
        'error': 'Docling not installed',
        'message': 'Please install: pip install docling',
        'status': 'missing_dependency'
    }))
    sys.exit(1)


def process_document(
    input_file: str,
    output_format: str = 'markdown',
    enable_ocr: bool = False,
    enable_tables: bool = True,
    ocr_languages: List[str] = None,
    enable_formulas: bool = False,
    enable_code: bool = False
) -> Dict[str, Any]:
    """
    Process a document using Docling.
    
    Args:
        input_file: Path to input document
        output_format: Output format (markdown, json, html)
        enable_ocr: Enable OCR processing
        enable_tables: Enable table structure recognition
        ocr_languages: List of language codes for OCR
        enable_formulas: Enable formula recognition
        enable_code: Enable code recognition
        
    Returns:
        Dictionary with processing results
    """
    
    if ocr_languages is None:
        ocr_languages = ['en', 'vi']
    
    try:
        # Configure pipeline options
        pipeline_options = PdfPipelineOptions()
        pipeline_options.do_ocr = enable_ocr
        pipeline_options.do_table_structure = enable_tables
        pipeline_options.do_formula_enrichment = enable_formulas
        pipeline_options.do_code_enrichment = enable_code
        
        # Configure table structure for best quality
        if enable_tables:
            pipeline_options.table_structure_options.mode = TableFormerMode.ACCURATE
            pipeline_options.table_structure_options.do_cell_matching = True
        
        # Configure OCR options
        if enable_ocr:
            pipeline_options.ocr_options = EasyOcrOptions(
                lang=ocr_languages,
                force_full_page_ocr=False  # Only OCR bitmap areas by default
            )
        
        # Create document converter
        converter = DocumentConverter(
            format_options={
                InputFormat.PDF: PdfFormatOption(
                    pipeline_options=pipeline_options
                )
            }
        )
        
        # Convert document
        result = converter.convert(input_file)
        doc = result.document
        
        # Extract content based on format
        if output_format == 'markdown':
            content = doc.export_to_markdown()
        elif output_format == 'json':
            content = doc.export_to_dict()
        elif output_format == 'html':
            content = doc.export_to_html()
        else:
            content = doc.export_to_markdown()
        
        # Extract tables separately for better RAG processing
        tables = []
        for idx, table in enumerate(doc.tables):
            try:
                tables.append({
                    'index': idx,
                    'markdown': table.export_to_markdown(),
                    'html': table.export_to_html(),
                    'rows': table.num_rows,
                    'cols': table.num_cols,
                    # Note: export_to_dataframe() requires pandas
                    # 'data': table.export_to_dataframe().values.tolist()
                })
            except Exception as e:
                tables.append({
                    'index': idx,
                    'error': str(e)
                })
        
        # Build response
        response = {
            'status': 'success',
            'content': content,
            'tables': tables,
            'metadata': {
                'pages': len(doc.pages),
                'has_tables': len(tables) > 0,
                'table_count': len(tables),
                'confidence': {
                    'mean': float(result.confidence.mean_grade.value) if hasattr(result.confidence, 'mean_grade') else 1.0,
                    'low': float(result.confidence.low_grade.value) if hasattr(result.confidence, 'low_grade') else 1.0
                },
                'processing_time': 0,  # TODO: Add timing
                'file_size': Path(input_file).stat().st_size
            },
            'features': {
                'ocr_enabled': enable_ocr,
                'tables_enabled': enable_tables,
                'formulas_enabled': enable_formulas,
                'code_enabled': enable_code
            }
        }
        
        return response
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e),
            'error_type': type(e).__name__
        }


def main():
    """Main entry point for CLI usage."""
    
    parser = argparse.ArgumentParser(
        description='QSM - QueryMaster: Process documents with IBM Docling'
    )
    
    parser.add_argument(
        'input_file',
        type=str,
        help='Path to input document (PDF, DOCX, image, etc.)'
    )
    
    parser.add_argument(
        '--output-format',
        choices=['markdown', 'json', 'html'],
        default='markdown',
        help='Output format (default: markdown)'
    )
    
    parser.add_argument(
        '--enable-ocr',
        action='store_true',
        help='Enable OCR for scanned documents'
    )
    
    parser.add_argument(
        '--enable-tables',
        action='store_true',
        default=True,
        help='Enable table structure recognition (default: True)'
    )
    
    parser.add_argument(
        '--ocr-lang',
        type=str,
        default='en,vi',
        help='Comma-separated language codes (default: en,vi)'
    )
    
    parser.add_argument(
        '--enable-formulas',
        action='store_true',
        help='Enable formula to LaTeX conversion'
    )
    
    parser.add_argument(
        '--enable-code',
        action='store_true',
        help='Enable code block recognition'
    )
    
    parser.add_argument(
        '--force-ocr',
        action='store_true',
        help='Force full-page OCR (slower but more accurate)'
    )
    
    args = parser.parse_args()
    
    # Parse language codes
    ocr_languages = [lang.strip() for lang in args.ocr_lang.split(',')]
    
    # Process document
    result = process_document(
        input_file=args.input_file,
        output_format=args.output_format,
        enable_ocr=args.enable_ocr,
        enable_tables=args.enable_tables,
        ocr_languages=ocr_languages,
        enable_formulas=args.enable_formulas,
        enable_code=args.enable_code
    )
    
    # Output as JSON for easy parsing by Node.js
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
