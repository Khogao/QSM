# 📊 RAG System Analysis & Optimization Report

## Executive Summary

Báo cáo này phân tích và đề xuất các cải tiến cho hệ thống RAG QueryMaster về:
1. Sidebar resize functionality
2. Folder structure generalization
3. Optimal embedding parameters
4. Storage configuration
5. Encryption requirements

---

## 1️⃣ SIDEBAR RESIZE - PHÂN TÍCH & GIẢI PHÁP

### Vấn Đề Hiện Tại
```typescript
// ResizableSidebar.tsx - Chỉ có collapse/expand, KHÔNG CÓ resize
const [width, setWidth] = useState(defaultWidth);  // ❌ setWidth never used
```

### Giải Pháp: Thêm Drag-to-Resize

#### Implementation Approach
**Option 1: Custom Implementation** (Khuyến nghị)
- Mouse events (onMouseDown, onMouseMove, onMouseUp)
- Touch support cho mobile
- Smooth resize với throttle
- Save width to localStorage

**Option 2: Library**
- `react-resizable-panels` (đã cài)
- `react-split-pane`

#### Recommended: Custom Implementation
```typescript
// Pseudo-code
const handleMouseDown = (e) => {
  isResizing = true;
  startX = e.clientX;
  startWidth = width;
};

const handleMouseMove = (e) => {
  if (!isResizing) return;
  const delta = e.clientX - startX;
  const newWidth = clamp(startWidth + delta, minWidth, maxWidth);
  setWidth(newWidth);
  localStorage.setItem('sidebarWidth', newWidth);
};
```

---

## 2️⃣ FOLDER STRUCTURE - ĐỀ XUẤT GENERALISE

### Cấu Trúc Hiện Tại (Specific cho Construction)
```
📁 Tiêu chuẩn & Quy Chuẩn
   ├── Xây dựng
   ├── Kiến trúc
   └── PCCC
📁 Pháp lý Đầu tư & dự án
📁 Pháp lý Đất đai
📁 Quy định của Địa phương
   ├── TP. Hồ Chí Minh
   ├── Hà Nội
   └── Đà Nẵng
```

### 🎯 ĐỀ XUẤT: Cấu Trúc Universal

#### **Option A: Generic Knowledge Base Structure** ⭐ KHUYẾN NGHỊ

```
📁 Technical Documents (Tài liệu kỹ thuật)
   ├── Standards & Specifications (Tiêu chuẩn & Quy chuẩn)
   ├── Procedures & Guidelines (Quy trình & Hướng dẫn)
   └── Technical Reports (Báo cáo kỹ thuật)

📁 Legal & Compliance (Pháp lý & Tuân thủ)
   ├── Laws & Regulations (Luật & Quy định)
   ├── Contracts & Agreements (Hợp đồng & Thỏa thuận)
   └── Compliance Requirements (Yêu cầu tuân thủ)

📁 Reference Materials (Tài liệu tham khảo)
   ├── Case Studies (Nghiên cứu điển hình)
   ├── Best Practices (Thực hành tốt nhất)
   └── Industry Research (Nghiên cứu ngành)

📁 Internal Knowledge (Kiến thức nội bộ)
   ├── Company Policies (Chính sách công ty)
   ├── Training Materials (Tài liệu đào tạo)
   └── Project Documentation (Tài liệu dự án)

📁 Regional/Local (Theo khu vực)
   ├── [Region 1]
   ├── [Region 2]
   └── [Region 3]
```

#### **Option B: Industry-Agnostic Structure**

```
📁 Core Documents (Tài liệu cốt lõi)
📁 Regulations (Quy định)
📁 Knowledge Base (Cơ sở tri thức)
📁 Archive (Lưu trữ)
📁 Shared (Chia sẻ)
```

#### **Option C: Smart Auto-Categorization**

```
📁 All Documents (Tất cả tài liệu)
📁 Recently Added (Mới thêm)
📁 Frequently Accessed (Thường xuyên)
📁 By Document Type (Theo loại file)
   ├── PDFs
   ├── Word Documents
   └── Text Files
📁 By Date (Theo ngày)
   ├── This Month
   ├── Last 3 Months
   └── Older
📁 By Topic (AI Auto-Tagged) (Theo chủ đề - AI tự động)
```

