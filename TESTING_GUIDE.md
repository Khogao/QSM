# QSM Testing Guide - IBM Docling Integration

**Date**: 2025-01-XX  
**Purpose**: Step-by-step testing guide for IBM Docling integration  
**Status**: Ready for Testing 🧪

---

## 📋 Prerequisites Checklist

Before testing, ensure you have:

- [ ] Python 3.9+ installed
  ```bash
  python --version  # Should be 3.9.0 or higher
  ```

- [ ] QSM project built successfully
  ```bash
  cd D:\Work\Coding\QSM
  npm install
  npm run build
  ```

- [ ] Git repository up to date
  ```bash
  git pull
  git status  # Should show clean working tree
  ```

---

## 🐍 Phase 1: Python Environment Setup

### Step 1.1: Create Virtual Environment

```bash
cd D:\Work\Coding\QSM\python
python -m venv venv
```

**Expected Output**:
```
(Creates venv folder with Python environment)
```

### Step 1.2: Activate Virtual Environment

**Windows PowerShell**:
```powershell
venv\Scripts\Activate.ps1
```

**Windows CMD**:
```cmd
venv\Scripts\activate.bat
```

**Expected Output**:
```
(venv) PS D:\Work\Coding\QSM\python>
```

### Step 1.3: Install Docling Dependencies

```bash
pip install -r requirements.txt
```

**Expected Output**:
```
Collecting docling>=1.0.0
  Downloading docling-1.x.x-py3-none-any.whl
Collecting easyocr>=1.7.0
  Downloading easyocr-1.7.x-py3-none-any.whl
...
Successfully installed docling-1.x.x easyocr-1.7.x ...
```

**⚠️ Note**: First install may take 5-10 minutes (downloads models)

### Step 1.4: Verify Installation

```bash
python -c "import docling; print('Docling installed:', docling.__version__)"
python -c "import easyocr; print('EasyOCR installed: OK')"
```

**Expected Output**:
```
Docling installed: 1.x.x
EasyOCR installed: OK
```

---

## 🧪 Phase 2: Python Script Testing

### Step 2.1: Prepare Test Documents

Create `test-documents/` folder with samples:

```bash
cd D:\Work\Coding\QSM
mkdir test-documents
```

**Required Test Documents**:
1. **Simple PDF** (text only, no tables)
   - Example: `simple.pdf` (5-10 pages)
   - Expected: Fast processing (~2s)

2. **Complex PDF with Tables**
   - Example: `tables.pdf` (construction specs, data tables)
   - Expected: Accurate table extraction (95%+)

3. **Scanned PDF** (images, no text layer)
   - Example: `scanned.pdf` (construction drawings)
   - Expected: OCR extraction (~5s per page)

4. **Vietnamese Document**
   - Example: `vietnamese.pdf` (construction contract in Vietnamese)
   - Expected: Vietnamese OCR accuracy (90%+)

5. **DOCX with Tables**
   - Example: `contract.docx` (Word document with tables)
   - Expected: Table extraction

### Step 2.2: Test Simple PDF

```bash
cd D:\Work\Coding\QSM\python
python docling_processor.py "../test-documents/simple.pdf" --output-format markdown
```

**Expected Output** (JSON):
```json
{
  "status": "success",
  "content": "# Document Title\n\nContent here...",
  "tables": [],
  "metadata": {
    "pages": 5,
    "has_tables": false,
    "table_count": 0,
    "confidence": {
      "mean": 0.95,
      "low": 0.85
    },
    "processing_time": 2.1,
    "file_size": 524288
  },
  "features": {
    "ocr_enabled": false,
    "tables_enabled": true,
    "formulas_enabled": false,
    "code_enabled": false
  }
}
```

**✅ Success Criteria**:
- Status: `success`
- Content: Non-empty markdown text
- Metadata: Correct page count
- Processing time: < 5 seconds

### Step 2.3: Test PDF with Tables

```bash
python docling_processor.py "../test-documents/tables.pdf" --enable-tables
```

**Expected Output** (JSON excerpt):
```json
{
  "status": "success",
  "tables": [
    {
      "index": 0,
      "markdown": "| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|...",
      "html": "<table><tr><td>...</td></tr></table>",
      "rows": 10,
      "cols": 5
    }
  ],
  "metadata": {
    "table_count": 3,
    "confidence": {
      "mean": 0.92
    }
  }
}
```

