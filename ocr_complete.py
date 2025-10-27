import sys, io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
from pathlib import Path
from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import PdfPipelineOptions, EasyOcrOptions
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Pt, Inches
from docx.enum.style import WD_STYLE_TYPE
from PIL import Image
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image as RLImage, Table as RLTable, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter
from ebooklib import epub
from docx.table import Table as DocxTable
import time
import re
import uuid
import cv2
import numpy as np
from pyzbar import pyzbar

# Supported formats - now includes PDF!
IMAGE_FORMATS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}
PDF_FORMAT = {".pdf"}
ALL_FORMATS = IMAGE_FORMATS | PDF_FORMAT

def header():
    print("="*70)
    print("🖼️  QSM - OCR Chuyển Ảnh/PDF Sang Word")
    print("="*70)
    print("Hỗ trợ: JPG, PNG, BMP, TIFF, PDF (scan)")
    print("="*70)

def setup():
    """Khởi tạo OCR converter cho ảnh và PDF"""
    print("🚀 Đang khởi động OCR engine...")
    
    # Tùy chọn OCR
    ocr_opts = EasyOcrOptions(
        lang=["vi", "en"],
        force_full_page_ocr=True
    )
    
    # Pipeline cho PDF
    pdf_pipeline_opts = PdfPipelineOptions()
    pdf_pipeline_opts.do_ocr = True
    pdf_pipeline_opts.do_table_structure = True
    pdf_pipeline_opts.ocr_options = ocr_opts
    
    # Pipeline cho ảnh
    img_pipeline_opts = PdfPipelineOptions()
    img_pipeline_opts.do_ocr = True
    img_pipeline_opts.do_table_structure = True
    img_pipeline_opts.ocr_options = ocr_opts
    
    # Tạo converter với cấu hình cho cả 2 loại
    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pdf_pipeline_opts),
            InputFormat.IMAGE: PdfFormatOption(pipeline_options=img_pipeline_opts)
        }
    )
    
    print("✓ OCR engine sẵn sàng (Tiếng Việt + English)")
    print("✓ Hỗ trợ PDF scan")
    print("✓ Hỗ trợ ảnh")
    print("✓ QR Code detection")
    print()
    return converter

def detect_qr_codes(image_path):
    """
    Detect and decode QR codes in image
    
    Args:
        image_path: Path to image file (or page extracted from PDF)
    
    Returns:
        List of QR code data dicts: [{"type": "QRCODE", "data": "...", "rect": (x,y,w,h)}, ...]
    """
    try:
        # Read image
        if isinstance(image_path, (str, Path)):
            img = cv2.imread(str(image_path))
        else:
            # Already numpy array (from PDF page)
            img = image_path
        
        if img is None:
            return []
        
        # Decode QR codes
        qr_codes = pyzbar.decode(img)
        
        results = []
        for qr in qr_codes:
            data = qr.data.decode('utf-8', errors='ignore')
            rect = qr.rect  # (x, y, width, height)
            qr_type = qr.type  # Usually 'QRCODE'
            
            results.append({
                'type': qr_type,
                'data': data,
                'rect': (rect.left, rect.top, rect.width, rect.height),
                'polygon': qr.polygon  # More precise boundary
            })
        
        return results
        
    except Exception as e:
        print(f"    [⚠] QR detection lỗi: {e}")
        return []

def is_pdf_scanned(pdf_path):
    """Check if PDF is scanned (image-based) or has text"""
    try:
        reader = PdfReader(pdf_path)
        total_text = ""
        
        # Check first 3 pages
        for page_num in range(min(3, len(reader.pages))):
            page = reader.pages[page_num]
            text = page.extract_text()
            total_text += text
        
        # If very little text, likely scanned
        if len(total_text.strip()) < 50:
            return True, "scanned"
        else:
            return False, "text-based"
    except:
        return True, "unknown"