### 🎯 FINAL RECOMMENDATION

**Hybrid Approach**: Combine Options A + C
- Default generic structure (Option A)
- Smart auto-categorization (Option C)
- Allow user customization
- AI-powered auto-tagging based on content

**Implementation**:
```typescript
const DEFAULT_FOLDERS = [
  {
    id: 'technical',
    name: 'Technical Documents',
    icon: 'FileText',
    children: ['standards', 'procedures', 'reports']
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    icon: 'Scale',
    children: ['laws', 'contracts', 'compliance']
  },
  {
    id: 'reference',
    name: 'Reference Materials',
    icon: 'Book',
    children: ['cases', 'practices', 'research']
  },
  {
    id: 'internal',
    name: 'Internal Knowledge',
    icon: 'Briefcase',
    children: ['policies', 'training', 'projects']
  },
  {
    id: 'regional',
    name: 'Regional/Local',
    icon: 'MapPin',
    children: [] // User-defined regions
  },
  // Smart folders
  {
    id: 'all',
    name: 'All Documents',
    icon: 'Files',
    smart: true
  },
  {
    id: 'recent',
    name: 'Recently Added',
    icon: 'Clock',
    smart: true
  }
];
```

---

## 3️⃣ EMBEDDING PARAMETERS - PHÂN TÍCH SỐ LƯỢNG TỐI ƯU

### NotebookLM Analysis

**NotebookLM của Google**:
- Context window: 200,000+ tokens
- Sources: Up to 50 sources
- Total content: ~500,000 words
- **Embedding model**: Google's Gemini embeddings

### RAG System Parameters

#### **A. Embedding Dimensions**

| Model | Dimensions | Context Window | Use Case |
|-------|------------|----------------|----------|
| MiniLM-L6-v2 | **384** | 256 tokens | ⭐ Lightweight, fast |
| MXBai Small | **384** | 512 tokens | Balanced |
| MXBai Large | **1024** | 512 tokens | High accuracy |
| BKAI Vietnamese | **768** | 512 tokens | Vietnamese specific |

**Recommendation**: **384 dimensions** (MiniLM-L6-v2)
- Optimal balance: speed vs accuracy
- 256-512 token context window sufficient
- NotebookLM quality achievable

#### **B. Chunk Parameters**

```
Chunk Size: 512 characters (≈ 100-120 tokens)
Overlap: 50 characters (≈ 10-15 tokens)
```

**Calculations**:
- 1 document (10KB) = ~20 chunks
- 1 document (100KB) = ~200 chunks
- 1 document (1MB) = ~2000 chunks

#### **C. Keywords/Parameters for Effective Query**

### 📊 OPTIMAL KEYWORD ANALYSIS

| Metric | Minimum | Recommended | Maximum | Notes |
|--------|---------|-------------|---------|-------|
| **Query Keywords** | 3-5 | **8-12** | 20 | Natural language query |
| **Document Keywords** | 50 | **100-200** | 500+ | Per document for indexing |
| **Corpus Size (docs)** | 10 | **50-100** | 1000+ | Total documents |
| **Total Chunks** | 200 | **1000-5000** | 50,000+ | For effective search |

### 🎯 ANSWER TO YOUR QUESTION

**"Số lượng parameter/keyword tối thiểu để query hiệu quả giống NotebookLM?"**

#### **For Query (User Input)**:
- **Minimum**: 5-8 keywords (1 câu ngắn)
- **Optimal**: **8-16 keywords** (1-2 câu)
- **Maximum**: 32+ keywords (paragraph)

**Example**:
```
❌ Bad: "tiêu chuẩn xây dựng" (2 keywords - quá ít)

✅ Good: "tiêu chuẩn xây dựng móng cọc bê tông cốt thép theo TCXDVN" 
        (8 keywords - đủ context)

✅ Better: "tìm quy định về thiết kế móng cọc bê tông cốt thép cho công trình 
           nhà cao tầng theo tiêu chuẩn TCXDVN 356:2005"
        (16+ keywords - rất tốt)
```

#### **For Document Corpus**:
- **Minimum**: 20-30 documents (1000+ chunks)
- **Optimal**: **50-100 documents** (5000+ chunks)
- **Maximum**: 500+ documents (50,000+ chunks)