**✅ Success Criteria**:
- Status: `success`
- Tables: Array with 1+ tables
- Markdown: Well-formatted table syntax
- Rows/cols: Accurate counts

### Step 2.4: Test Scanned PDF (OCR)

```bash
python docling_processor.py "../test-documents/scanned.pdf" --enable-ocr --ocr-lang en,vi
```

**Expected Output**:
- Processing time: ~5-10s per page (OCR is slow)
- Content: Extracted text from scanned images
- Confidence: 0.70-0.90 (lower for scanned docs)

**✅ Success Criteria**:
- Status: `success`
- Content: Non-empty (OCR extracted text)
- OCR feature: `ocr_enabled: true`

### Step 2.5: Test Vietnamese Document

```bash
python docling_processor.py "../test-documents/vietnamese.pdf" --enable-ocr --ocr-lang vi,en
```

**✅ Success Criteria**:
- Status: `success`
- Content: Contains Vietnamese characters (đ, ă, ơ, ư, etc.)
- Accuracy: Readable Vietnamese text (90%+ accuracy)

### Step 2.6: Test DOCX with Tables

```bash
python docling_processor.py "../test-documents/contract.docx" --enable-tables
```

**✅ Success Criteria**:
- Status: `success`
- Tables: Extracted from DOCX
- Content: Clean markdown conversion

### Step 2.7: Test Error Handling

```bash
# Test non-existent file
python docling_processor.py "nonexistent.pdf"
```

**Expected Output**:
```json
{
  "status": "error",
  "error": "File not found: nonexistent.pdf",
  "error_type": "FileNotFoundError"
}
```

**✅ Success Criteria**:
- Status: `error`
- Error message: Descriptive
- Error type: Correct classification

---

## 🖥️ Phase 3: QSM Application Testing

### Step 3.1: Build and Run QSM

```bash
cd D:\Work\Coding\QSM
npm run dev
```

**Expected Output**:
```
VITE v5.x.x  ready in 1234 ms
➜  Local:   http://localhost:5173/
```

**Launch Electron App**:
```bash
# In another terminal
npm start
```

### Step 3.2: Test Document Upload (Simple PDF)

1. Launch QSM app
2. Navigate to "Document Management"
3. Click "Upload Documents"
4. Select `simple.pdf` from test-documents
5. Click "Upload"

**Expected Behavior**:
- Progress bar: 0% → 100%
- Processing status: "Processing: simple.pdf"
- Console log (F12): `✅ Docling processed successfully: { pages: 5, tables: 0, confidence: {...} }`
- Success toast: "Đã xử lý 1/1 tệp tin"

**✅ Success Criteria**:
- Document appears in list
- Processing method: `docling`
- No errors

### Step 3.3: Test Document Upload (Complex PDF with Tables)

1. Upload `tables.pdf`
2. Check console for: `✅ Docling processed successfully: { pages: X, tables: Y, confidence: {...} }`
3. Query the document: "What are the specifications?"

**Expected Behavior**:
- Tables extracted and included in text
- Query results: Includes table data
- Console: Shows table count (e.g., `tables: 3`)

**✅ Success Criteria**:
- Tables extracted (table_count > 0)
- Query returns table data
- Processing method: `docling`

### Step 3.4: Test OCR Document (Scanned PDF)

1. Upload `scanned.pdf`
2. Wait for OCR processing (~5-10s per page)
3. Query the document

**Expected Behavior**:
- Longer processing time (OCR active)
- Console: `ocr_enabled: true`
- Text extracted from scanned images

**✅ Success Criteria**:
- OCR text extracted
- Query works with OCR content
- No errors

### Step 3.5: Test Vietnamese Document

1. Upload `vietnamese.pdf`
2. Query in Vietnamese: "Hợp đồng này về gì?"

**Expected Behavior**:
- Vietnamese text extracted
- Vietnamese query returns results
- Console: OCR with `vi` language

**✅ Success Criteria**:
- Vietnamese characters displayed correctly
- Query in Vietnamese works
- RAG embeddings handle Vietnamese

### Step 3.6: Test Fallback (Disable Python)

**⚠️ Advanced Test**: Verify legacy parser fallback

1. Rename Python folder temporarily:
   ```bash
   cd D:\Work\Coding\QSM
   ren python python_backup
   ```

2. Restart QSM app
3. Upload `simple.pdf`