def proc(p, c, o):
    """Process single file (image or PDF) and return OCR result"""
    try:
        p = Path(p).resolve()
        if not p.exists(): 
            print(f"[✗] Not found: {p}")
            return None
        
        suffix = p.suffix.lower()
        if suffix not in ALL_FORMATS:
            print(f"[!] Unsupported format: {suffix}")
            return None
        
        # File info
        file_size_mb = p.stat().st_size / (1024 * 1024)
        print(f"\n[→] {p.name} ({file_size_mb:.2f} MB)")
        
        # Check if PDF is scanned
        if suffix == ".pdf":
            is_scanned, pdf_type = is_pdf_scanned(p)
            print(f"    Type: PDF ({pdf_type})")
            
            if not is_scanned:
                print(f"    [!] Warning: This PDF already has text.")
                print(f"        OCR will still run but may not be necessary.")
        else:
            print(f"    Type: Image")
        
        # Detect QR codes BEFORE OCR (faster)
        print("    Đang phát hiện QR codes...")
        qr_codes = []
        try:
            if suffix in IMAGE_FORMATS:
                # Direct image
                qr_codes = detect_qr_codes(p)
            elif suffix == ".pdf":
                # Extract first page as image for QR detection
                # (Skip for multi-page PDFs - would be too slow)
                reader = PdfReader(p)
                if len(reader.pages) == 1:
                    # Convert PDF page to image for QR detection
                    from pdf2image import pdfimage
                    # Note: This requires poppler, skip if not available
                    pass
        except Exception as e:
            print(f"    [⚠] QR detection bỏ qua: {e}")
        
        if qr_codes:
            print(f"    [✓] Tìm thấy {len(qr_codes)} QR code(s)")
            for idx, qr in enumerate(qr_codes, 1):
                print(f"        QR {idx}: {qr['data'][:50]}...")
        
        # Run OCR
        print("    Đang xử lý OCR...")
        t = time.time()
        result = c.convert(str(p))
        duration = time.time() - t
        
        # Extract text and tables
        txt = result.document.export_to_markdown()
        
        if not txt.strip():
            print("    [✗] Không trích xuất được văn bản")
            return None
        
        # Analyze tables (Docling detects tables automatically)
        tables_found = txt.count('|')  # Markdown tables use |
        has_tables = tables_found > 10  # More than 10 pipes = likely has tables
        
        word_count = len(txt.split())
        print(f"    [✓] Xong trong {duration:.1f}s")
        print(f"    [✓] Trích xuất {word_count} từ")
        if has_tables:
            print(f"    [✓] Phát hiện bảng biểu (Docling table detection)")
        
        # Return result dict with enhanced metadata
        return {
            'path': p,
            'text': txt,
            'word_count': word_count,
            'time': duration,
            'type': 'pdf' if suffix == '.pdf' else 'image',
            'has_tables': has_tables,
            'qr_codes': qr_codes,  # NEW: QR code data
            'raw_result': result  # Keep raw result for advanced processing
        }
        
    except Exception as e:
        print(f"    [✗] ERROR: {e}")
        import traceback
        traceback.print_exc()
        return None

def extract_page_number(filename):
    """Extract page number from filename for sorting"""
    # Try to find numbers in filename
    numbers = re.findall(r'\d+', filename)
    if numbers:
        # Return first number found (usually page number)
        return int(numbers[0])
    return 0

def sort_files_by_page(files):
    """Sort files by page number extracted from filename"""
    return sorted(files, key=lambda f: (extract_page_number(f.stem), f.name))