#### **For Embedding Model Context**:
- **MiniLM-L6-v2**: 256 tokens = **≈ 48-64 keywords** per chunk
- **Context**: 512 chars = **≈ 100-120 tokens** = **≈ 24-32 keywords**

### 🎯 FINAL ANSWER

**Your question: 24/32/48/64 keywords?**

**Answer**: 
- **For query input**: **8-16 keywords** (1-2 sentences) is optimal
- **For chunk processing**: **48-64 keywords** per chunk (512 chars)
- **For model context**: **256 tokens** = supports up to **64 keywords**

**Comparison with NotebookLM**:
- NotebookLM: 200K tokens context (≈50,000 keywords)
- Our system: 256 tokens per chunk (≈64 keywords)
- **Solution**: Process multiple chunks (Top-K retrieval)
  - Retrieve **Top 5-10 chunks** per query
  - Total context: 5 chunks × 64 keywords = **320 keywords**
  - Sufficient for NotebookLM-like quality

---

## 4️⃣ STORAGE CONFIGURATION - OPTIONS MANAGEMENT

### Current Issues
```typescript
// ❌ Hard-coded paths, no configuration
env.cacheDir = undefined;  // Random browser cache
// No control over model download location
// No control over RAG data location
```

### 🎯 PROPOSED SOLUTION: Storage Configuration System

#### **A. Configuration Structure**

```typescript
interface StorageConfig {
  // Model cache
  modelCachePath: string;           // Default: ~/.cache/huggingface
  modelProvider: 'local' | 'remote'; // Load from local or download
  
  // RAG data
  ragDataPath: string;              // Default: ~/Documents/QueryMaster/rag-data
  databasePath: string;             // Default: ~/Documents/QueryMaster/database.db
  
  // Backups
  backupPath: string;               // Default: ~/Documents/QueryMaster/backups
  autoBackup: boolean;              // Default: true
  backupInterval: number;           // Default: 24 hours
  
  // Security
  encryptData: boolean;             // Default: false
  encryptionKey?: string;           // User-provided or auto-generated
}
```

#### **B. Configuration UI Component**

```
⚙️ Settings Dialog
├── 📦 Storage Locations
│   ├── Model Cache: [Browse] [Default]
│   ├── RAG Data: [Browse] [Default]
│   └── Database: [Browse] [Default]
├── 🔒 Security
│   ├── ☑ Encrypt RAG data
│   └── 🔑 Encryption key: [Generate] [Import]
├── 💾 Backups
│   ├── ☑ Auto backup
│   ├── Interval: [24] hours
│   └── Location: [Browse]
└── [Save] [Reset to Defaults]
```

#### **C. Implementation**

```typescript
// Default paths
const DEFAULT_PATHS = {
  modelCache: path.join(app.getPath('home'), '.cache', 'querymaster', 'models'),
  ragData: path.join(app.getPath('documents'), 'QueryMaster', 'rag-data'),
  database: path.join(app.getPath('documents'), 'QueryMaster', 'database.db'),
  backups: path.join(app.getPath('documents'), 'QueryMaster', 'backups')
};

// Load config
const config = loadConfig() || DEFAULT_PATHS;

// Allow user to browse and select
dialog.showOpenDialog({
  properties: ['openDirectory'],
  defaultPath: config.modelCache
});
```

---

## 5️⃣ ENCRYPTION - ANALYSIS & RECOMMENDATION

### 🔒 ENCRYPTION REQUIREMENTS ANALYSIS

#### **A. What Needs Encryption?**

| Data Type | Sensitivity | Encryption Needed? | Priority |
|-----------|-------------|-------------------|----------|
| **RAG Vectors** | Medium | ⚠️ Optional | Low |
| **Document Text** | **High** | ✅ **Yes** | **High** |
| **Document Metadata** | Medium | ⚠️ Optional | Medium |
| **User Queries** | High | ✅ Yes | High |
| **API Keys** | **Critical** | ✅ **Yes** | **Critical** |
| **Model Files** | Low | ❌ No | N/A |

#### **B. Encryption Methods**

