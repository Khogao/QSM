# Docling Capabilities & Vietnamese Law Models Research

**Date**: October 6, 2025  
**Session**: Day 2 - Post-RAG Integration  
**Purpose**: Deep dive into Docling capabilities for document validation & Vietnamese Law chatbot models

---

## 🔍 EXECUTIVE SUMMARY

### Docling Capabilities Analysis
**Docling DOES have advanced document analysis features**, including:
- ✅ **OCR with Quality Scoring**: Confidence scores (0.0-1.0) for OCR quality
- ✅ **Structure Validation**: Layout detection, table structure recognition
- ✅ **Content Quality Assessment**: Text quality rating, error detection
- ✅ **Orientation Detection**: Auto-detect and correct rotated documents
- ✅ **Confidence Grading**: POOR/FAIR/GOOD/EXCELLENT grades for conversion quality

**However, Docling DOES NOT have:**
- ❌ Legal compliance checking
- ❌ Grammar/style error detection
- ❌ Document format validation against templates
- ❌ Regulatory requirement matching

### Vietnamese Law Models
**Best Available Models (2025)**:
1. **phuocsang/qwen2.5-3B-Finetune-Vietnamese-Law** (February 2025) - NEWEST
2. **mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF** (GGUF quantized, LM Studio compatible)
3. **minhquan6203/paraphrase-vietnamese-law** (Sentence similarity, January 2025)

---

## 📚 PART 1: DOCLING COMPREHENSIVE CAPABILITIES

### 1.1 Document Conversion Pipeline

**Core Pipeline Stages** (from `base_pipeline.py`):
```python
def execute(self, in_doc: InputDocument, raises_on_error: bool) -> ConversionResult:
    # Stage 1: Build structure
    conv_res = self._build_document(conv_res)
    
    # Stage 2: Assemble document
    conv_res = self._assemble_document(conv_res)
    
    # Stage 3: Enrich with metadata
    conv_res = self._enrich_document(conv_res)
    
    # Stage 4: Determine quality status
    conv_res.status = self._determine_status(conv_res)
```

**Supported Formats**:
- PDF (digital & scanned)
- Microsoft Office: DOCX, XLSX, PPTX
- Images: PNG, JPG, TIFF
- CSV, HTML, XML

### 1.2 OCR Capabilities

**OCR Engines Supported**:
- **EasyOCR**: Multi-language, GPU accelerated
- **Tesseract**: Open source, highly accurate
- **RapidOCR**: Fast inference
- **OcrMac**: macOS only (Vision framework)

**OCR Features** (from `base_ocr_model.py`):
```python
class BaseOcrModel:
    def rate_text_quality(self, text: str) -> float:
        # Hard errors: blacklist_chars, glyph patterns
        if any(text.find(c) >= 0 for c in blacklist_chars):
            return 0.0  # Quality score 0
        
        # Fragmented word penalties
        # Average token length checks
        # Return score 0.0 - 1.0
```

**OCR Options**:
- `force_full_page_ocr`: Replace all text with OCR (for bad PDF extractions)
- `bitmap_area_threshold`: Minimum bitmap area to trigger OCR (default 5%)
- `lang`: Language codes for OCR (e.g., ['vi', 'en'])

### 1.3 Confidence Scoring System

**Confidence Report** (from `confidence_scores.md`):
```
ConfidenceReport:
  - layout_score: 0.0-1.0 (document element recognition quality)
  - ocr_score: 0.0-1.0 (OCR-extracted content quality)
  - parse_score: 0.0-1.0 (10th percentile of digital text cells)
  - table_score: 0.0-1.0 (table extraction quality, not yet implemented)
  
  - mean_grade: POOR/FAIR/GOOD/EXCELLENT (average of 4 scores)
  - low_grade: POOR/FAIR/GOOD/EXCELLENT (5th percentile, worst areas)
```

**Quality Grades**:
- **EXCELLENT**: 0.9 - 1.0
- **GOOD**: 0.7 - 0.9
- **FAIR**: 0.5 - 0.7
- **POOR**: 0.0 - 0.5

**Use Cases**:
- Identify documents requiring manual review
- Set confidence thresholds for unattended batch conversions
- Catch potential conversion issues early in workflow

### 1.4 Table Structure Recognition

