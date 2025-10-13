# 📋 Dropdown Menu Documentation - Hướng Dẫn Chi Tiết

## Tổng Quan Các Dropdown Menu Trong App

Tài liệu này mô tả tất cả các dropdown menu đã được cải thiện trong ứng dụng QueryMaster RAG System.

---

## 1️⃣ Nền Tảng AI (Platform Dropdown)

### Vị trí
**Component**: `ModelSelector.tsx`  
**Section**: Mô hình AI (Sidebar)

### Mục đích
Chọn nền tảng để chạy AI models (LLM và Embedding)

### Các Options

| Platform | Tên Hiển Thị | Description | Icon | Khi Nào Dùng |
|----------|--------------|-------------|------|--------------|
| `huggingface` | **Hugging Face** | Chạy trên trình duyệt | 🖥️ | Không cần cài đặt gì, chạy trực tiếp trong browser |
| `ollama` | **Ollama** | Chạy trên máy cục bộ | 🖥️ | Đã cài Ollama, muốn chạy offline |
| `llamacpp` | **LlamaCPP** | Server cục bộ | 🖥️ | Có LlamaCPP server đang chạy |

### Tính Năng UI
- ✅ Label: "Nền tảng AI" (thay vì "Platform")
- ✅ Icon: Server icon cho mỗi platform
- ✅ Description: Giải thích ngắn gọn ở bên phải
- ✅ Layout: Two-column (tên + description)
- ✅ Disabled khi đang loading model

### Code Example
```tsx
<Select value={selectedPlatform} onValueChange={handlePlatformChange}>
  <SelectTrigger>
    <SelectValue placeholder="Chọn nền tảng" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="huggingface">
      <Server /> Hugging Face - Chạy trên trình duyệt
    </SelectItem>
  </SelectContent>
</Select>
```

---

## 2️⃣ Mô Hình Ngôn Ngữ (LLM Dropdown)

### Vị trí
**Component**: `ModelSelector.tsx`  
**Section**: Mô hình AI (Sidebar)

### Mục đích
Chọn model ngôn ngữ lớn (Large Language Model) để xử lý queries

### Các Model Khả Dụng

#### **Hugging Face Platform**
| Model ID | Tên Hiển Thị | Parameters | Use Case |
|----------|--------------|------------|----------|
| `llama-3.1-sonar-small-128k-online` | Llama 3.1 Sonar Small | 8B | Truy vấn thông thường, nhanh |
| `llama-3.1-sonar-large-128k-online` | Llama 3.1 Sonar Large | 70B | Cân bằng speed vs accuracy |
| `llama-3.1-sonar-huge-128k-online` | Llama 3.1 Sonar Huge | 405B | Độ chính xác cao nhất |
| `local-embedding-model` | Local Embedding Model | Nhẹ | Offline, không cần internet |
| `bkai-vietnamese-encoder` | BKAI Vietnamese Encoder | Trung bình | Tối ưu tiếng Việt |

#### **Ollama Platform**
| Model ID | Tên Hiển Thị | Parameters | Yêu Cầu |
|----------|--------------|------------|---------|
| `llama3:8b` | Llama 3 8B | 8B | Cài Ollama, pull model |

### Tính Năng UI
- ✅ Label: "Mô hình Ngôn ngữ (LLM)" (giải thích rõ hơn)
- ✅ Parameters badge: Hiển thị trong badge đẹp (8B, 70B, 405B)
- ✅ Info button: Tooltip "Xem thông tin chi tiết model"
- ✅ Empty state: Message khi không có model khả dụng
- ✅ Auto-filter: Chỉ hiện models của platform đã chọn
- ✅ Disabled khi loading

### RAM Warning
- Model 70B+: Cảnh báo nếu RAM < 8GB
- Màu amber alert với icon AlertCircle
- Message: "Model này yêu cầu nhiều RAM hơn"

---

## 3️⃣ Mô Hình Vector Embedding (Embedding Dropdown)

### Vị trí
**Component**: `ModelSelector.tsx`  
**Section**: Mô hình AI (Sidebar)

### Mục đích
Chọn model để chuyển văn bản thành vectors (embeddings) cho tìm kiếm semantic

### Các Model Khả Dụng

| Model ID | Tên Hiển Thị | Description | Dimensions | Platform |
|----------|--------------|-------------|------------|----------|
| `mixedbread-ai/mxbai-embed-small-v1` | MXBai Embed Small | Đa ngôn ngữ, nhỏ | 384 | HuggingFace |
| `mixedbread-ai/mxbai-embed-large-v1` | MXBai Embed Large | Đa ngôn ngữ, lớn | 1024 | HuggingFace |
| `mixedbread-ai/mxbai-embed-xsmall-v1` | MXBai Embed XSmall | Cực nhỏ, thiết bị yếu | 256 | HuggingFace |
| `Xenova/all-MiniLM-L6-v2` | **MiniLM-L6-v2** ⭐ | Đa năng, gọn nhẹ | 384 | HuggingFace |
| `bkai-foundation-models/vietnamese-bi-encoder` | BKAI Vietnamese | Tối ưu tiếng Việt | 768 | HuggingFace |