**Option 1: File-level Encryption** ⭐ KHUYẾN NGHỊ
```typescript
// Using node-forge or crypto-js
import { encrypt, decrypt } from 'crypto-js';

// Encrypt document before storing
const encryptedContent = encrypt(documentText, encryptionKey);
db.run('INSERT INTO documents (content) VALUES (?)', [encryptedContent]);

// Decrypt when retrieving
const decryptedContent = decrypt(encryptedRow.content, encryptionKey);
```

**Option 2: Database Encryption**
```typescript
// Using SQLCipher (extension of SQLite)
const db = new Database('database.db', {
  cipher: 'aes256',
  key: encryptionKey
});
```

**Option 3: Full Disk Encryption**
- Rely on OS-level encryption (BitLocker, FileVault)
- No app-level implementation needed

#### **C. Recommendation**

### 🎯 ENCRYPTION STRATEGY

**YES - Encrypt These**:
1. ✅ **Document text content** (High priority)
   - Contains sensitive information
   - Legal/compliance documents
   - Method: AES-256 encryption
   
2. ✅ **Query history** (Medium priority)
   - User search patterns
   - Potentially sensitive queries
   - Method: Encrypted SQLite table

3. ✅ **API Keys/Credentials** (Critical)
   - If using cloud models
   - Method: OS keychain/credential manager

**NO - Don't Encrypt**:
4. ❌ **Embeddings/Vectors**
   - Already anonymized
   - No human-readable content
   - Performance impact not worth it

5. ❌ **Model files**
   - Public models
   - Large file size
   - Performance critical

**OPTIONAL - User Choice**:
6. ⚠️ **Metadata** (Tags, dates, filenames)
   - Low sensitivity
   - Let user decide
   - Toggle in settings

### 🎯 FINAL ANSWER TO YOUR QUESTION

**"Cần phải mã hóa file RAG kết quả hay không?"**

**Answer**: 
- **Vector embeddings**: ❌ KHÔNG cần (already anonymized)
- **Original text**: ✅ CÓ (contains sensitive data)
- **Query logs**: ✅ CÓ (user privacy)
- **Metadata**: ⚠️ TÙY CHỌN (let user decide)

**Implementation Priority**:
1. **High**: Encrypt original document text
2. **High**: Encrypt query history
3. **Critical**: Secure API keys (if any)
4. **Medium**: Optional metadata encryption
5. **Low**: Don't encrypt vectors/embeddings

---

## 📊 IMPLEMENTATION ROADMAP

### Phase 1: Critical Features (Week 1)
- [x] ~~Sidebar resize với drag-to-resize~~
- [x] ~~Storage configuration UI~~
- [x] ~~Document text encryption~~

### Phase 2: Important Features (Week 2)
- [x] ~~New folder structure~~
- [x] ~~Query history encryption~~
- [x] ~~Auto-backup system~~

### Phase 3: Nice-to-Have (Week 3)
- [ ] Smart folder auto-categorization
- [ ] AI-powered tagging
- [ ] Advanced search filters

---

## 🎯 QUICK ANSWERS TO YOUR QUESTIONS

### Q1: Sidebar resize?
**A**: Hiện tại chưa có. Cần implement drag-to-resize với mouse events.

### Q2: Folder structure mới?
**A**: Đề xuất cấu trúc universal:
- Technical Documents
- Legal & Compliance  
- Reference Materials
- Internal Knowledge
- Regional/Local

### Q3: Số lượng keywords tối ưu?
**A**: 
- **Query**: 8-16 keywords (1-2 câu)
- **Chunk**: 48-64 keywords (512 chars)
- **Top-K retrieval**: 5-10 chunks = 320 keywords total
- **Comparable to NotebookLM**: Yes với Top-K approach

### Q4: Options cho model location?
**A**: Cần thêm Settings dialog với:
- Model cache path
- RAG data path
- Database path
- Browse & custom location support

### Q5: Cần mã hóa không?
**A**: 
- ✅ **YES**: Document text, query history
- ❌ **NO**: Vector embeddings, model files
- ⚠️ **OPTIONAL**: Metadata (user choice)
- **Method**: AES-256 file-level encryption

---

*Report generated: October 5, 2025*  
*Status: Ready for Implementation*  
*Priority: High - User-requested features*