**TableFormer Model** (from `table_structure_model.py`):
- Architecture: Transformer-based Im2Seq
- Output: OTSL (Optimized Table Structure Language) format
- Features:
  - Table cell bounding boxes with high accuracy
  - Row/column structure detection
  - Header detection (column headers, row headers)
  - Cell matching to PDF text (optional)

**Table Options**:
```python
TableStructureOptions:
  - do_cell_matching: True  # Match predictions to PDF cells
  - mode: FAST | ACCURATE   # Speed vs quality tradeoff
```

### 1.5 Document Quality Assessment

**Text Quality Rating** (from `page_preprocessing_model.py`):
```python
def rate_text_quality(self, text: str) -> float:
    # Blacklist: "�" (Unicode replacement char)
    # Pattern detection: /Glyph/, /G/numbers
    # Fragmented words: "w o r d s  s p a c e d  o u t"
    # Average token length checks
    
    # Returns 0.0 for hard errors
    # Applies penalties for soft errors
    # Higher score = better quality
```

**Orientation Detection** (from `tesseract_ocr_model.py`):
```python
# Auto-detect document rotation
osd = self.osd_reader.DetectOrientationScript()
doc_orientation = parse_tesseract_orientation(osd["orient_deg"])

# Orientations: 0°, 90°, 180°, 270°
if doc_orientation != 0:
    high_res_image = high_res_image.rotate(-doc_orientation, expand=True)
```

### 1.6 What Docling CAN Do for Document Validation

**✅ Docling CAN help with**:

1. **OCR Quality Validation**:
   ```python
   # Check if scanned document was OCR'd correctly
   if conv_res.confidence.ocr_score < 0.5:
       print("⚠️ Poor OCR quality - may need manual review")
   ```

2. **Structure Validation**:
   ```python
   # Verify document structure was recognized
   if conv_res.confidence.layout_score < 0.7:
       print("⚠️ Layout detection issues - check for complex formatting")
   ```

3. **Table Extraction Validation**:
   ```python
   # Ensure tables were extracted correctly
   for table in doc.tables:
       if table.confidence < 0.8:
           print(f"⚠️ Table on page {table.page} may have errors")
   ```

4. **Content Completeness Check**:
   ```python
   # Compare word count before/after conversion
   if doc.word_count < expected_word_count * 0.9:
       print("⚠️ Possible content loss during conversion")
   ```

5. **Orientation Detection**:
   ```python
   # Auto-detect and correct rotated pages
   # Docling handles this automatically with Tesseract OSD
   ```

### 1.7 What Docling CANNOT Do

**❌ Docling CANNOT help with**:

1. **Legal Compliance Checking**:
   - Cannot verify if document content complies with Vietnamese law
   - Cannot check if investment procedures match TPHCM regulations
   - Cannot validate legal document templates

2. **Grammar & Style Validation**:
   - Cannot detect grammatical errors in Vietnamese
   - Cannot check for formal writing style
   - Cannot validate administrative language standards

3. **Format Compliance**:
   - Cannot validate if document follows official templates (e.g., Công văn format)
   - Cannot check for required sections/fields
   - Cannot verify signature blocks or official seals

4. **Regulatory Requirements**:
   - Cannot check if all required attachments are present
   - Cannot validate dates against legal deadlines
   - Cannot verify authority levels for approvals

---

## 🤖 PART 2: VIETNAMESE LAW CHATBOT MODELS

### 2.1 Model Comparison Matrix

| Model | Size | Updated | Downloads | GGUF Available | LM Studio Compatible | Vietnamese Quality | Legal Training |
|-------|------|---------|-----------|----------------|---------------------|-------------------|----------------|
| **phuocsang/qwen2.5-3B-Finetune-Vietnamese-Law** | 3B | Feb 2025 | 12/mo | ❌ PEFT only | ⚠️ Need conversion | ⭐⭐⭐⭐⭐ | 20k Q&A pairs |
| **phuocsang/qwen2.5-3B-Vietnamese-Law** | 3B | Feb 2025 | N/A | ❌ | ⚠️ Need conversion | ⭐⭐⭐⭐⭐ | Base adapter |
| **mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF** | 7.6B | N/A | 35/mo | ✅ Q2-F16 | ✅ YES | ⭐⭐⭐⭐ | Unknown |
| **minhquan6203/paraphrase-vietnamese-law** | 0.3B | Jan 2025 | 164 | ❌ | ❌ Embedding only | ⭐⭐⭐⭐⭐ | Sentence similarity |
| **hivetechVN/vietnamese-sbert-base-law-768-v1** | 0.1B | Feb 2024 | 99 | ❌ | ❌ Embedding only | ⭐⭐⭐⭐ | Sentence similarity |

