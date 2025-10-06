# QSM Python Environment

This folder contains Python scripts for IBM Docling integration.

## Setup

1. **Install Python 3.9+**
   ```bash
   python --version  # Should be 3.9 or higher
   ```

2. **Create Virtual Environment** (Recommended)
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Docling**
   ```bash
   pip install docling
   
   # Optional: For better OCR
   pip install easyocr  # or tesseract-ocr
   ```

## Usage

### Basic Document Processing
```bash
python docling_processor.py input.pdf
```

### With OCR (Scanned Documents)
```bash
python docling_processor.py input.pdf --enable-ocr --ocr-lang=en,vi
```

### With All Features
```bash
python docling_processor.py input.pdf \
  --enable-ocr \
  --enable-tables \
  --enable-formulas \
  --enable-code \
  --output-format=json
```

## Dependencies

**Required:**
- `docling` - IBM Docling core library

**Optional:**
- `easyocr` - Better OCR quality (GPU supported)
- `tesseract` - Alternative OCR engine
- `pandas` - For table export to DataFrame

## Output Format

The script outputs JSON with:
- `content`: Document text (Markdown/JSON/HTML)
- `tables`: Array of extracted tables
- `metadata`: Pages, confidence scores, file info
- `features`: Which features were enabled

Example:
```json
{
  "status": "success",
  "content": "# Document Title\n\n...",
  "tables": [
    {
      "index": 0,
      "markdown": "| Header | ... |",
      "html": "<table>...",
      "rows": 10,
      "cols": 5
    }
  ],
  "metadata": {
    "pages": 100,
    "table_count": 50,
    "confidence": {
      "mean": 0.95,
      "low": 0.85
    }
  }
}
```

## Integration with Node.js

See `src/services/doclingService.ts` for TypeScript integration.