**Expected Behavior**:
- Console warning: `Docling not available or failed, using fallback parser`
- Document still processed (using pdfjs-dist)
- Processing method: `legacy`
- Success toast (no user-visible error)

**✅ Success Criteria**:
- Graceful fallback (no crash)
- Document still processed
- Warning in console (not user UI)
- Processing method: `legacy`

4. Restore Python folder:
   ```bash
   ren python_backup python
   ```

### Step 3.7: Test Batch Upload

1. Select 5-10 documents (mix of PDF, DOCX)
2. Upload all at once
3. Monitor progress

**Expected Behavior**:
- Progress bar updates per file
- Sequential processing (not parallel)
- Some files use Docling, some may fallback
- All files eventually processed

**✅ Success Criteria**:
- All files processed successfully
- Progress accurate (e.g., "3/10 files")
- Mixed processing methods OK (docling + legacy)
- No memory leaks

---

## 📊 Phase 4: Quality Validation

### Step 4.1: Table Extraction Accuracy

**Test**: Upload PDF with 5+ tables, verify extraction

**Validation Method**:
1. Open PDF manually, count tables: **N tables**
2. Check console log: `tables: X`
3. Compare: X should equal N (or N-1 acceptable)

**Target Accuracy**: 90%+ (9/10 tables extracted correctly)

**Sample Query**:
- User: "What are the material specifications in the table?"
- Expected: Returns data from extracted table

### Step 4.2: OCR Accuracy (Vietnamese)

**Test**: Upload scanned Vietnamese document

**Validation Method**:
1. Manually read 10 sentences from scanned PDF
2. Check extracted text in QSM
3. Count errors (character-level)

**Target Accuracy**: 90%+ (< 10% character errors)

**Sample Test Sentence**:
- Original: "Hợp đồng xây dựng công trình"
- Extracted: Should match 100% (or 1-2 char errors acceptable)

### Step 4.3: Processing Performance

**Test**: Measure processing time for different document types

| Document Type | Target Time | Acceptable Range |
|---------------|-------------|------------------|
| Simple PDF (10 pages) | 2s | 1-5s |
| Complex PDF with tables (20 pages) | 5s | 3-10s |
| Scanned PDF (5 pages) | 15s | 10-30s |
| DOCX (10 pages) | 2s | 1-5s |

**Validation Method**:
1. Console log shows: `processing_time: X.X`
2. Check against targets above

### Step 4.4: Memory Usage

**Test**: Monitor memory usage during processing

**Validation Method** (Windows):
1. Open Task Manager
2. Find QSM process
3. Note memory before upload: **~200 MB**
4. Upload large PDF (50 pages)
5. Note memory during processing: **~500 MB - 2 GB** (acceptable)
6. Wait 1 minute after processing
7. Note memory after: Should return to **~300 MB**

**✅ Success Criteria**:
- No memory leaks (memory returns after processing)
- Peak memory < 4 GB (even for large docs)
- No out-of-memory errors

### Step 4.5: Error Recovery

**Test**: Verify graceful error handling

**Test Cases**:
1. **Corrupted PDF**: Upload corrupted file
   - Expected: Error toast, no crash
   
2. **Unsupported Format**: Upload .exe file
   - Expected: "Unsupported file type" error
   
3. **Python Missing**: Rename python folder
   - Expected: Fallback to legacy, no crash
   
4. **Large File (100+ MB)**: Upload huge PDF
   - Expected: Processing (may be slow), or memory error (acceptable)

**✅ Success Criteria**:
- No app crashes
- User-friendly error messages
- Fallback works (legacy parsers)
- Recovery possible (retry upload)

---

## 🐛 Phase 5: Debugging Common Issues

### Issue 1: "Docling not available"

**Symptoms**:
```
Console: Docling not available or failed, using fallback parser
```

**Debug Steps**:
1. Check Python installation:
   ```bash
   python --version
   ```
   - Expected: 3.9+
   
2. Check venv activation:
   ```bash
   venv\Scripts\Activate.ps1
   pip list | findstr docling
   ```
   - Expected: `docling 1.x.x`
   
3. Test Python script directly:
   ```bash
   python python/docling_processor.py test.pdf
   ```
   - Expected: JSON output

**Solution**:
- Reinstall dependencies: `pip install -r requirements.txt`
- Check PATH: Ensure Python in PATH
- Check script path: Verify `python/docling_processor.py` exists

