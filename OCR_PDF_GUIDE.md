# 📄 NÂNG CẤP - XUẤT PDF

## ✨ TÍNH NĂNG MỚI: PDF EXPORT

Script giờ hỗ trợ xuất PDF với **2 chế độ**:

### 1. 📸 PDF từ ảnh gốc (Image PDF)
- Ghép các ảnh gốc thành 1 file PDF
- Giữ nguyên chất lượng ảnh
- File size lớn hơn nhưng rõ nét
- **Use case:** Lưu trữ bản scan gốc

### 2. 📝 PDF từ text OCR (Text PDF)  
- Tạo PDF từ nội dung OCR
- File size nhỏ, có thể search/copy text
- Format đẹp, dễ đọc
- **Use case:** Tài liệu để đọc/chỉnh sửa

### 3. 🎯 Both (Cả 2)
- Tạo cả 2 loại PDF
- Linh hoạt tùy mục đích sử dụng

---

## 🚀 CÁCH SỬ DỤNG

### Workflow mới:

```bash
1. Chạy: ocr-quick.bat
2. Kéo thả ảnh
3. Gõ: done
4. Chờ OCR
5. Create merged? y
6. Document name: my_contract
7. Create PDF? both    ← MỚI!
```

### Chi tiết bước 7 - PDF Options:

```
Create PDF? (image/text/both/no): 
```

**Lựa chọn:**
- `image` hoặc `i` → Chỉ PDF từ ảnh gốc
- `text` hoặc `t` → Chỉ PDF từ text OCR
- `both` hoặc `b` → Cả 2 PDF
- `no` hoặc `n` → Không tạo PDF

---

## 📂 KẾT QUẢ

### Option: `both`

```
ocr_output/
├── my_contract.docx           ← Word ghép
├── my_contract.md             ← Markdown ghép
├── my_contract_images.pdf     ← PDF từ ảnh gốc ⭐
├── my_contract_text.pdf       ← PDF từ text OCR ⭐
├── page1_page.docx            ← File riêng
├── page1_page.md
├── page2_page.docx
└── page2_page.md
```

### Option: `image`

```
ocr_output/
├── my_contract.docx
├── my_contract.md
├── my_contract_images.pdf     ← CHỈ PDF ảnh
└── ...
```

### Option: `text`

```
ocr_output/
├── my_contract.docx
├── my_contract.md
├── my_contract_text.pdf       ← CHỈ PDF text
└── ...
```

---

## 🎯 SO SÁNH 2 LOẠI PDF

| Tính năng | Image PDF | Text PDF |
|-----------|-----------|----------|
| **Chất lượng ảnh** | ⭐⭐⭐⭐⭐ Giống gốc | ⭐⭐⭐ Text format |
| **File size** | ⚠️ Lớn (vài MB) | ✅ Nhỏ (vài trăm KB) |
| **Search text** | ❌ Không | ✅ Có |
| **Copy text** | ❌ Không | ✅ Có |
| **Chỉnh sửa** | ❌ Không | ⚠️ Hạn chế |
| **In ấn** | ✅ Tốt | ✅ Tốt |
| **Bảo mật** | ✅ An toàn hơn | ⚠️ Text có thể copy |
| **Use case** | Lưu trữ, công chứng | Đọc, search, chia sẻ |

---

## 💡 GỢI Ý SỬ DỤNG

### Use Case 1: Hợp đồng quan trọng
```
Create PDF? both
```
- `_images.pdf` → Lưu trữ bản gốc
- `_text.pdf` → Đọc và tham khảo

### Use Case 2: Tài liệu nghiên cứu
```
Create PDF? text
```
- Dễ search, copy trích dẫn
- File nhỏ, dễ chia sẻ email

### Use Case 3: Bản scan chứng từ
```
Create PDF? image
```
- Giữ nguyên bản scan
- Chất lượng cao nhất

### Use Case 4: Chỉ cần Word
```
Create PDF? no
```
- Không cần PDF
- Chỉ dùng Word/Markdown

---

## 📋 VÍ DỤ THỰC TẾ

### Ví dụ 1: OCR hợp đồng mua nhà (5 trang)