def create_merged_document(results, output_dir, doc_name="merged_document"):
    """Create merged Word and Markdown from OCR results"""
    
    # Sort results by page number
    sorted_results = sorted(results, key=lambda r: extract_page_number(r['path'].stem))
    
    print("\n[*] Creating merged document...")
    print(f"    Page order: {', '.join([r['path'].stem[:20] + '...' if len(r['path'].stem) > 20 else r['path'].stem for r in sorted_results])}")
    
    # Create merged Markdown
    md_content = f"# Merged OCR Document\n\n"
    md_content += f"*Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}*\n\n"
    md_content += f"*Total pages: {len(sorted_results)}*\n\n"
    md_content += "---\n\n"
    
    for idx, result in enumerate(sorted_results, 1):
        md_content += f"## Page {idx} - {result['path'].name}\n\n"
        md_content += result['text']
        md_content += f"\n\n---\n\n"
    
    md_file = output_dir / f"{doc_name}.md"
    md_file.write_text(md_content, encoding="utf-8")
    print(f"    [✓] Markdown: {md_file.name}")
    
    # Create merged Word document
    doc = Document()
    
    # Title page
    title = doc.add_heading('OCR Merged Document', 0)
    title.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    
    # Metadata
    meta = doc.add_paragraph()
    meta.add_run(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n").italic = True
    meta.add_run(f"Total Pages: {len(sorted_results)}\n").italic = True
    meta.add_run(f"Total Words: {sum(r['word_count'] for r in sorted_results)}\n").italic = True
    meta.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    
    doc.add_page_break()
    
    # Add each page
    for idx, result in enumerate(sorted_results, 1):
        # Page header
        page_heading = doc.add_heading(f'Trang {idx}', 1)
        
        # Source info
        source = doc.add_paragraph()
        source.add_run(f"Nguồn: {result['path'].name}\n").italic = True
        source.add_run(f"Số từ: {result['word_count']}").italic = True
        if result.get('has_tables'):
            source.add_run("\n✓ Có bảng biểu").bold = True
        
        # Add separator
        doc.add_paragraph("_" * 50)
        
        # Content - improved table handling
        text_content = result['text']
        
        # Split by double newline to preserve structure
        paragraphs = text_content.split('\n\n')
        
        for para_text in paragraphs:
            if not para_text.strip():
                continue
            
            # Check if this is a Markdown table
            if '|' in para_text and para_text.count('|') > 2:
                # This is likely a table
                try:
                    lines = para_text.strip().split('\n')
                    # Filter out separator lines (like |---|---|)
                    table_lines = [line for line in lines if not all(c in '|-: ' for c in line)]
                    
                    if len(table_lines) > 0:
                        # Parse table
                        rows = []
                        for line in table_lines:
                            # Split by | and clean
                            cells = [cell.strip() for cell in line.split('|')]
                            # Remove empty first/last cells (from leading/trailing |)
                            cells = [c for c in cells if c]
                            if cells:
                                rows.append(cells)
                        
                        if rows:
                            # Create Word table
                            num_cols = max(len(row) for row in rows)
                            table = doc.add_table(rows=len(rows), cols=num_cols)
                            table.style = 'Light Grid Accent 1'
                            
                            # Fill table
                            for i, row_data in enumerate(rows):
                                for j, cell_text in enumerate(row_data):
                                    if j < num_cols:
                                        cell = table.rows[i].cells[j]
                                        cell.text = cell_text
                                        # Bold first row (header)
                                        if i == 0:
                                            cell.paragraphs[0].runs[0].font.bold = True
                            
                            doc.add_paragraph()  # Space after table
                            continue
                except Exception as e:
                    # If table parsing fails, fall back to normal text
                    print(f"    [⚠] Lỗi parse bảng: {e}")
            
            # Normal text (not a table)
            if para_text.startswith('#'):
                # Heading
                level = min(para_text.count('#', 0, 3), 2) + 1
                text_clean = para_text.lstrip('#').strip()
                doc.add_heading(text_clean, level)
            else:
                # Normal paragraph
                p = doc.add_paragraph(para_text.strip())
                p.paragraph_format.line_spacing = 1.5
        
        # Page break (except last page)
        if idx < len(sorted_results):
            doc.add_page_break()
    
    docx_file = output_dir / f"{doc_name}.docx"
    doc.save(str(docx_file))
    print(f"    [✓] Word: {docx_file.name}")
    
    return md_file, docx_file

def create_pdf_from_images(image_paths, output_path):
    """Create PDF from original images (preserving quality)"""
    try:
        print(f"\n[*] Creating PDF from images...")
        
        # Filter only image files
        valid_images = [p for p in image_paths if p.suffix.lower() in IMAGE_FORMATS]
        
        if not valid_images:
            print("    [!] No image files to convert")
            return None
        
        # Open all images and convert to RGB
        images = []
        for img_path in valid_images:
            img = Image.open(img_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(img)
        
        # Save as PDF
        if images:
            images[0].save(
                output_path,
                save_all=True,
                append_images=images[1:],
                resolution=100.0,
                quality=95,
                optimize=True
            )
            print(f"    [✓] Image PDF: {output_path.name} ({len(images)} pages)")
            return output_path
    except Exception as e:
        print(f"    [✗] Failed to create image PDF: {e}")
        return None

def create_pdf_from_ocr(results, output_path):
    """Create PDF from OCR text content with Vietnamese font support"""
    try:
        print(f"\n[*] Tạo PDF từ văn bản OCR...")
        
        # Register Vietnamese-compatible font (DejaVu Sans has Vietnamese)
        # Try to use system fonts that support Vietnamese
        try:
            # Windows fonts
            pdfmetrics.registerFont(TTFont('VietnameseFont', 'C:/Windows/Fonts/arial.ttf'))
            pdfmetrics.registerFont(TTFont('VietnameseBold', 'C:/Windows/Fonts/arialbd.ttf'))
            font_name = 'VietnameseFont'
            font_bold = 'VietnameseBold'
            print("    [✓] Đã load font Arial (hỗ trợ tiếng Việt)")
        except:
            try:
                # Fallback to DejaVu (included in reportlab)
                from reportlab.pdfbase.cidfonts import UnicodeCIDFont
                pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
                font_name = 'STSong-Light'
                font_bold = 'STSong-Light'
                print("    [!] Dùng font dự phòng (có thể không đẹp)")
            except:
                font_name = 'Helvetica'
                font_bold = 'Helvetica-Bold'
                print("    [⚠] Cảnh báo: Không tìm thấy font tiếng Việt, dấu có thể bị lỗi")
        
        # Create PDF document
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch
        )
        
        # Styles with Vietnamese font
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontName=font_bold,
            fontSize=24,
            textColor='#2C3E50',
            spaceAfter=30,
            alignment=TA_CENTER
        )
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontName=font_bold,
            fontSize=16,
            textColor='#34495E',
            spaceAfter=12,
            spaceBefore=12
        )
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            spaceAfter=10
        )
        meta_style = ParagraphStyle(
            'Meta',
            parent=styles['Normal'],
            fontName=font_name,
            fontSize=9,
            textColor='#7F8C8D',
            alignment=TA_CENTER,
            spaceAfter=20
        )
        
        # Build content
        story = []
        
        # Title page
        story.append(Paragraph("OCR Merged Document", title_style))
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}", meta_style))
        story.append(Paragraph(f"Total Pages: {len(results)}", meta_style))
        story.append(Paragraph(f"Total Words: {sum(r['word_count'] for r in results)}", meta_style))
        story.append(PageBreak())
        
        # Add each page
        for idx, result in enumerate(results, 1):
            # Page header
            story.append(Paragraph(f"Page {idx}", heading_style))
            story.append(Paragraph(f"Source: {result['path'].name}", meta_style))
            
            # QR codes section
            if result.get('qr_codes'):
                story.append(Spacer(1, 0.05*inch))
                qr_text = f"<b>QR Codes:</b> Found {len(result['qr_codes'])}"
                story.append(Paragraph(qr_text, meta_style))
                for qr_idx, qr in enumerate(result['qr_codes'], 1):
                    qr_data = qr['data'][:100]  # Limit length
                    story.append(Paragraph(f"  QR{qr_idx}: {qr_data}", meta_style))
            
            story.append(Spacer(1, 0.1*inch))
            
            # Content with improved table handling
            text = result['text']
            paragraphs = text.split('\n\n')
            
            for para in paragraphs:
                if not para.strip():
                    continue
                
                # Check if this is a Markdown table
                if '|' in para and para.count('|') > 2:
                    # This is likely a table
                    try:
                        lines = para.strip().split('\n')
                        # Filter out separator lines (like |---|---|)
                        table_lines = [line for line in lines if not all(c in '|-: ' for c in line)]
                        
                        if len(table_lines) > 0:
                            # Parse table
                            rows = []
                            for line in table_lines:
                                # Split by | and clean
                                cells = [cell.strip() for cell in line.split('|')]
                                # Remove empty first/last cells (from leading/trailing |)
                                cells = [c for c in cells if c]
                                if cells:
                                    # Wrap each cell in Paragraph for Vietnamese font support
                                    cell_paras = [Paragraph(cell, normal_style) for cell in cells]
                                    rows.append(cell_paras)
                            
                            if rows:
                                # Create ReportLab Table
                                table = RLTable(rows)
                                
                                # Table styling
                                table_style = TableStyle([
                                    # Header row (first row)
                                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
                                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                    ('FONTNAME', (0, 0), (-1, 0), font_bold),
                                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                                    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                                    ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
                                    
                                    # All cells
                                    ('FONTNAME', (0, 1), (-1, -1), font_name),
                                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                                    ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
                                    ('VALIGN', (0, 1), (-1, -1), 'TOP'),
                                    
                                    # Borders
                                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                                    ('BOX', (0, 0), (-1, -1), 1, colors.black),
                                    
                                    # Padding
                                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                                ])
                                table.setStyle(table_style)
                                
                                story.append(table)
                                story.append(Spacer(1, 0.1*inch))
                                continue
                    except Exception as e:
                        # If table parsing fails, fall back to normal text
                        print(f"    [⚠] Lỗi parse bảng cho PDF: {e}")
                
                # Normal text (not a table)
                clean_text = para.strip().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                
                # Check if heading
                if clean_text.startswith('#'):
                    clean_text = clean_text.lstrip('#').strip()
                    story.append(Paragraph(clean_text, heading_style))
                else:
                    story.append(Paragraph(clean_text, normal_style))
            
            # Page break (except last)
            if idx < len(results):
                story.append(PageBreak())
        
        # Build PDF
        doc.build(story)
        print(f"    [✓] Text PDF: {output_path.name} (with table formatting)")
        return output_path
        
    except Exception as e:
        print(f"    [✗] Failed to create text PDF: {e}")
        import traceback
        traceback.print_exc()
        return None

