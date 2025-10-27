# 📐 SO SÁNH IMPLEMENTATION CỦA CÁC DOCUMENT PROCESSING ENGINES

## 🏆 IBM DOCLING (Trong QSM)

### Architecture
```
PDF/Images → Docling Python API
              ↓
         Layout Models (Beehive/Heron)
              ↓
         TableFormer (Transformer)
              ↓
         OCR Integration
              ↓
         Output với coordinates
```

### Key Implementation Details
- **Models**: 500MB+ pre-trained transformers
- **TableFormer**: Dual decoder cho structure + bounding boxes
- **OTSL Format**: Custom token representation
- **Languages**: Language-agnostic (không cần training lại)
- **Output**: JSON/Markdown/HTML với pixel-perfect coordinates

---

## 🔵 LLAMA_INDEX Implementation

### 1. **PDFReader** (Basic - pypdf)
```python
from llama_index.readers.file import PDFReader

reader = PDFReader()
docs = reader.load_data(file_path)
# Chỉ extract text, KHÔNG có structure
```
**Pros**: Nhanh, nhẹ
**Cons**: Không parse tables, không có layout info

### 2. **PyMuPDFReader** 
```python
from llama_index.readers.file import PyMuPDFReader

reader = PyMuPDFReader()
docs = reader.load(file_path)
# Có basic table detection nhưng không accurate
```
**Pros**: Nhanh hơn pypdf
**Cons**: Table extraction cơ bản (rule-based)