### Issue 2: "ModuleNotFoundError: No module named 'docling'"

**Symptoms**:
```json
{
  "status": "error",
  "error": "No module named 'docling'",
  "error_type": "ModuleNotFoundError"
}
```

**Solution**:
```bash
cd D:\Work\Coding\QSM\python
venv\Scripts\Activate.ps1
pip install docling easyocr
```

### Issue 3: Slow OCR Processing (>30s per page)

**Symptoms**:
- Scanned PDFs take 1+ minute per page

**Debug Steps**:
1. Check OCR settings:
   ```bash
   python docling_processor.py test.pdf --enable-ocr
   ```
   
2. Disable unnecessary features:
   - Remove `--enable-formulas` (if not needed)
   - Remove `--enable-code` (if not needed)

**Solution**:
- Accept slower speed (OCR is inherently slow)
- Or: Disable OCR for digital PDFs (only enable for scanned)

### Issue 4: Table Extraction Inaccurate

**Symptoms**:
- Tables extracted but structure wrong (merged cells, missing rows)

**Debug Steps**:
1. Check PDF quality:
   - Open PDF manually, inspect tables
   - Complex tables (merged cells) harder to extract
   
2. Check confidence score:
   ```json
   "confidence": { "mean": 0.65 }  // Low confidence
   ```

**Solution**:
- Accept limitations (state-of-the-art is 90-95%, not 100%)
- Manual review for critical tables
- Future: Fine-tune TableFormer model

### Issue 5: Vietnamese OCR Incorrect

**Symptoms**:
- Vietnamese text garbled or wrong characters

**Debug Steps**:
1. Check language setting:
   ```bash
   python docling_processor.py test.pdf --enable-ocr --ocr-lang vi
   ```
   
2. Verify EasyOCR installation:
   ```bash
   python -c "import easyocr; reader = easyocr.Reader(['vi']); print('OK')"
   ```

**Solution**:
- First run downloads Vietnamese model (slow)
- Retry after model downloaded
- Check font rendering (some Vietnamese fonts not supported)

---

## 📈 Phase 6: Performance Benchmarking

### Benchmark Suite

**Test Documents** (5 each):
1. Simple PDF (10 pages, text only)
2. Complex PDF (20 pages, 5+ tables)
3. Scanned PDF (5 pages, images)
4. DOCX (10 pages, 2+ tables)
5. Vietnamese PDF (10 pages, mixed content)

**Metrics to Track**:
1. **Processing Time**:
   - Average per document type
   - Min/max range
   - Docling vs Legacy comparison

2. **Accuracy**:
   - Table extraction rate (tables found / total tables)
   - OCR character accuracy (correct chars / total chars)
   - Query relevance (correct answers / total queries)

3. **Resource Usage**:
   - Peak memory (MB)
   - CPU usage (%)
   - Disk I/O (MB read/write)

### Sample Benchmark Results (Expected)

| Document Type | Avg Time (Docling) | Avg Time (Legacy) | Table Accuracy | Memory Peak |
|---------------|-------------------|-------------------|----------------|-------------|
| Simple PDF | 2.5s | 2.0s | N/A | 300 MB |
| Complex PDF | 6.5s | 3.5s | 95% | 800 MB |
| Scanned PDF | 18s | ❌ Fail | 85% | 1.2 GB |
| DOCX | 2.0s | 1.5s | 92% | 250 MB |
| Vietnamese PDF | 20s | ❌ Fail | 88% | 1.5 GB |

**Interpretation**:
- **Docling**: Slower but higher quality (tables, OCR)
- **Legacy**: Faster but no tables, no OCR
- **Trade-off**: 2-3x slower, 2-3x better quality

---

## ✅ Testing Checklist Summary

### Prerequisites
- [ ] Python 3.9+ installed
- [ ] QSM built successfully
- [ ] Git up to date

### Phase 1: Python Setup
- [ ] Virtual environment created
- [ ] Dependencies installed (docling, easyocr)
- [ ] Installation verified

### Phase 2: Python Script Testing
- [ ] Simple PDF test (passed)
- [ ] PDF with tables test (passed)
- [ ] Scanned PDF OCR test (passed)
- [ ] Vietnamese document test (passed)
- [ ] DOCX test (passed)
- [ ] Error handling test (passed)

