# 🚀 QUICK START - Local LLM Text Restructuring

## ⚡ **3 BƯỚC CÀI ĐẶT:**

### **1. Cài dependencies (2 phút)**
```powershell
cd D:\Work\Coding\QSM
.\python\venv\Scripts\Activate.ps1
pip install transformers torch accelerate psutil
```

### **2. Test demo (5 phút)**
```powershell
python python/demo_local_llm.py
```
Chọn model `1` (Qwen2.5-7B) ⭐ KHUYÊN DÙNG

### **3. Sử dụng**
```python
from text_restructure_local import LocalLLMRestructurer

restructurer = LocalLLMRestructurer(model_name="qwen")
restructured, metadata = restructurer.restructure(ocr_text, doc_type="contract")
```

---

## 🤖 **CHỌN MODEL:**

| Model | Khi nào dùng? |
|-------|---------------|
| **qwen** | Máy mạnh (16GB RAM) - Chất lượng cao nhất ⭐ |
| **llama** | Máy yếu (8GB RAM) - Nhanh nhất |
| **phi** | Dùng CPU (không GPU) - Optimize tốt |

---

## 📝 **SỬ DỤNG NHANH:**

```powershell
# Restructure 1 file
python python/text_restructure_local.py \
    --model qwen \
    --input "test_ocr.txt" \
    --output "fixed.txt" \
    --type contract

# List models
python python/text_restructure_local.py --list-models

# Check system
python python/text_restructure_local.py --check
```

---

## ✅ **ƯU ĐIỂM:**

- 🆓 **MIỄN PHÍ** (không tốn API)
- 🔒 **BẢO MẬT** (tài liệu không rời máy)
- ⚡ **NHANH** (10-60s/document)
- 🌐 **OFFLINE** (không cần internet)

---

## 📖 **CHI TIẾT:**

Xem: `docs/guides/GUIDE_LOCAL_LLM_SETUP.md`

---

**Created:** October 27, 2025  
**By:** Quicord Development Team
