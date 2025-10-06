# 🧠 QSM AI Integration Architecture

## 📊 Workflow Diagram - RAG + AI Brain

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER UPLOADS DOCUMENT                        │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 1: DOCUMENT PROCESSING (IBM Docling)                         │
├─────────────────────────────────────────────────────────────────────┤
│  1. Parse document (PDF/DOCX/XLSX/PPTX/etc.)                       │
│  2. Extract text, tables, images                                    │
│  3. OCR for scanned documents (EasyOCR)                             │
│  4. Preserve document structure & metadata                          │
│  Output: Raw text + structured data                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 2: RAG PROCESSING (Chunking + Embedding)                     │
├─────────────────────────────────────────────────────────────────────┤
│  1. Chunk text (configurable size: 64-2048 tokens)                  │
│     ├─ NotebookLM mode: 512 tokens                                  │
│     ├─ Data Survey mode: 256 tokens                                 │
│     └─ General Q&A: 320 tokens (default)                            │
│                                                                      │
│  2. Generate embeddings (GPU accelerated)                           │
│     ├─ Local: Xenova/all-MiniLM-L6-v2 (Transformers.js)            │
│     ├─ Local: nomic-embed-text (Ollama)                             │
│     └─ Cloud: OpenAI text-embedding-ada-002                         │
│                                                                      │
│  3. Store in vector database (SQLite + vector extension)            │
│     ├─ Document chunks table                                        │
│     ├─ Vector embeddings (cosine similarity index)                  │
│     └─ Metadata (source, page, table info)                          │
│                                                                      │
│  Output: Searchable vector database                                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 3: USER QUERY                                                 │
├─────────────────────────────────────────────────────────────────────┤
│  User asks: "Summarize contract terms about payment"                │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 4: RETRIEVAL (Semantic Search)                               │
├─────────────────────────────────────────────────────────────────────┤
│  1. Embed user query (same embedding model as chunks)               │
│  2. Vector similarity search (cosine similarity)                    │
│  3. Retrieve top-k relevant chunks (default k=5)                    │
│  4. Re-rank by relevance (optional: cross-encoder)                  │
│                                                                      │
│  Output: Top 5 most relevant text chunks with context               │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 5: AI BRAIN (LLM Processing)  🧠                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  PROMPT CONSTRUCTION                                        │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  System:                                                    │    │
│  │    You are a helpful assistant analyzing documents.        │    │
│  │    Answer based on provided context only.                  │    │
│  │                                                             │    │
│  │  Context (from RAG):                                        │    │
│  │    [Chunk 1] "Payment terms: Net 30 days..."               │    │
│  │    [Chunk 2] "Late payment penalty: 2% monthly..."         │    │
│  │    [Chunk 3] "Payment methods: Wire transfer or..."        │    │
│  │                                                             │    │
│  │  User Question:                                             │    │
│  │    "Summarize contract terms about payment"                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  MODEL SELECTION (User Configured)                          │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │                                                             │    │
│  │  LOCAL MODELS (Best for privacy, cost-free)                │    │
│  │  ├─ Ollama (CPU/GPU)                                        │    │
│  │  │  ├─ llama3:8b (default, balanced)                        │    │
│  │  │  ├─ llama3:70b (high quality, slow)                      │    │
│  │  │  ├─ mistral:7b (fast, efficient)                         │    │
│  │  │  ├─ gemma2:9b (Google, good balance)                     │    │
│  │  │  └─ phi3:mini (3.8B, very fast)                          │    │
│  │  │                                                           │    │
│  │  ├─ LM Studio (CPU/GPU)                                     │    │
│  │  │  ├─ Same models as Ollama                                │    │
│  │  │  ├─ Better UI for model management                       │    │
│  │  │  └─ OpenAI-compatible API                                │    │
│  │  │                                                           │    │
│  │  └─ Local Transformers.js (CPU/GPU via ONNX)                │    │
│  │     ├─ Phi-3-mini-4k (3.8B)                                 │    │
│  │     ├─ TinyLlama (1.1B, very fast)                          │    │
│  │     └─ Runs in-process (no server needed)                   │    │
│  │                                                             │    │
│  │  CLOUD MODELS (Best for quality, requires API key)          │    │
│  │  ├─ OpenAI                                                  │    │
│  │  │  ├─ gpt-4o (best quality)                                │    │
│  │  │  ├─ gpt-4o-mini (fast, cheap)                            │    │
│  │  │  └─ gpt-3.5-turbo (cheapest)                             │    │
│  │  │                                                           │    │
│  │  ├─ Google Gemini                                           │    │
│  │  │  ├─ gemini-1.5-pro (128k context!)                       │    │
│  │  │  ├─ gemini-1.5-flash (fast, cheap)                       │    │
│  │  │  └─ gemini-2.0-flash-exp (latest)                        │    │
│  │  │                                                           │    │
│  │  ├─ Anthropic Claude                                        │    │
│  │  │  ├─ claude-3.5-sonnet (best reasoning)                   │    │
│  │  │  ├─ claude-3-opus (highest quality)                      │    │
│  │  │  └─ claude-3-haiku (fastest)                             │    │
│  │  │                                                           │    │
│  │  └─ Azure OpenAI                                            │    │
│  │     └─ Same models as OpenAI, enterprise                    │    │
│  │                                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  LLM INFERENCE (Generate Answer)                            │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  GPU Acceleration (for local models):                       │    │
│  │  ├─ AMD RX 580 8GB: ROCm 6.0+ (Linux only)                  │    │
│  │  │  └─ Fallback: CPU (works on Windows)                     │    │
│  │  ├─ NVIDIA: CUDA (Windows/Linux)                            │    │
│  │  └─ Apple Silicon: Metal (macOS)                            │    │
│  │                                                             │    │
│  │  Streaming Response: ✅ Real-time word-by-word              │    │
│  │  Context Window: Up to 128k tokens (Gemini 1.5)            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                            │                                         │
│                            ▼                                         │
│  Output: AI-generated answer with citations                         │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PHASE 6: RESPONSE FORMATTING                                        │
├─────────────────────────────────────────────────────────────────────┤
│  1. Format answer with markdown                                     │
│  2. Add source citations [1], [2], [3]                              │
│  3. Show confidence score (if available)                            │
│  4. Provide "Jump to source" links                                  │
│                                                                      │
│  Example Output:                                                    │
│  ┌────────────────────────────────────────────────────────┐        │
│  │  Payment Terms Summary:                                 │        │
│  │                                                         │        │
│  │  The contract specifies Net 30 payment terms [1].      │        │
│  │  Late payments incur a 2% monthly penalty [2].         │        │
│  │  Accepted methods: Wire transfer or check [3].         │        │
│  │                                                         │        │
│  │  Sources:                                               │        │
│  │  [1] Contract.pdf, page 12                             │        │
│  │  [2] Contract.pdf, page 12                             │        │
│  │  [3] Contract.pdf, page 13                             │        │
│  └────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Hardware Optimization - AMD RX 580 8GB