### Phase 3: QSM Application Testing
- [ ] App launches successfully
- [ ] Simple PDF upload (passed)
- [ ] Complex PDF with tables (passed)
- [ ] OCR document (passed)
- [ ] Vietnamese document (passed)
- [ ] Fallback test (Python disabled) (passed)
- [ ] Batch upload (passed)

### Phase 4: Quality Validation
- [ ] Table extraction accuracy ≥90%
- [ ] OCR accuracy (Vietnamese) ≥90%
- [ ] Processing time within targets
- [ ] Memory usage acceptable (<4 GB)
- [ ] Error recovery works

### Phase 5: Debugging
- [ ] Common issues documented
- [ ] Solutions tested and verified

### Phase 6: Performance Benchmarking
- [ ] Benchmark suite executed
- [ ] Metrics collected
- [ ] Results documented

---

## 🎉 Testing Complete Criteria

**✅ PASS**: All of the following:
1. Python dependencies installed successfully
2. Python script tests pass (6/6)
3. QSM application tests pass (7/7)
4. Quality metrics meet targets:
   - Table extraction: ≥90%
   - OCR accuracy: ≥90%
   - Processing time: Within acceptable range
   - Memory usage: <4 GB peak
5. Fallback works (no crash when Python disabled)
6. No critical bugs

**⚠️ CONDITIONAL PASS**: Most tests pass, minor issues:
- 1-2 test failures (non-critical)
- Performance slightly below target (acceptable trade-off)
- Known limitations documented

**❌ FAIL**: Any of the following:
- Python dependencies can't be installed
- >3 test failures
- App crashes frequently
- Memory leaks (memory doesn't return)
- Fallback doesn't work (crash when Python disabled)

---

## 📝 Test Results Template

```markdown
# QSM Docling Integration - Test Results

**Tester**: [Your Name]
**Date**: [YYYY-MM-DD]
**Environment**: Windows 10/11, Python 3.x.x, QSM v1.0.0

## Phase 1: Python Setup
- [ ] Pass / [ ] Fail
- Notes: ...

## Phase 2: Python Script Testing
- Simple PDF: [ ] Pass / [ ] Fail
- PDF with Tables: [ ] Pass / [ ] Fail
- Scanned PDF: [ ] Pass / [ ] Fail
- Vietnamese: [ ] Pass / [ ] Fail
- DOCX: [ ] Pass / [ ] Fail
- Error Handling: [ ] Pass / [ ] Fail

## Phase 3: QSM Application Testing
- Simple PDF Upload: [ ] Pass / [ ] Fail
- Complex PDF: [ ] Pass / [ ] Fail
- OCR Document: [ ] Pass / [ ] Fail
- Vietnamese: [ ] Pass / [ ] Fail
- Fallback: [ ] Pass / [ ] Fail
- Batch Upload: [ ] Pass / [ ] Fail

## Phase 4: Quality Validation
- Table Extraction Accuracy: [X]% (Target: 90%)
- OCR Accuracy: [X]% (Target: 90%)
- Processing Time: [X]s avg (Target: <5s for simple PDF)
- Memory Usage: [X] MB peak (Target: <4 GB)

## Issues Found
1. [Issue description]
2. ...

## Recommendations
1. [Recommendation]
2. ...

## Overall Result
[ ] ✅ PASS
[ ] ⚠️ CONDITIONAL PASS
[ ] ❌ FAIL
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. **Update Documentation**:
   - Mark DOCLING_INTEGRATION_SUMMARY.md as "Tested & Verified"
   - Add test results to README.md
   
2. **User Documentation**:
   - Create user guide: "How to Install Python Dependencies"
   - Add FAQ: "Why is processing slower?"
   
3. **Deployment**:
   - Create release notes
   - Package Python dependencies (optional: bundle Python)
   - Publish to GitHub releases

### If Tests Fail ❌
1. **Debug**:
   - Review test results
   - Identify root cause
   - Fix issues
   
2. **Retest**:
   - Repeat failed tests
   - Verify fixes work
   
3. **Document**:
   - Add known issues to docs
   - Create workarounds if needed

### If Conditional Pass ⚠️
1. **Document Limitations**:
   - Add to README.md: "Known Limitations"
   - Example: "Table extraction 85% accurate (target 90%)"
   
2. **Decide**:
   - Accept limitations and ship?
   - Or: Fix issues before release?

---

**For User**:
Start with Phase 1 (Python Setup). Follow each step carefully. Document any issues encountered. Good luck! 🍀