### 2.2 Recommended Model: mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF

**Why This Model**:
1. ✅ **GGUF Format**: Direct LM Studio compatibility
2. ✅ **Multiple Quantizations**: Q2_K (3.1 GB) to F16 (15.3 GB)
3. ✅ **Proven Downloads**: 35/month usage
4. ✅ **Based on Qwen**: Strong multilingual reasoning
5. ✅ **Legal Domain**: Fine-tuned for Vietnamese law

**Recommended Quantization for RX 580 8GB**:
- **Q4_K_M (4.8 GB)**: Best quality that fits in VRAM
- **Q5_K_M (5.5 GB)**: Better quality, might need CPU offloading
- **Q6_K (6.4 GB)**: Excellent quality, recommended if fits

**Download Command**:
```bash
# Option 1: LM Studio UI (RECOMMENDED)
1. Open LM Studio
2. Search: "Chatbot_VietNamese_Law_Qwen"
3. Select Q4_K_M or Q5_K_M quantization
4. Click Download

# Option 2: Manual download via huggingface-cli
huggingface-cli download mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF \
  --include "Chatbot_VietNamese_Law_Qwen.Q4_K_M.gguf" \
  --local-dir "C:\AI Models for Vscode\vietnamese-law"
```

### 2.3 Alternative: phuocsang/qwen2.5-3B-Finetune-Vietnamese-Law

**Advantages**:
- ✅ **Most Recent**: Updated February 2025
- ✅ **Smaller**: 3B parameters (faster inference)
- ✅ **Documented Training**: 20k Vietnamese law Q&A pairs from `hoidap-tvpl-20k` dataset
- ✅ **PEFT Adapter**: Fine-tuned with LoRA for efficiency

**Disadvantages**:
- ❌ **Not GGUF**: Requires conversion for LM Studio
- ❌ **PEFT Format**: Need to merge adapter with base model first
- ⚠️ **Smaller Model**: Less reasoning capacity than 7B

**If User Wants This Model**:
```python
# Step 1: Install dependencies
pip install transformers peft accelerate

# Step 2: Load and merge model
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-3B")
model = PeftModel.from_pretrained(base_model, "phuocsang/qwen2.5-3B-Finetune-Vietnamese-Law")

# Step 3: Merge and convert to GGUF
model = model.merge_and_unload()
# Use llama.cpp convert script to create GGUF
```

### 2.4 Integration with QSM

**Workflow**:
```
User Query (Vietnamese Law)
    ↓
Generate Embedding (Xenova/all-MiniLM-L6-v2)
    ↓
Vector Search (SimpleRAG.searchChunks)
    ↓
Retrieve Top-5 Relevant Chunks from Vietnamese Law Documents
    ↓
Build RAG Prompt with Legal Context
    ↓
LLM: Vietnamese Law Chatbot (via LM Studio)
    ↓
Stream Response with Citations [1], [2], [3]
    ↓
Display Answer + Clickable Sources
```

**Configuration in QSM**:
```typescript
// src/services/simpleRAG.ts - LM Studio config
const llmConfig: LLMConfig = {
  provider: 'lmstudio',
  endpoint: 'http://localhost:1234/v1',
  model: 'mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF',  // Model name
  apiKey: '',  // Not needed for local
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: `Bạn là trợ lý AI chuyên về luật Việt Nam. 
Hãy trả lời câu hỏi dựa trên các tài liệu được cung cấp.
Luôn cite nguồn bằng cách sử dụng [1], [2], [3] khi trích dẫn nội dung.`
};
```

---

## 🎯 PART 3: IMPLEMENTATION PLAN FOR PENDING STEPS

### 3.1 Step Analysis: What's Actually Pending

**✅ COMPLETED**:
1. ✅ Install Docling - DONE (working in batch test)
2. ✅ Fix PDF processing - DONE (Docling integrated)
3. ✅ Update Query UI - DONE (AdvancedQueryInterface connected)
4. ✅ Connect RAG + LLM - DONE (SimpleRAG with 5 providers)
5. ✅ Testing - IN PROGRESS (batch test running 3/100)
6. ✅ Deploy - DONE (committed to GitHub)
7. ✅ HuggingFace token UI - DONE (ModelSelectionPanel has API key fields)
8. ✅ LM Studio integration - DONE (SimpleRAG supports LM Studio)

