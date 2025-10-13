# 📋 HƯỚNG DẪN TỐI ƯU MODEL - YOLO MODE

**QUAN TRỌNG**: Model đang chạy ở **7.2 tok/s** - cần tăng lên **80-100 tok/s**

---

## 🚨 HÀNH ĐỘNG NGAY (5 PHÚT)

### Bước 1: Mở LM Studio
```
1. Click vào icon LM Studio trên taskbar
2. Chờ app hiện ra
```

### Bước 2: Check GPU Acceleration
```
1. Click "Settings" (icon bánh răng, góc trên phải)
2. Click tab "Hardware" 
3. Tìm mục "GPU Acceleration"
4. Phải thấy: "Vulkan (AMD)" hoặc "ROCm"
5. Nếu thấy "None" hoặc "CPU":
   - Click dropdown
   - Chọn "Vulkan" hoặc "AMD"
   - Click "Save"
```

### Bước 3: Set GPU Layers
```
1. Quay lại tab "Models" (trái góc)
2. Click vào model "chatbot_vietnamese_law_qwen" đang load
3. Click "Settings" của model
4. Tìm "GPU Layers" hoặc "GPU Offload"
5. Đặt = 99 (hoặc max number)
6. Click "Apply" hoặc "Save"
```

### Bước 4: Giảm Context
```
Trong cùng Settings của model:
1. Tìm "Context Length" hoặc "Max Context"
2. Đặt = 4096 (hoặc 8192)
3. Click "Apply"
```

### Bước 5: Reload Model
```
1. Click "Unload Model"
2. Đợi 3-5 giây
3. Click "Load Model" lại
4. Đợi model load (30-60 giây)
```

---

## ✅ KIỂM TRA NGAY

### Test lại tốc độ:
```powershell
cd D:\Work\Coding\QSM
python test_model_streaming.py
```

**Kết quả mong đợi**:
- ✅ Speed: 60-100 tokens/sec
- ✅ Time: ~5-10 seconds (thay vì 41s)

**Nếu vẫn chậm**:
- Thử unload và download Q4_K_M (4.8 GB)
- Check Task Manager: VRAM usage ~4-5 GB

---

## 🎯 SAU KHI TỐI ƯU XONG

### Test với QSM App:
```
1. Mở browser: http://localhost:5173
2. Click "Advanced Query" tab
3. Chọn "LM Studio" provider
4. Model: chatbot_vietnamese_law_qwen
5. Hỏi: "Luật đầu tư 2020 có gì quan trọng?"
6. Xem streaming response
```

---

## 📞 NẾU CẦN HỖ TRỢ

Chạy lệnh này và gửi kết quả:
```powershell
cd D:\Work\Coding\QSM
python test_model_streaming.py > model_test_result.txt 2>&1
```