### Current Limitations
- **ROCm** (AMD's CUDA equivalent): Linux only
- **Windows**: No official ROCm support for consumer GPUs
- **RX 580 (Polaris)**: Older architecture, limited ML support

### Recommended Setup for Your PC

#### Option 1: CPU-Only (RECOMMENDED for Windows)
```
✅ Pros:
- Works out-of-box on Windows
- Stable and reliable
- No driver issues
- Good performance with optimized models

⚠️ Cons:
- Slower than GPU (2-5x)
- Higher CPU usage

Performance (AMD 5700X 8-core):
- llama3:8b: ~15-25 tokens/sec
- mistral:7b: ~20-30 tokens/sec
- phi3:mini: ~40-50 tokens/sec
```

#### Option 2: Vulkan/SYCL (Experimental)
```
⚙️ Ollama with Vulkan backend
- Recent Ollama versions support Vulkan
- Works on AMD/NVIDIA/Intel GPUs
- Windows compatible!

Setup:
1. Update Ollama to latest
2. Set environment: OLLAMA_VULKAN=1
3. Verify: GPU should show in ollama ps

Performance gain: 1.5-2x vs CPU
```

#### Option 3: Dual Linux Boot (Maximum Performance)
```
🐧 Ubuntu 22.04 + ROCm 6.0
- Full GPU acceleration
- 3-5x faster than CPU
- Best for heavy workloads

Setup:
1. Install Ubuntu 22.04
2. Install ROCm 6.0
3. Install Ollama
4. Verify: rocm-smi

Performance:
- llama3:8b: ~50-80 tokens/sec
- Can run larger models (13B, 20B)
```

### Recommendation for QSM
**Use CPU-first with Ollama** (easiest setup):
1. ✅ Ollama on Windows (CPU mode)
2. ⚙️ Enable Vulkan if supported
3. 🎯 Use smaller models (7B-9B) for best balance
4. 📦 Offload embeddings to Transformers.js (GPU via WebGPU)

---

## 🎨 UI Architecture - Model Selection

### Current UI Issues
❌ No explicit model selection
❌ No provider choice (Ollama/LM Studio/Cloud)
❌ No GPU acceleration options
❌ No model download UI

### Proposed UI Improvements

#### 1. Model Selection Panel (Sidebar)
```
┌─────────────────────────────────────┐
│  AI MODEL SETTINGS                  │
├─────────────────────────────────────┤
│                                     │
│  Provider: [Ollama ▼]               │
│    ├─ Ollama (Local)                │
│    ├─ LM Studio (Local)             │
│    ├─ OpenAI (Cloud)                │
│    ├─ Google Gemini (Cloud)         │
│    └─ Anthropic Claude (Cloud)      │
│                                     │
│  Model: [llama3:8b ▼]               │
│    ├─ llama3:8b (4.5 GB) ⬇️         │
│    ├─ mistral:7b (4.1 GB)           │
│    ├─ phi3:mini (2.3 GB) ⬇️         │
│    └─ + Pull new model...           │
│                                     │
│  Status: 🟢 Ready (CPU mode)        │
│  Performance: ~20 tokens/sec        │
│                                     │
│  Hardware:                          │
│  ☑ Enable Vulkan (experimental)    │
│  ☐ Use GPU if available             │
│                                     │
│  [Test Model] [Settings]            │
│                                     │
└─────────────────────────────────────┘
```

#### 2. Cloud Provider Config (Modal)
```
┌──────────────────────────────────────────┐
│  OpenAI Configuration                    │
├──────────────────────────────────────────┤
│                                          │
│  API Key: [**********************] 👁️   │
│                                          │
│  Model:   [gpt-4o-mini ▼]                │
│                                          │
│  Temperature: [0.7] ────────○────        │
│  Max Tokens:  [2048]                     │
│                                          │
│  💰 Estimated cost: $0.001 per query     │
│                                          │
│  [Test Connection] [Save]                │
│                                          │
└──────────────────────────────────────────┘
```

#### 3. Dual-Pane File Organization UI
```
┌───────────────────────────────────────────────────────────────────┐
│  DOCUMENT ORGANIZATION                                            │
├─────────────────────────────────┬─────────────────────────────────┤
│  SOURCE (Current Location)      │  TARGET (Suggested Structure)   │
├─────────────────────────────────┼─────────────────────────────────┤
│  📁 Unsorted/                   │  📁 Projects/                   │
│    ☑ contract_2024.pdf          │    ├─ 📁 Client A/              │
│    ☑ invoice_jan.pdf            │    │  └─ contract_2024.pdf  ←   │
│    ☐ report_q1.docx             │    └─ 📁 Client B/              │
│    ☐ presentation.pptx          │                                 │
│                                 │  📁 Finance/                    │
│  📁 Downloads/                  │    ├─ invoice_jan.pdf  ←        │
│    ☐ image1.png (duplicate)     │    └─ report_q1.docx  ←         │
│    ☐ image2.png                 │                                 │
│                                 │  📁 Marketing/                  │
│                                 │    └─ presentation.pptx  ←      │
│                                 │                                 │
│                                 │  🗑️ Duplicates (2 files)        │
│                                 │    └─ image1.png (delete)       │
├─────────────────────────────────┴─────────────────────────────────┤
│  Actions:                                                         │
│  [Move Selected (3)] [Copy] [Delete] [Create Folders] [Preview]  │
│                                                                   │
│  AI Confidence: ████████░░ 85%  |  [Accept All] [Reject All]     │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation - Complete Setup

### 1. Core Dependencies (Already Done ✅)
```powershell
cd D:\Work\Coding\QSM
npm install better-sqlite3 sqlite3
npm rebuild better-sqlite3
```

### 2. Ollama (Local LLM Server)
```powershell
# Download Ollama for Windows
# https://ollama.com/download/windows

# Install and verify
ollama --version

# Pull models (CPU-optimized)
ollama pull llama3:8b      # 4.5 GB, general purpose
ollama pull mistral:7b     # 4.1 GB, fast inference
ollama pull phi3:mini      # 2.3 GB, very fast
ollama pull nomic-embed-text  # For embeddings

# Test
ollama run llama3:8b "Hello, how are you?"
```

### 3. LM Studio (Alternative to Ollama)
```
Download: https://lmstudio.ai/
- GUI for model management
- OpenAI-compatible API
- Better Windows support
- Download same models as Ollama
```

### 4. Python Dependencies (For Docling)
```powershell
cd D:\Work\Coding\QSM\python
venv\Scripts\Activate.ps1
pip install ollama  # Python client for Ollama
pip install openai  # For OpenAI/Azure
pip install anthropic  # For Claude
pip install google-generativeai  # For Gemini
```

### 5. API Keys (Cloud Providers)
```
OpenAI: https://platform.openai.com/api-keys
Google AI Studio: https://makersuite.google.com/app/apikey
Anthropic: https://console.anthropic.com/
```

---

## 🔄 Implementation Plan

### Phase 1: Model Selection UI (2 hours)
1. Create `ModelSelectionPanel` component
2. Add provider dropdown (Ollama, LM Studio, OpenAI, Gemini, Claude)
3. Add model selector with model info (size, speed)
4. Add API key config modal for cloud providers
5. Save config to localStorage

### Phase 2: LLM Integration Service (3 hours)
1. Create `llmService.ts`:
   - `callOllama(model, prompt, context)`
   - `callLMStudio(model, prompt, context)`
   - `callOpenAI(model, prompt, context)`
   - `callGemini(model, prompt, context)`
   - `callClaude(model, prompt, context)`

2. Unified interface:
   ```typescript
   interface LLMResponse {
     answer: string;
     tokens: number;
     latency: number;
     model: string;
   }
   
   async callLLM(
     provider: 'ollama' | 'lmstudio' | 'openai' | 'gemini' | 'claude',
     model: string,
     prompt: string,
     context: string[]
   ): Promise<LLMResponse>
   ```

### Phase 3: Query UI Integration (2 hours)
1. Update `QueryInterface` component
2. Show retrieved chunks (RAG context)
3. Add "Sources" section with citations
4. Stream responses (word-by-word)
5. Show performance metrics (latency, tokens/sec)

### Phase 4: Dual-Pane Organization UI (4 hours)
1. Create `DualPaneOrganizer` component
2. Left pane: Current file tree
3. Right pane: AI-suggested structure
4. Drag-drop between panes
5. Batch operations (move, copy, delete)
6. Preview before applying

### Phase 5: Testing & Optimization (2 hours)
1. Test with all model providers
2. Benchmark performance (CPU vs Vulkan)
3. Optimize prompts for different models
4. Add error handling and retries

**Total Estimated Time**: 13 hours (Day 2 + part of Day 3)

---

## 🎯 Next Immediate Steps

1. ✅ Schema applied
2. ⏳ Create Python batch test script (simpler than Node.js version)
3. 🧠 Implement Model Selection UI
4. 🔌 Integrate Ollama API
5. 🎨 Build Dual-Pane Organizer UI
6. 🚀 Test end-to-end workflow

Ready to implement! 🔥