def extract_tables_to_excel(results, output_path):
    """
    [PHASE 2 FEATURE] Extract tables from OCR results to Excel
    
    This function extracts all tables detected by Docling and exports them
    to a formatted Excel file. Perfect for Vietnamese invoice OCR!
    
    Args:
        results: List of OCR result dicts
        output_path: Path to save Excel file
    
    Returns:
        Path to Excel file or None if failed
    """
    try:
        # Check if openpyxl is installed (Phase 2 dependency)
        try:
            import openpyxl
            from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
        except ImportError:
            print("    [!] Excel export cần cài openpyxl:")
            print("    pip install openpyxl")
            return None
        
        print(f"\n[*] Trích xuất bảng biểu ra Excel...")
        
        # Create workbook
        wb = openpyxl.Workbook()
        wb.remove(wb.active)  # Remove default sheet
        
        table_count = 0
        
        # Process each result
        for idx, result in enumerate(results, 1):
            text = result['text']
            
            # Find all tables in markdown
            paragraphs = text.split('\n\n')
            page_table_count = 0
            
            for para in paragraphs:
                if '|' not in para or para.count('|') < 3:
                    continue
                
                # Parse table
                lines = para.strip().split('\n')
                table_lines = [line for line in lines if not all(c in '|-: ' for c in line)]
                
                if len(table_lines) < 2:  # Need at least header + 1 row
                    continue
                
                # Parse rows
                rows = []
                for line in table_lines:
                    cells = [cell.strip() for cell in line.split('|')]
                    cells = [c for c in cells if c]
                    if cells:
                        rows.append(cells)
                
                if not rows:
                    continue
                
                # Create worksheet for this table
                page_table_count += 1
                table_count += 1
                sheet_name = f"Trang{idx}_Bảng{page_table_count}"[:31]  # Excel limit
                ws = wb.create_sheet(title=sheet_name)
                
                # Write data
                for row_idx, row_data in enumerate(rows, 1):
                    for col_idx, cell_value in enumerate(row_data, 1):
                        cell = ws.cell(row=row_idx, column=col_idx, value=cell_value)
                        
                        # Format header row
                        if row_idx == 1:
                            cell.font = Font(bold=True, color="FFFFFF")
                            cell.fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
                            cell.alignment = Alignment(horizontal='center', vertical='center')
                        else:
                            cell.alignment = Alignment(horizontal='left', vertical='center')
                        
                        # Add borders
                        thin_border = Border(
                            left=Side(style='thin'),
                            right=Side(style='thin'),
                            top=Side(style='thin'),
                            bottom=Side(style='thin')
                        )
                        cell.border = thin_border
                
                # Auto-adjust column width
                for column in ws.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)  # Max 50 chars
                    ws.column_dimensions[column_letter].width = adjusted_width
        
        if table_count == 0:
            print("    [!] Không tìm thấy bảng biểu nào")
            return None
        
        # Save workbook
        wb.save(output_path)
        print(f"    [✓] Excel: {output_path.name} ({table_count} bảng)")
        return output_path
        
    except Exception as e:
        print(f"    [✗] Lỗi xuất Excel: {e}")
        import traceback
        traceback.print_exc()
        return None