```bash
ocr-quick.bat

>>> [Kéo 5 ảnh hợp đồng]
   [+] hop_dong_1.jpg
   [+] hop_dong_2.jpg
   [+] hop_dong_3.jpg
   [+] hop_dong_4.jpg
   [+] hop_dong_5.jpg
>>> done

# OCR...
Successfully OCR'd: 5/5 files

Create merged document? (y/n): y
Enter document name: hop_dong_mua_nha
[*] Creating merged document...
    [OK] Word: hop_dong_mua_nha.docx
    [OK] Markdown: hop_dong_mua_nha.md

Create PDF? (image/text/both/no): both

[*] Creating PDF from original images...
    [OK] Image PDF: hop_dong_mua_nha_images.pdf (5 pages)

[*] Creating PDF from OCR text...
    [OK] Text PDF: hop_dong_mua_nha_text.pdf
```

**Kết quả:**
- `hop_dong_mua_nha_images.pdf` (12 MB) → Bản gốc để lưu
- `hop_dong_mua_nha_text.pdf` (450 KB) → Dễ đọc, search

---

### Ví dụ 2: OCR sách (20 trang)

```bash
Create PDF? text

[*] Creating PDF from OCR text...
    [OK] Text PDF: sach_y_hoc_text.pdf
```

**Lợi ích:**
- File nhỏ (~800 KB thay vì 40 MB)
- Search được nội dung
- Dễ copy trích dẫn

---

## 🎨 ĐẶC ĐIỂM FILE PDF

### Image PDF (`_images.pdf`):
```
┌─────────────────────────────┐
│  [Ảnh gốc trang 1]          │ ← Giữ nguyên ảnh
│                              │
│                              │
└─────────────────────────────┘
┌─────────────────────────────┐
│  [Ảnh gốc trang 2]          │
│                              │
└─────────────────────────────┘
```

### Text PDF (`_text.pdf`):
```
┌─────────────────────────────┐
│  OCR Merged Document        │ ← Title page
│  Generated: 2025-10-27      │
│  Total Pages: 5             │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Page 1                     │ ← Formatted text
│  Source: contract_1.jpg     │
│  ─────────────────────────  │
│  [Text content với          │
│   format đẹp, dễ đọc]       │
└─────────────────────────────┘
```

---

## ⚙️ CÀI ĐẶT ĐÃ BỔ SUNG

Script tự động cài:
- ✅ `Pillow` - Xử lý ảnh
- ✅ `reportlab` - Tạo PDF từ text
- ✅ `pypdf` - Xử lý PDF

Không cần cài thêm gì!

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Failed to create image PDF"
**Nguyên nhân:** Ảnh lỗi hoặc format không hỗ trợ

**Giải pháp:**
- Kiểm tra ảnh mở được không
- Convert sang JPG/PNG
- Giảm kích thước ảnh

### PDF quá lớn
**Giải pháp:**
- Dùng `text` thay vì `image`
- Hoặc dùng `both` rồi chọn file phù hợp

### Text PDF bị lỗi font tiếng Việt
**Giải pháp:**
- Script đã tự động xử lý Unicode
- Nếu vẫn lỗi, mở bằng Adobe Reader

---

## 📊 FILE SIZE COMPARISON

**Ví dụ: 10 trang A4 scan**

| Format | Size | Ghi chú |
|--------|------|---------|
| Images (JPG) | 15 MB | Gốc |
| `_images.pdf` | 14 MB | Ghép ảnh |
| `_text.pdf` | 1.2 MB | OCR text |
| `.docx` | 800 KB | Word |
| `.md` | 150 KB | Markdown |

**→ Text PDF nhỏ hơn ~12 lần!**

---

## 🎯 WORKFLOW ĐỀ XUẤT

### Tài liệu cá nhân:
```
Create PDF? text
```
→ Nhỏ gọn, dễ quản lý

### Tài liệu pháp lý:
```
Create PDF? both
```
→ Có cả bản gốc lẫn bản đọc

### Tài liệu tham khảo:
```
Create PDF? text
```
→ Search/copy dễ dàng

### Chỉ cần in:
```
Create PDF? image
```
→ Chất lượng in tốt nhất

---

**Sẵn sàng tạo PDF! 📄✨**