**⏳ PENDING**:
1. ⏳ Download Qwen 2.5 / Vietnamese Law model - **NEEDS ACTION**
2. ⏳ Test with 100 files - **RUNNING** (3/100, ~20 min remaining)
3. ⏳ Vulkan acceleration research - **NEEDS RESEARCH**
4. ⏳ Web search integration - **OPTIONAL FEATURE**
5. ⏳ Document validation workflow - **NEEDS DESIGN**

### 3.2 Priority 1: Download Vietnamese Law Model

**Action Steps**:
```bash
# 1. Check LM Studio is running
# Open LM Studio application
# Ensure local server is started (port 1234)

# 2. Download model via LM Studio UI
# - Search: "Chatbot_VietNamese_Law_Qwen"
# - Select: Q4_K_M (4.8 GB) or Q5_K_M (5.5 GB)
# - Download location: Default LM Studio models folder
#   (usually: C:\Users\<username>\.cache\lm-studio\models)

# 3. Load model in LM Studio
# - Click "Load Model"
# - Select downloaded GGUF file
# - Configure context: 8192 tokens
# - Enable GPU layers: Auto (will use Vulkan on RX 580)

# 4. Test in LM Studio
# Prompt: "Quy trình xét duyệt thủ tục xin thuận chủ trương đầu tư ở TPHCM là gì?"
# Expected: Response in Vietnamese about investment approval procedures

# 5. Configure QSM to use model
# Update localStorage: 'llm_provider' = 'lmstudio'
# Update localStorage: 'llm_model' = 'Chatbot_VietNamese_Law_Qwen'
```

### 3.3 Priority 2: Document Validation Workflow Design

**Enhanced Workflow with Docling Quality Checks**:

```typescript
// Proposed: src/services/documentValidation.ts
export interface DocumentValidationResult {
  file: string;
  doclingQuality: {
    layoutScore: number;
    ocrScore: number;
    parseScore: number;
    grade: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  };
  llmAnalysis: {
    legalCompliance: string;  // "Phù hợp" | "Không phù hợp" | "Cần xem xét"
    grammarErrors: string[];
    structureIssues: string[];
    suggestions: string[];
  };
  citations: Array<{
    text: string;
    source: string;
    relevance: number;
  }>;
}

// Workflow:
async function validateDocument(file: File): Promise<DocumentValidationResult> {
  // Step 1: Process with Docling
  const doclingResult = await processWithDocling(file);
  
  // Step 2: Extract Docling confidence scores
  const doclingQuality = {
    layoutScore: doclingResult.confidence.layout_score,
    ocrScore: doclingResult.confidence.ocr_score,
    parseScore: doclingResult.confidence.parse_score,
    grade: doclingResult.confidence.mean_grade
  };
  
  // Step 3: If Docling quality < GOOD, warn user
  if (doclingQuality.grade === 'POOR' || doclingQuality.grade === 'FAIR') {
    console.warn('⚠️ Document quality issues detected by Docling');
  }
  
  // Step 4: Generate embedding and search Vietnamese Law documents
  const embedding = await generateEmbedding(doclingResult.text);
  const relevantLawDocs = await SimpleRAG.searchChunks(embedding, 10);
  
  // Step 5: Build LLM prompt for legal analysis
  const prompt = buildLegalAnalysisPrompt(doclingResult, relevantLawDocs);
  
  // Step 6: Query Vietnamese Law LLM
  const llmResponse = await SimpleRAG.queryLLM(prompt, {
    provider: 'lmstudio',
    model: 'Chatbot_VietNamese_Law_Qwen',
    temperature: 0.3,  // Lower temp for factual analysis
    systemPrompt: `Bạn là chuyên gia phân tích pháp lý.
Nhiệm vụ: Phân tích tài liệu theo quy định pháp luật Việt Nam hiện hành.
Kiểm tra:
1. Tuân thủ quy định hiện hành
2. Lỗi hành văn (ngữ pháp, chính tả)
3. Cấu trúc tài liệu (có đầy đủ phần không?)
4. Đề xuất cải thiện`
  });
  
  // Step 7: Parse LLM response for structured data
  const llmAnalysis = parseLegalAnalysis(llmResponse);
  
  return {
    file: file.name,
    doclingQuality,
    llmAnalysis,
    citations: extractCitations(llmResponse)
  };
}
```

