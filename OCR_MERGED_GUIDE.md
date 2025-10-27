# 🎯 NÂNG CẤP - TỰ ĐỘNG SẮP XẾP VÀ GHÉP TRANG

## ✨ TÍNH NĂNG MỚI

Script đã được nâng cấp để:

### 1. 🔢 Tự động nhận diện thứ tự trang
- Trích xuất số từ tên file
- Sắp xếp theo thứ tự tăng dần
- Ví dụ: `page1.jpg`, `page2.jpg`, `page3.jpg`

### 2. 📄 Ghép thành 1 tài liệu thống nhất
- Tạo file Word có nhiều trang
- Tạo file Markdown đầy đủ
- Mỗi trang có separator rõ ràng

### 3. 💾 Vẫn giữ file riêng lẻ
- File cá nhân: `page1_page.docx`, `page1_page.md`
- File ghép: `merged_document.docx`, `merged_document.md`

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Chạy script
```bash
ocr-quick.bat
```

### Bước 2: Kéo thả ẢNH THEO THỨ TỰ
```
>>> [Kéo file 1]
   [+] page1.jpg
>>> [Kéo file 2]
   [+] page2.jpg
>>> [Kéo file 3]
   [+] page3.jpg
>>> done
```

**HOẶC** kéo tất cả cùng lúc:
```
>>> [Kéo 3 file cùng lúc]
   [+] page1.jpg
   [+] page2.jpg
   [+] page3.jpg
>>> done
```

### Bước 3: Chờ OCR
```
Processing 3 file(s) in order...
======================================================================

[*] page1.jpg (234.5 KB)
   OCR...
   Done in 8.2s
   145 words

[*] page2.jpg (198.7 KB)
   OCR...
   Done in 7.5s
   132 words

[*] page3.jpg (215.3 KB)
   OCR...
   Done in 8.0s
   156 words
```

### Bước 4: Chọn ghép hay không
```
Successfully OCR'd: 3/3 files

Create merged document? (y/n): y
Enter document name (default: merged_document): my_contract

[*] Creating merged document...
    Page order: page1, page2, page3
    [OK] Markdown: my_contract.md
    [OK] Word: my_contract.docx

[*] Saving individual files...
    [OK] 3 individual files saved
```

---

## 📂 KẾT QUẢ

Trong thư mục `ocr_output/`:

```
ocr_output/
├── my_contract.docx          ← File ghép (toàn bộ tài liệu)
├── my_contract.md             ← File ghép (Markdown)
├── page1_page.docx            ← File riêng trang 1
├── page1_page.md              ← File riêng trang 1 (MD)
├── page2_page.docx            ← File riêng trang 2
├── page2_page.md              ← File riêng trang 2 (MD)
├── page3_page.docx            ← File riêng trang 3
└── page3_page.md              ← File riêng trang 3 (MD)
```

---

## 📋 CẤU TRÚC FILE GHÉP

### Word Document (`my_contract.docx`):
```
┌─────────────────────────────┐
│  OCR Merged Document        │ ← Title page
│  Generated: 2025-10-27      │
│  Total Pages: 3             │
│  Total Words: 433           │
└─────────────────────────────┘

[Page Break]

┌─────────────────────────────┐
│  Page 1                     │ ← Heading
│  Source: page1.jpg          │
│  Words: 145                 │
│  ─────────────────────────  │
│  [Nội dung OCR trang 1]     │
└─────────────────────────────┘

[Page Break]

┌─────────────────────────────┐
│  Page 2                     │
│  Source: page2.jpg          │
│  Words: 132                 │
│  ─────────────────────────  │
│  [Nội dung OCR trang 2]     │
└─────────────────────────────┘

[Page Break]

┌─────────────────────────────┐
│  Page 3                     │
│  Source: page3.jpg          │
│  Words: 156                 │
│  ─────────────────────────  │
│  [Nội dung OCR trang 3]     │
└─────────────────────────────┘
```

---

## 🎯 TIPS SẮP XẾP THỨ TỰ

### ✅ TỐT - Tên file có số rõ ràng:
```
page1.jpg
page2.jpg
page3.jpg
```
hoặc
```
document_001.jpg
document_002.jpg
document_003.jpg
```

### ⚠️ TRÁNH - Tên file không có số:
```
image.jpg
photo.jpg
scan.jpg
```
→ Script sẽ sắp xếp theo tên alphabet

### 💡 GỢI Ý:
Nếu file không có số, đổi tên trước khi OCR:
```
F2 → page1.jpg
F2 → page2.jpg
F2 → page3.jpg
```

---

## 🔧 TÙY CHỈNH

### Không muốn ghép, chỉ muốn file riêng:
```
Create merged document? (y/n): n
```
→ Chỉ tạo file riêng lẻ

### Đặt tên file ghép khác:
```
Enter document name: hop_dong_mua_ban
```
→ Tạo `hop_dong_mua_ban.docx`

### Mặc định (Enter):
```
Enter document name: [Enter]
```
→ Tạo `merged_document.docx`

---

## ✨ VÍ DỤ THỰC TẾ

### Use case: OCR hợp đồng 5 trang

```bash
# 1. Chụp 5 trang hợp đồng bằng điện thoại
# 2. Chuyển vào máy tính với tên: hop_dong_1.jpg, hop_dong_2.jpg, ...
# 3. Chạy script

ocr-quick.bat

>>> [Kéo 5 file cùng lúc]
   [+] hop_dong_1.jpg
   [+] hop_dong_2.jpg
   [+] hop_dong_3.jpg
   [+] hop_dong_4.jpg
   [+] hop_dong_5.jpg
>>> done

# Chờ ~40 giây (8s/trang)

Create merged document? (y/n): y
Enter document name: hop_dong_mua_nha

# Kết quả:
# - hop_dong_mua_nha.docx (5 trang, đầy đủ)
# - hop_dong_mua_nha.md (Markdown)
# - 5 file riêng lẻ (nếu cần)
```

---

**Sẵn sàng OCR và ghép tài liệu! 🚀**
