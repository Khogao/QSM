# OCR ẢNH SANG WORD - HƯỚNG DẪN NHANH

## CÁCH DÙNG ĐƠN GIẢN NHẤT

### Bước 1: Click đúp file `ocr-quick.bat`

### Bước 2: Kéo thả ảnh vào cửa sổ terminal

### Bước 3: Gõ `done` và Enter

### Kết quả: Xem trong thư mục `ocr_output`

---

## CHI TIẾT

### Định dạng hỗ trợ:
- JPG, JPEG
- PNG
- BMP
- TIFF

### Ngôn ngữ:
- Tiếng Việt
- Tiếng Anh
- Hỗn hợp

### Output:
- File `.md` (Markdown)
- File `.docx` (Word)

---

## VÍ DỤ SỬ DỤNG

```
1. Mở ocr-quick.bat

2. Terminal hiện:
   ======================================================================
   QSM - OCR Image to Word
   ======================================================================
   Setting up OCR...
   Ready!
   
   Enter file paths (drag & drop or type, then 'done'):
   
   >>> 

3. Kéo file ảnh vào (hoặc gõ đường dẫn):
   >>> D:\Pictures\contract.jpg
      [+] contract.jpg
   >>> 
   >>> done

4. Chờ xử lý...
   [*] contract.jpg (234.5 KB)
      OCR...
      Done in 8.2s
      145 words
      [OK] contract_ocr.md
      [OK] contract_ocr.docx

5. Done!
   ======================================================================
   SUMMARY: 1/1 success
   Output: D:\Work\Coding\QSM\ocr_output
   ======================================================================
```

---

## LƯU Ý

✅ **Chất lượng ảnh tốt = OCR chính xác**
- Độ phân giải: 300 DPI trở lên
- Ánh sáng đều
- Chụp thẳng góc
- Text rõ ràng

⚠️ **Thời gian xử lý:**
- Ảnh nhỏ (< 1 MB): 5-10 giây
- Ảnh trung bình (1-3 MB): 10-20 giây
- Ảnh lớn (> 3 MB): 20-40 giây

---

## KHẮC PHỤC LỖI

### Lỗi: "Python venv not found"
```bash
cd D:\Work\Coding\QSM
python -m venv python\venv
python\venv\Scripts\pip install docling easyocr python-docx
```

### Lỗi: "No text detected"
- Kiểm tra ảnh có chứa text
- Tăng độ phân giải ảnh
- Chụp lại với ánh sáng tốt hơn

### Lỗi: "File not found"
- Kiểm tra đường dẫn file
- Đảm bảo file tồn tại
- Thử kéo thả thay vì gõ path

---

## TIPS

1. **Nhiều file cùng lúc:**
   ```
   >>> image1.jpg
   >>> image2.png
   >>> image3.jpg
   >>> done
   ```

2. **Ảnh chất lượng thấp:**
   - Tăng độ sáng trước khi OCR
   - Crop bỏ phần thừa
   - Convert sang PNG (không nén)

3. **Text tiếng Việt có dấu:**
   - Script tự động nhận diện
   - Không cần cài đặt thêm

---

**Sẵn sàng sử dụng! 🚀**
