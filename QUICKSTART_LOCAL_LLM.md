# 🚀 QUICK START - Local LLM Text Restructuring

> **Updated:** October 27, 2025 - Now with Qwen 2.5 series (32K context!)

## ⚡ **3 BƯỚC CÀI ĐẶT:**

### **1. Cài dependencies (2 phút)**
```powershell
cd D:\Work\Coding\QSM
.\python\venv\Scripts\Activate.ps1
pip install transformers torch accelerate psutil bitsandbytes
```

### **2. Optional: Install LLM model (5-10 phút)**
```powershell
# Interactive installer
python python/install_llm_optional.py

# Chọn model:
# 1. Qwen2.5-3B (🏆 BEST! 3GB, 32K context, 87% quality)
# 2. Qwen2.5-1.5B (⚡ FASTEST! 1.5GB, 32K context, 82% quality)
# 0. Skip (không cần LLM)
```

### **3. Test demo**
```powershell
python python/demo_local_llm.py
```

---

## 🤖 **CHỌN MODEL:**

| Model | Khi nào dùng? | Size | Context |
|-------|---------------|------|---------|
| **qwen3b** 🏆 | Máy trung bình (12-16GB RAM) - Tốt nhất | 3GB | **32K** |
| **qwen1.5b** ⚡ | Máy yếu (8GB RAM) - Nhanh nhất | 1.5GB | **32K** |
| **qwen7b** 💎 | Máy khỏe (16GB+ RAM) - Chất lượng cao nhất | 8GB | **32K** |

**ĐẶC BIỆT:** Tất cả models đều có **32K context** - đủ cho HỢP ĐỒNG DÀI!

---

## 📝 **SỬ DỤNG NHANH:**

```powershell
# Restructure 1 file
python python/text_restructure_local.py \
    --model qwen3b \
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
- ⚡ **NHANH** (10-30s/document)
- 🌐 **OFFLINE** (không cần internet)
- 📄 **32K CONTEXT** (xử lý hợp đồng dài!)

---

## 🆕 **CẢI TIẾN MỚI (Oct 2025):**

✅ **32K context** (vs 4K/8K cũ) - Xử lý được hợp đồng 10+ trang!  
✅ **Qwen 2.5** series (vs 2.0) - Mới nhất từ Alibaba  
✅ **62% nhỏ hơn** (3GB vs 8GB) - Tiết kiệm RAM!  
✅ **Optional install** - Không bundle vào app  

---

## 📖 **CHI TIẾT:**

- Setup: `docs/guides/GUIDE_LOCAL_LLM_SETUP.md`
- Research: `docs/research/HUGGINGFACE_MODELS_RESEARCH_2025.md`
- Comparison: `docs/reports/LOCAL_LLM_VS_CLOUD_API_COMPARISON.md`

---

**Updated:** October 27, 2025  
**Models:** Qwen 2.5 series (Sep 2024)  
**By:** Quicord Development Team