def create_epub(results, output_path, book_title="OCR Document", author="QSM OCR"):
    """Create EPUB ebook from OCR results"""
    try:
        print(f"\n[*] Tạo EPUB ebook...")
        
        # Create book
        book = epub.EpubBook()
        
        # Set metadata
        book.set_identifier(str(uuid.uuid4()))
        book.set_title(book_title)
        book.set_language('vi')  # Vietnamese
        book.add_author(author)
        
        # Create chapters
        chapters = []
        spine = ['nav']
        
        for idx, result in enumerate(results, 1):
            # Create chapter
            chapter = epub.EpubHtml(
                title=f'Page {idx}',
                file_name=f'page_{idx}.xhtml',
                lang='vi'
            )
            
            # Build HTML content
            content = f'<h1>Page {idx}</h1>'
            content += f'<p><em>Source: {result["path"].name}</em></p>'
            content += '<hr/>'
            
            # Convert markdown to HTML
            text = result['text']
            paragraphs = text.split('\n\n')
            
            for para in paragraphs:
                if para.strip():
                    # Clean HTML
                    clean = para.strip().replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    
                    if clean.startswith('#'):
                        # Heading
                        level = min(clean.count('#', 0, 3), 3)
                        text_clean = clean.lstrip('#').strip()
                        content += f'<h{level + 1}>{text_clean}</h{level + 1}>'
                    else:
                        # Paragraph
                        content += f'<p>{clean}</p>'
            
            chapter.content = content
            
            # Add to book
            book.add_item(chapter)
            chapters.append(chapter)
            spine.append(chapter)
        
        # Add default NCX and Nav files
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())
        
        # Define CSS style
        style = '''
            @namespace epub "http://www.idpf.org/2007/ops";
            body { font-family: Georgia, serif; margin: 2em; }
            h1 { color: #2C3E50; border-bottom: 2px solid #3498DB; padding-bottom: 0.3em; }
            h2, h3 { color: #34495E; }
            p { text-align: justify; line-height: 1.6; }
            em { color: #7F8C8D; }
        '''
        nav_css = epub.EpubItem(
            uid="style_nav",
            file_name="style/nav.css",
            media_type="text/css",
            content=style
        )
        book.add_item(nav_css)
        
        # Create spine
        book.spine = spine
        
        # Add table of contents
        book.toc = tuple(chapters)
        
        # Write EPUB
        epub.write_epub(str(output_path), book, {})
        print(f"    [✓] EPUB: {output_path.name} ({len(chapters)} chapters)")
        return output_path
        
    except Exception as e:
        print(f"    [✗] Failed to create EPUB: {e}")
        import traceback
        traceback.print_exc()
        return None