### Tính Năng UI
- ✅ Label: "Mô hình Vector Embedding" (giải thích rõ)
- ✅ Two-line display: Tên + description
- ✅ Description trong dropdown item
- ✅ Tooltip: "Embedding models chuyển văn bản thành vector để tìm kiếm"
- ✅ Info button

### Khuyến Nghị
- **Mặc định**: `Xenova/all-MiniLM-L6-v2` (reliable, fast, 384D)
- **Tiếng Việt**: `bkai-foundation-models/vietnamese-bi-encoder`
- **Thiết bị yếu**: `mixedbread-ai/mxbai-embed-xsmall-v1`

---

## 4️⃣ Độ Phân Giải OCR (Resolution Radio Buttons)

### Vị trí
**Component**: `OcrConfigPanel.tsx`  
**Section**: Cấu hình OCR (Sidebar) → Dialog

### Mục đích
Chọn độ phân giải để scan/OCR documents

### Các Options

| Value | Label | Description | DPI | Use Case |
|-------|-------|-------------|-----|----------|
| `low` | **Thấp** | Nhanh, 150 DPI | 150 | Văn bản rõ, cần speed |
| `medium` | **Trung bình** | Cân bằng, 300 DPI | 300 | ✅ Khuyến nghị (default) |
| `high` | **Cao** | Chính xác, 600 DPI | 600 | Văn bản mờ, cần quality |

### Tính Năng UI
- ✅ Radio buttons thay vì dropdown
- ✅ Hiển thị DPI values
- ✅ Font-weight bold cho label
- ✅ Gray color cho description
- ✅ Radio button size 4x4 (dễ click)
- ✅ Cursor pointer
- ✅ Label: "Độ phân giải quét"

### Khuyến Nghị
- **Mặc định**: Medium (300 DPI) - cân bằng tốt
- **Nhanh**: Low nếu văn bản rõ ràng
- **Chất lượng**: High nếu scan từ giấy cũ/mờ

---

## 5️⃣ Ngôn Ngữ Nhận Diện (OCR Language Dropdown)

### Vị trí
**Component**: `OcrConfigPanel.tsx`  
**Section**: Cấu hình OCR (Sidebar) → Dialog

### Mục đích
Chọn ngôn ngữ chính trong documents để OCR chính xác hơn

### Các Options

| Value | Display | Emoji | Use Case |
|-------|---------|-------|----------|
| `vietnamese` | 🇻🇳 Tiếng Việt | 🇻🇳 | Tài liệu 100% tiếng Việt |
| `english` | 🇬🇧 Tiếng Anh | 🇬🇧 | Tài liệu 100% English |
| `mixed` | 🌐 Hỗn hợp (Việt + Anh) | 🌐 | ✅ Khuyến nghị - Văn bản kỹ thuật |

### Tính Năng UI
- ✅ Emoji cờ quốc gia
- ✅ Description chi tiết
- ✅ Focus ring màu xanh
- ✅ Tooltip: "Chọn ngôn ngữ chính trong tài liệu"
- ✅ Label: "Ngôn ngữ nhận diện"

### Khuyến Nghị
- **Mặc định**: Mixed (hỗn hợp) - phù hợp tiêu chuẩn kỹ thuật VN
- Tiêu chuẩn xây dựng VN thường có cả Việt + English terms

---

## 6️⃣ Chế Độ Xử Lý (OCR Accuracy Dropdown)

### Vị trí
**Component**: `OcrConfigPanel.tsx`  
**Section**: Cấu hình OCR (Sidebar) → Dialog

### Mục đích
Chọn ưu tiên giữa tốc độ và độ chính xác

### Các Options

| Value | Display | Emoji | Description | Use Case |
|-------|---------|-------|-------------|----------|
| `speed` | ⚡ Tốc độ | ⚡ | Xử lý nhanh | Nhiều files, cần nhanh |
| `balanced` | ⚖️ Cân bằng | ⚖️ | ✅ Khuyến nghị | Mặc định, phù hợp nhất |
| `accuracy` | 🎯 Độ chính xác | 🎯 | Chậm hơn | Văn bản quan trọng |

### Tính Năng UI
- ✅ Emoji biểu tượng
- ✅ Description trong ngoặc
- ✅ Focus ring
- ✅ Tooltip: "Chọn ưu tiên giữa tốc độ và độ chính xác"
- ✅ Label: "Chế độ xử lý" (thay vì "Ưu tiên")

### Khuyến Nghị
- **Mặc định**: Balanced (cân bằng)
- **Batch import**: Speed nếu có nhiều files
- **Legal docs**: Accuracy cho documents quan trọng

---