### 3. **PDFMarkerReader** (Best cho LlamaIndex)
```python
from llama_index.readers.pdf_marker import PDFMarkerReader

reader = PDFMarkerReader()
docs = reader.load_data(
    file=pdf_path,
    langs=["en", "vi"]  # Multi-language
)
# Convert to Markdown với tables
```
**Implementation**:
- Sử dụng [marker](https://github.com/VikParuchuri/marker/)
- Có table extraction và equation parsing
- **Không dùng AI models** - heuristic-based

### 4. **UnstructuredReader** (Integration)
```python
from llama_index.readers.file import UnstructuredReader

reader = UnstructuredReader()
docs = reader.load_data(file_path)
# Delegates to unstructured.io library
```

### So với Docling:
```
LlamaIndex:
  - Loader ecosystem (80+ loaders)
  - Không có built-in table transformer
  - Relies on external libs (Unstructured, Marker, etc.)
  
Docling:
  - All-in-one solution
  - TableFormer AI model built-in
  - Pixel-accurate bounding boxes
```

---

## 🟢 LANGCHAIN Implementation

### 1. **PyPDFLoader** (Default)
```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("file.pdf")
pages = loader.load()
# Text only, page by page
```

### 2. **UnstructuredPDFLoader**
```python
from langchain_community.document_loaders import UnstructuredPDFLoader

loader = UnstructuredPDFLoader(
    "file.pdf",
    mode="elements",  # or "single" or "paged"
    strategy="hi_res"  # Uses unstructured.io
)
elements = loader.load()
```

### 3. **PDFPlumberLoader** (Best for tables)
```python
from langchain_community.document_loaders import PDFPlumberLoader

loader = PDFPlumberLoader("file.pdf")
docs = loader.load()
# Better table extraction than PyPDF
```
**Implementation**: Uses pdfplumber library
- Line detection algorithms
- Rule-based table detection
- **Không có AI models**

### 4. **AmazonTextractPDFLoader** (Cloud-based)
```python
from langchain_community.document_loaders import AmazonTextractPDFLoader

loader = AmazonTextractPDFLoader("file.pdf")
docs = loader.load()
# AWS Textract API - COST MONEY
```

### Architecture Pattern:
```python
# LangChain uses Parser pattern
class BasePDFLoader(BaseLoader):
    def __init__(self, file_path, parser=None):
        self.parser = parser or PyPDFParser()
    
    def load(self):
        # Parse → Split → Return Documents
```

### So với Docling:
- **Flexibility**: 80+ loaders, swap parsers dễ dàng
- **Table Quality**: PDFPlumber OK but not AI-powered
- **No bounding boxes**: Chỉ có text + basic metadata

---

## 🔴 UNSTRUCTURED.IO Implementation

### Core Function: `partition_pdf()`
```python
from unstructured.partition.pdf import partition_pdf

elements = partition_pdf(
    filename="doc.pdf",
    strategy="hi_res",  # or "fast", "ocr_only"
    infer_table_structure=True,
    extract_images_in_pdf=True
)
```

### How It Works:
```
1. Layout Detection:
   - Uses YOLOX (object detection)
   - Detects: Title, Text, Table, Figure, etc.
   
2. Table Extraction:
   - pdfplumber (rule-based)
   - Hoặc custom table detector
   
3. Chunking Strategy:
   - "by_title": Aggregate by sections
   - "basic": Simple chunks
```

### Element Types Detected:
```python
# From code inspection:
- Title
- NarrativeText
- Table
- ListItem
- Image
- Header/Footer
- Address
- EmailAddress
```

### Table Handling:
```python
for element in elements:
    if element.type == "Table":
        # Has .text and .metadata.text_as_html
        html = element.metadata.text_as_html
        # But NO bounding boxes by default
```

### So với Docling:
```
Unstructured:
  + Auto-detection nhiều element types
  + Element-based chunking thông minh
  - Table extraction KHÔNG dùng Transformer
  - Không có precise bounding boxes
  - Layout model yếu hơn DocLayNet
  
Docling:
  + TableFormer (SOTA for tables)
  + Bounding boxes cho mọi element
  + 11 layout element types
  - Cần setup Python environment phức tạp hơn
```

---

## 🟡 CAMELOT Implementation

### Architecture (Pure Rule-Based):
```python
import camelot

# Stream mode (text-based)
tables = camelot.read_pdf(
    'file.pdf',
    flavor='stream',  
    pages='1-10'
)

# Lattice mode (line detection)
tables = camelot.read_pdf(
    'file.pdf',
    flavor='lattice',
    pages='all'
)
```

### How It Works:
```
Lattice Mode:
  PDF → OpenCV line detection
      → Find grid intersections
      → Extract cells as DataFrame

Stream Mode:
  PDF → PDFMiner text extraction
      → Guess table structure by whitespace
      → Build DataFrame
```

### Output:
```python
for table in tables:
    df = table.df  # Direct pandas DataFrame
    table.to_csv('output.csv')
```

### So với Docling:
```
Camelot:
  + Rất đơn giản, chỉ focus vào tables
  + Output trực tiếp DataFrame
  + Tốt cho simple, well-formed tables
  - KHÔNG handle complex tables (merged cells)
  - KHÔNG có OCR
  - KHÔNG có AI models
  - Chỉ PDF
  
Docling TableFormer:
  + Handles merged cells, complex structure
  + End-to-end learning
  + Works với scanned PDFs (via OCR)
  + Multi-format support
```

---

## NOUGAT (Meta AI) Implementation

### Architecture (Vision Transformer):
```python
from nougat import NougatModel

model = NougatModel.from_pretrained("facebook/nougat-base")
markdown = model.predict("paper.pdf")
# Returns Markdown with LaTeX equations
```

### How It Works:
```
PDF Image → Swin Transformer (Vision Encoder)
         → Autoregressive Decoder
         → Markdown + LaTeX output
```

### Strengths:
- **Academic papers**: Best in class
- **Equations**: Perfect LaTeX rendering
- **End-to-end**: Không cần separate OCR

### Weaknesses:
- **PDF only**: Không support DOCX/Images
- **Slow**: Transformer inference heavy
- **No bounding boxes**: Chỉ có markdown text
- **Not flexible**: Cannot customize for other doc types

### So với Docling:
```
Nougat:
  + Perfect for academic papers
  + LaTeX equations rendering
  - Chỉ PDF
  - Không có layout flexibility
  - Không có coordinates
  
Docling:
  + Multi-format (PDF/DOCX/Images)
  + Modular (swap OCR, layout models)
  + Bounding boxes
  - Equation rendering không tốt bằng Nougat
```

---

## 📊 TECHNICAL COMPARISON TABLE

| Feature | Docling | LlamaIndex | LangChain | Unstructured | Camelot | Nougat |
|---------|---------|------------|-----------|--------------|---------|--------|
| **Table AI Model** | ✅ TableFormer | ❌ | ❌ | ❌ | ❌ | ✅ E2E |
| **Layout AI Model** | ✅ Beehive/Heron | ❌ | ❌ | ✅ YOLOX | ❌ | ✅ Swin |
| **Bounding Boxes** | ✅ Pixel-perfect | ❌ | ❌ | ⚠️ Limited | ❌ | ❌ |
| **Complex Tables** | ✅✅✅ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Multi-format** | ✅ 5+ formats | ✅ 80+ loaders | ✅ 80+ loaders | ✅ 50+ | ❌ PDF only | ❌ PDF only |
| **OCR Built-in** | ✅ 3 engines | ⚠️ Optional | ⚠️ Optional | ✅ | ❌ | ✅ E2E |
| **Vietnamese** | ✅ Via EasyOCR | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual | ❌ | ⚠️ Limited |
| **Speed** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Setup Complexity** | ⭐⭐⭐ | ⭐ | ⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| **Model Size** | ~500MB | <10MB | <10MB | ~200MB | <5MB | ~1.3GB |
| **GPU Recommended** | ✅ | ❌ | ❌ | ⚠️ Optional | ❌ | ✅ Required |

---

## 🎯 CODE COMPARISON

### 1. Extracting a Table

**Docling (QSM):**
```python
from docling.document_converter import DocumentConverter

converter = DocumentConverter()
result = converter.convert("doc.pdf")

for element in result.document.iterate():
    if element.label == "table":
        # Has HTML, text, AND bounding boxes
        html = element.export_to_html()
        bbox = element.get_bbox()  # (x, y, width, height)
```

**LlamaIndex:**
```python
from llama_index.readers.file import UnstructuredReader

reader = UnstructuredReader()
docs = reader.load_data("doc.pdf")

# Manual table extraction
tables = [d for d in docs if "table" in d.metadata.get("type", "")]
# No bounding boxes, basic HTML only
```

**LangChain:**
```python
from langchain_community.document_loaders import PDFPlumberLoader

loader = PDFPlumberLoader("doc.pdf")
docs = loader.load()

# Tables embedded in text, no separate structure
```

**Unstructured:**
```python
from unstructured.partition.pdf import partition_pdf

elements = partition_pdf("doc.pdf", infer_table_structure=True)

for el in elements:
    if el.type == "Table":
        html = el.metadata.text_as_html
        # NO bounding boxes
```

**Camelot:**
```python
import camelot

tables = camelot.read_pdf("doc.pdf", pages="all")
df = tables[0].df  # Direct DataFrame
# Simple but effective for standard tables
```

---

## 🔬 REAL-WORLD USE CASE MATRIX

| Use Case | Best Engine | Why |
|----------|-------------|-----|
| **Financial Reports** (complex tables) | **Docling** | TableFormer handles merged cells |
| **Legal Documents** (multi-column) | Docling or Unstructured | Layout analysis crucial |
| **Academic Papers** | Nougat or Docling | Equations + tables |
| **Simple Invoices** | Camelot | Fast, direct to DataFrame |
| **Mixed Language Docs** | **Docling** | Language-agnostic + good OCR |
| **RAG Pipeline** | LlamaIndex/LangChain | Easy integration |
| **Vietnamese Documents** | **Docling (QSM)** | EasyOCR built-in |

---

## 💡 KẾT LUẬN

### Tại sao QSM chọn Docling là ĐÚNG:

1. **TableFormer**: Chỉ một mình feature này đã worth it
   - Transformer-based (not rule-based)
   - Handles ANY table complexity
   - Language-agnostic
   
2. **Bounding Boxes**: Critical cho document intelligence
   - Không engine nào khác có (trừ paid services)
   - Enables spatial reasoning
   
3. **Production Quality**: IBM Research backing
   - 80K+ documents trong training data
   - Actively maintained
   - Enterprise-ready

4. **Vietnamese OCR**: EasyOCR integration sẵn
   - Other engines phải setup manually
   
### Trade-offs QSM phải chấp nhận:

1. **Model Size**: 500MB+ models
   - Solution: Lazy loading, cache models
   
2. **GPU Recommended**: Slow trên CPU
   - Solution: Batch processing, queue system
   
3. **Python-only**: Cần bridge cho Electron
   - QSM đã giải quyết với child_process

### Khi nào dùng alternatives:

- **Chỉ cần text**: PyPDF (via LlamaIndex)
- **Simple tables**: Camelot
- **Academic papers**: Nougat
- **Budget constraints**: Unstructured.io (free tier)

