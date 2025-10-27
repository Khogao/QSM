# 📸 Hướng dẫn test OCR ảnh chụp điện thoại

## 🚀 Cách 1: Qua giao diện app (Khuyến nghị)

1. **Mở QSM app:**
   ```bash
   npm run dev
   ```

2. **Import ảnh:**
   - Click nút "📄 Import Files"
   - Chọn ảnh chụp từ điện thoại (.jpg, .png)
   - Hệ thống sẽ tự động nhận diện và OCR

3. **Cấu hình OCR:**
   - Mở Settings (⚙️)
   - Chọn OCR Config:
     - Language: "Tiếng Việt" hoặc "Hỗn hợp"
     - Resolution: "Cao (chính xác)"
     - Accuracy: "Độ chính xác"

4. **Xem kết quả:**
   - Text được trích xuất hiển thị trong Document Management
   - Có thể search và query nội dung

---

## 🔧 Cách 2: Test trực tiếp qua Python

### Bước 1: Chuẩn bị môi trường

```bash
cd D:\Work\Coding\QSM\python
.\venv\Scripts\activate
pip install docling easyocr
```

### Bước 2: Test với 1 ảnh

```bash
# Ví dụ: test_image.jpg là ảnh chụp từ điện thoại
python docling_processor.py path/to/test_image.jpg --enable-ocr --ocr-lang vi,en
```

### Bước 3: Test với độ chính xác cao

```bash
python docling_processor.py test_image.jpg \
  --enable-ocr \
  --force-ocr \
  --ocr-lang vi \
  --enable-tables
```

---

## 📊 Các tùy chọn command line:

```bash
python docling_processor.py <image_file> [options]

Options:
  --enable-ocr          # Bật OCR
  --force-ocr          # OCR toàn trang (chính xác hơn)
  --ocr-lang vi,en     # Ngôn ngữ (vi=Việt, en=Anh)
  --enable-tables      # Nhận diện bảng biểu
  --enable-formulas    # Chuyển công thức sang LaTeX
  --output-format      # markdown, json, html
```

---

## 🎯 Ví dụ thực tế:

### Test 1: Ảnh chụp văn bản tiếng Việt

```bash
python docling_processor.py hop_dong.jpg \
  --enable-ocr \
  --ocr-lang vi \
  --output-format markdown
```

### Test 2: Ảnh chụp bảng biểu

```bash
python docling_processor.py bang_gia.jpg \
  --enable-ocr \
  --enable-tables \
  --ocr-lang vi,en \
  --output-format json
```

### Test 3: Ảnh chụp tài liệu kỹ thuật

```bash
python docling_processor.py ky_thuat.jpg \
  --enable-ocr \
  --enable-formulas \
  --enable-code \
  --ocr-lang en \
  --force-ocr
```

---

## ⚠️ Lưu ý quan trọng:

### ✅ Để OCR chính xác nhất:

1. **Chất lượng ảnh:**
   - Độ phân giải tối thiểu: 300 DPI
   - Ánh sáng đều, không bóng mờ
   - Chụp thẳng góc (không nghiêng)

2. **Cài đặt OCR:**
   - Chọn ngôn ngữ đúng (vi cho tiếng Việt)
   - Dùng `--force-ocr` cho ảnh chất lượng thấp
   - Resolution: "High" cho text nhỏ

3. **Định dạng file:**
   - PNG tốt hơn JPG (không nén)
   - TIFF tốt nhất (không mất dữ liệu)

### ⚡ Performance:

- **Ảnh thường (1-2 MB):** 5-10 giây
- **Ảnh lớn (5+ MB):** 15-30 giây
- **Force OCR:** 2x thời gian thường

---

## 🐛 Khắc phục lỗi:

### Lỗi: "Docling not installed"

```bash
cd python
.\venv\Scripts\activate
pip install docling easyocr
```

### Lỗi: "No text detected"

- Kiểm tra ảnh có text rõ ràng
- Thử `--force-ocr`
- Tăng resolution của ảnh gốc

### Lỗi: "OCR timeout"

- Giảm kích thước ảnh xuống < 5MB
- Sử dụng `--ocr-lang` với 1 ngôn ngữ duy nhất

---

## 📈 Kiểm tra kết quả:

Output JSON sẽ chứa:

```json
{
  "status": "success",
  "content": "Văn bản được OCR...",
  "metadata": {
    "pages": 1,
    "confidence": {
      "mean": 0.95,  // Độ tin cậy trung bình
      "low": 0.87    // Độ tin cậy thấp nhất
    }
  },
  "features": {
    "ocr_enabled": true
  }
}
```

- **Confidence > 0.9:** Rất tốt ✅
- **Confidence 0.7-0.9:** Tốt, cần review ⚠️
- **Confidence < 0.7:** Chất lượng kém, cần chụp lại ❌

---

## 🎓 Tips chụp ảnh tốt nhất:

1. ✅ Dùng chế độ "Document" trên camera phone
2. ✅ Chụp dưới ánh sáng tự nhiên
3. ✅ Giữ điện thoại song song với tài liệu
4. ✅ Lấy nét rõ ràng (tap vào text)
5. ✅ Tránh bóng tối và phản chiếu
6. ✅ Crop bỏ phần thừa trước khi OCR

---

## 🚀 Workflow hoàn chỉnh:

```
1. Chụp ảnh tài liệu (📱)
   ↓
2. Chuyển ảnh vào máy tính
   ↓
3. Mở QSM app (npm run dev)
   ↓
4. Import ảnh + cấu hình OCR
   ↓
5. Hệ thống tự động:
   - OCR text
   - Nhận diện bảng
   - Tạo vector embeddings
   - Lưu vào database
   ↓
6. Query/Search nội dung ✅
```

---

**Sẵn sàng test! 🎉**