## 🎨 UI/UX Improvements Summary

### Visual Enhancements
1. ✅ **Icons**: Server, Info, Download icons với Lucide React
2. ✅ **Emojis**: Cờ quốc gia 🇻🇳🇬🇧🌐 và symbols ⚡⚖️🎯
3. ✅ **Badges**: Parameters trong rounded badge (8B, 70B)
4. ✅ **Two-line display**: Name + description trong dropdown items
5. ✅ **Focus rings**: Blue ring khi focus vào select/input
6. ✅ **Tooltips**: Title attributes cho all buttons
7. ✅ **Cursor**: Pointer cursor cho interactive elements

### Accessibility Improvements
1. ✅ **Labels**: Descriptive labels thay vì technical terms
2. ✅ **Placeholders**: Clear placeholders cho empty state
3. ✅ **Tooltips**: Giải thích function của mỗi control
4. ✅ **Disabled states**: Visual feedback khi loading
5. ✅ **Empty states**: Message khi không có options
6. ✅ **Help text**: Descriptions ngay trong dropdown

### Content Improvements
1. ✅ **Vietnamese**: All labels trong tiếng Việt
2. ✅ **Technical terms**: Giải thích (LLM, Embedding, DPI)
3. ✅ **Use cases**: Description cho mỗi option
4. ✅ **Recommendations**: Khuyến nghị (⭐) cho best options
5. ✅ **Platform names**: Full names thay vì codes

---

## 🔧 Technical Implementation

### Component Structure
```
App.tsx
└── SidebarContent
    ├── FolderList
    ├── ModelSelector  ← Platform, LLM, Embedding dropdowns
    └── OcrConfigPanel ← Resolution, Language, Accuracy dropdowns
```

### State Management
```typescript
// Platform state
const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('ollama');

// Model states
const [selectedModel, setSelectedModel] = useState<AiModelType>('llama3:8b');
const [embeddingModel, setEmbeddingModel] = useState<EmbeddingModelType>('Xenova/all-MiniLM-L6-v2');

// OCR config state
const { config, updateConfig } = useOcrConfig();
// config: { resolution: 'medium', language: 'vietnamese', accuracy: 'balanced' }
```

### Filtering Logic
```typescript
// Auto-filter models by selected platform
const filteredModels = getModelsByPlatform(selectedPlatform);

// If current model not in filtered list, switch to first available
if (!filteredModels.some(m => m.id === selectedModel)) {
  setSelectedModel(filteredModels[0]?.id);
}
```

---

## 📱 User Experience Flow

### Typical User Journey

1. **Chọn Platform** (Nền tảng AI)
   - User opens app → sees "Hugging Face" pre-selected
   - Can switch to Ollama if installed locally
   
2. **Chọn LLM Model** (Mô hình Ngôn ngữ)
   - Dropdown auto-filters based on platform
   - User sees parameters (8B, 70B) to make informed choice
   - Click Info button to see full details
   
3. **Chọn Embedding Model** (Mô hình Vector)
   - User sees description right in dropdown
   - Default "MiniLM-L6-v2" pre-selected (reliable)
   
4. **Load Models** (Tải Models)
   - Click "Tải LLM" button
   - Click "Tải Embedding" button
   - See progress spinner + toast notifications
   
5. **Configure OCR** (Optional)
   - Click Settings icon
   - Adjust resolution (default: Medium 300 DPI)
   - Select language (default: Mixed)
   - Choose accuracy (default: Balanced)
   - Save config

6. **Import Documents**
   - Models loaded → ready to process
   - Upload files → RAG pipeline starts
   - OCR settings applied automatically

---

## ✅ Quality Checklist

### For Each Dropdown
- [x] Clear Vietnamese label
- [x] Helpful description/tooltip
- [x] Visual indicators (icons/emojis)
- [x] Default value pre-selected
- [x] Disabled state when loading
- [x] Empty state message
- [x] Accessibility (titles, labels)
- [x] Responsive design
- [x] Consistent styling

### Testing
- [x] All dropdowns render correctly
- [x] Platform filtering works
- [x] Model info displays
- [x] OCR config saves
- [x] Tooltips show on hover
- [x] Focus states visible
- [x] Empty states handled
- [x] Loading states show

---

## 🚀 Next Steps

### Planned Enhancements
1. **Search in dropdowns**: Filter options by typing
2. **Model favorites**: Star frequently used models
3. **Preset configs**: Save/load OCR presets
4. **Model comparison**: Side-by-side comparison view
5. **Usage stats**: Show which models used most
6. **Auto-detect**: Suggest best platform based on system

### Future Improvements
- Dark mode support for dropdowns
- Keyboard shortcuts (Ctrl+P for platform, etc.)
- Recent selections history
- Model recommendations based on document type

---

*Last updated: October 5, 2025*  
*Version: 1.0 - Post YOLO Mode Improvements*  
*Status: ✅ All dropdowns verified and improved*