def get_files():
    """Get files from user input (supports drag & drop)"""
    print("Cách thêm file:")
    print("  1. Kéo thả file/folder vào đây")
    print("  2. Gõ đường dẫn file")
    print("  3. Gõ 'done' khi xong\n")
    
    fs = []
    seen = set()  # Tránh trùng lặp
    
    while True:
        i = input(">>> ").strip()
        if not i: 
            continue
        if i.lower() in ["done", "q", "exit", "xong"]: 
            break
        
        # Bỏ PowerShell syntax: & '...' hoặc & "..."
        i = re.sub(r'^&\s+', '', i)
        
        # Xử lý Windows drag & drop với dấu ngoặc kép
        # Ví dụ: "C:\file1.pdf" "C:\file2.pdf" "C:\file3.pdf"
        # Hoặc PowerShell: 'C:\file1.pdf' 'C:\file2.pdf'
        paths = re.findall(r'"([^"]+)"', i)
        if not paths:
            paths = re.findall(r"'([^']+)'", i)
        if not paths:
            # Nếu không có dấu ngoặc, coi như 1 đường dẫn
            paths = [i.strip('"').strip("'")]
        
        for path_str in paths:
            try:
                # Windows path có thể có \ hoặc /, Python xử lý được cả 2
                p = Path(path_str.strip()).resolve()
                
                # Kiểm tra folder
                if p.is_dir():
                    print(f"   [→] Quét folder: {p.name}")
                    found_files = []
                    for fmt in ALL_FORMATS:
                        found_files.extend(p.glob(f"*{fmt}"))
                        found_files.extend(p.glob(f"*{fmt.upper()}"))
                    
                    for f in found_files:
                        if f not in seen:
                            fs.append(f)
                            seen.add(f)
                            print(f"      [+] {f.name}")
                    
                    if not found_files:
                        print(f"      [!] Không tìm thấy file nào")
                
                # Kiểm tra file
                elif p.exists() and p.is_file():
                    suffix = p.suffix.lower()
                    if suffix in ALL_FORMATS:
                        if p not in seen:
                            fs.append(p)
                            seen.add(p)
                            print(f"   [+] {p.name}")
                    else:
                        print(f"   [✗] Format không hỗ trợ: {p.name} (chỉ chấp nhận: {', '.join(ALL_FORMATS)})")
                else:
                    print(f"   [✗] Không tìm thấy file: {path_str}")
                    
            except Exception as e:
                print(f"   [✗] Lỗi đường dẫn: {path_str} ({e})")
    
    return fs