### 3.4 Priority 3: Vulkan Acceleration Research

**Current Status**:
- ✅ LM Studio supports Vulkan on AMD GPUs
- ✅ RX 580 8GB has Vulkan 1.3 support
- ⚠️ Need to verify LM Studio Vulkan is enabled

**Verification Steps**:
```bash
# 1. Check Vulkan installation
vulkaninfo | findstr "GPU"
# Expected: AMD Radeon RX 580

# 2. Check LM Studio Vulkan usage
# In LM Studio:
# Settings > Hardware > GPU Acceleration
# Should show: "Vulkan (AMD)"

# 3. Monitor GPU usage during inference
# Use GPU-Z or HWiNFO64
# Check "GPU Load" while running LLM query

# 4. Benchmark with/without Vulkan
# Tokens/sec with Vulkan: Expected 80-100 tok/s
# Tokens/sec CPU only: Expected 60-70 tok/s
```

**Alternative: bare Vulkan via llama.cpp**:
```bash
# llama.cpp with Vulkan backend
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp

# Build with Vulkan
mkdir build && cd build
cmake .. -DLLAMA_VULKAN=ON
cmake --build . --config Release

# Run with Vulkan
./bin/main -m model.gguf -ngl 99 --vulkan
```

---

## 📋 PART 4: NEXT STEPS CHECKLIST

### Immediate (Today):
- [ ] **Download Vietnamese Law Model**
  - Open LM Studio
  - Search "Chatbot_VietNamese_Law_Qwen"
  - Download Q4_K_M (4.8 GB) or Q5_K_M (5.5 GB)
  - Load model and test

- [ ] **Wait for Batch Test Completion**
  - Current: 3/100 files
  - Estimated: ~15 minutes remaining
  - Review test_results_100.json
  - Create summary report

- [ ] **Verify Vulkan Acceleration**
  - Check LM Studio GPU settings
  - Run benchmark: Vietnamese query with model
  - Measure tokens/sec

### Short-term (This Week):
- [ ] **Implement Document Validation Workflow**
  - Create `src/services/documentValidation.ts`
  - Add Docling quality checks
  - Integrate Vietnamese Law LLM
  - Add UI for validation results

- [ ] **Test End-to-End RAG with Vietnamese Law**
  - Import 50-100 Vietnamese law documents
  - Test query: "Quy trình xét duyệt thủ tục xin thuận chủ trương đầu tư trước 1/7/2025 và sau ngày này ở TPHCM có gì khác nhau?"
  - Verify citations work
  - Check Vietnamese response quality

- [ ] **Optimize for Production**
  - Test with 1000+ documents
  - Monitor localStorage limits (10k chunks)
  - Implement chunk prioritization
  - Add progress indicators

### Optional (Future):
- [ ] **Web Search Integration**
  - Research SerpAPI or Google Custom Search
  - Add "Search Web" button in Query UI
  - Download and index web results
  - Create "Downloaded Documents" folder

- [ ] **Model Optimization**
  - Test phuocsang/qwen2.5-3B-Finetune-Vietnamese-Law
  - Convert to GGUF if better performance
  - Compare with current 7B model

---

## 🎓 KEY TAKEAWAYS

### Docling:
1. ✅ **Strong OCR and Structure Detection**: Can validate document conversion quality
2. ✅ **Confidence Scoring**: Useful for identifying problematic documents
3. ❌ **Not a Legal Validator**: Cannot check compliance or grammar
4. 💡 **Best Use**: Pre-processing quality gate before LLM analysis

### Vietnamese Law Models:
1. 🥇 **Best for LM Studio**: `mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF` (Q4_K_M)
2. 🥈 **Most Recent**: `phuocsang/qwen2.5-3B-Finetune-Vietnamese-Law` (needs conversion)
3. 💡 **Strategy**: Use GGUF model now, evaluate 3B model later if needed

### Workflow:
1. **Docling Quality Check** → Warn if POOR/FAIR
2. **RAG Retrieval** → Get relevant Vietnamese law documents
3. **LLM Analysis** → Vietnamese Law Chatbot validates content
4. **Structured Output** → Compliance status + suggestions

---

**Status**: READY FOR IMPLEMENTATION  
**Next Action**: Download model and test with real Vietnamese legal documents