def main():
    header()
    converter = setup()
    
    # Lấy danh sách file
    files = get_files()
    
    if not files:
        print("\n[!] Không có file nào được chọn")
        input("Nhấn Enter để thoát...")
        return
    
    # Sắp xếp theo số trang
    files = sort_files_by_page(files)
    
    # Hiển thị danh sách
    print(f"\n{'='*70}")
    print(f"📄 Danh sách file cần xử lý ({len(files)} file):")
    for idx, f in enumerate(files, 1):
        print(f"  {idx}. {f.name}")
    print(f"{'='*70}\n")
    
    # Xác nhận
    print("⚡ Bắt đầu xử lý? (y/n): ", end='')
    confirm = input().strip().lower()
    if confirm not in ['y', 'yes', 'có', '']:
        print("❌ Đã hủy.")
        return
    
    # Tạo thư mục output
    output_dir = Path(__file__).parent / "ocr_output"
    output_dir.mkdir(exist_ok=True)
    
    # Xử lý tất cả file
    print(f"\n{'='*70}")
    print("⚙️  ĐANG XỬ LÝ...")
    print(f"{'='*70}")
    
    results = []
    start_time = time.time()
    
    for f in files:
        result = proc(f, converter, output_dir)
        if result:
            results.append(result)
    
    total_time = time.time() - start_time
    
    # Summary
    print(f"\n{'='*70}")
    print(f"TỔNG KẾT")
    print(f"{'='*70}")
    print(f"Đã xử lý: {len(results)}/{len(files)} file")
    print(f"Tổng thời gian: {total_time:.1f}s")
    print(f"Tổng số từ: {sum(r['word_count'] for r in results)}")
    
    # Count tables
    tables_count = sum(1 for r in results if r.get('has_tables', False))
    if tables_count > 0:
        print(f"📊 File có bảng biểu: {tables_count}")
    
    # Count QR codes
    qr_count = sum(len(r.get('qr_codes', [])) for r in results)
    if qr_count > 0:
        print(f"📱 Tìm thấy {qr_count} QR code(s)")
        # Show QR data
        for idx, r in enumerate(results, 1):
            if r.get('qr_codes'):
                print(f"   File {idx} ({r['path'].name}):")
                for qr_idx, qr in enumerate(r['qr_codes'], 1):
                    print(f"     QR{qr_idx}: {qr['data'][:60]}...")
    
    print(f"{'='*70}")
    
    if not results:
        print("\n[!] Không có kết quả OCR thành công")
        input("Nhấn Enter để thoát...")
        return
    
    # Create merged document
    print("\nTạo tài liệu gộp? (y/n): ", end='')
    choice = input().strip().lower()
    
    if choice in ['y', 'yes', 'có', '']:
        # Get document name
        print("Tên tài liệu (mặc định: merged_document): ", end='')
        doc_name = input().strip() or "merged_document"
        
        # Create Word and Markdown
        create_merged_document(results, output_dir, doc_name)
        
        # Ask for PDF options
        print("\nTạo PDF? (image/text/both/no): ", end='')
        pdf_choice = input().strip().lower()
        
        if pdf_choice in ['image', 'i', 'both', 'b']:
            # PDF from original images
            image_paths = [r['path'] for r in results]
            pdf_img = output_dir / f"{doc_name}_images.pdf"
            create_pdf_from_images(image_paths, pdf_img)
        
        if pdf_choice in ['text', 't', 'both', 'b']:
            # PDF from OCR text
            pdf_text = output_dir / f"{doc_name}_text.pdf"
            create_pdf_from_ocr(results, pdf_text)
        
        # Ask for Excel export (PHASE 2 FEATURE - for invoices/tables)
        has_any_tables = any(r.get('has_tables', False) for r in results)
        if has_any_tables:
            print("\n💡 Phát hiện bảng biểu! Xuất ra Excel? (y/n): ", end='')
            excel_choice = input().strip().lower()
            
            if excel_choice in ['y', 'yes', 'có', '']:
                excel_file = output_dir / f"{doc_name}_tables.xlsx"
                extract_tables_to_excel(results, excel_file)
        
        # Ask for EPUB
        print("\nTạo EPUB ebook? (y/n): ", end='')
        epub_choice = input().strip().lower()
        
        if epub_choice in ['y', 'yes', 'có', '']:
            print("Tên sách (mặc định: OCR Document): ", end='')
            book_title = input().strip() or "OCR Document"
            print("Tác giả (mặc định: QSM OCR): ", end='')
            author = input().strip() or "QSM OCR"
            
            epub_file = output_dir / f"{doc_name}.epub"
            create_epub(results, epub_file, book_title, author)
    
    # Save individual files
    print(f"\nLưu từng file riêng lẻ? (y/n): ", end='')
    save_individual = input().strip().lower()
    
    if save_individual in ['y', 'yes', 'có', '']:
        print(f"\n[*] Đang lưu từng file...")
        for result in results:
            p = result['path']
            txt = result['text']
            
            # Individual Markdown
            md = output_dir / f"{p.stem}_page.md"
            md.write_text(f"# {p.stem}\n\n{txt}", encoding="utf-8")
            
            # Individual Word
            doc = Document()
            doc.add_heading(f"Trang - {p.stem}", 0)
            doc.add_paragraph(f"Nguồn: {p.name}").italic = True
            for par in txt.split("\n\n"):
                if par.strip():
                    doc.add_paragraph(par.strip())
            dx = output_dir / f"{p.stem}_page.docx"
            doc.save(str(dx))
        
        print(f"    [✓] {len(results)} file đã lưu")
    
    # Done
    print(f"\n{'='*70}")
    print(f"✓ HOÀN TẤT!")
    print(f"Thư mục output: {output_dir}")
    print(f"{'='*70}\n")
    input("Nhấn Enter để thoát...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[!] Cancelled by user")
        input("Press Enter to exit...")
    except Exception as e:
        print(f"\n[✗] FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        input("Press Enter to exit...")
