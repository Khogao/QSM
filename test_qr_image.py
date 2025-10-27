#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate test image with QR code + Vietnamese text for testing
"""

import qrcode
from PIL import Image, ImageDraw, ImageFont

# Create QR code
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

# QR data: Invoice info
qr_data = "INV-2023-001|Date:2023-08-09|Amount:23,970,400 VND|Customer:TMB CHUNG CU"
qr.add_data(qr_data)
qr.make(fit=True)

qr_img = qr.make_image(fill_color="black", back_color="white")

# Create canvas
canvas = Image.new('RGB', (800, 1000), 'white')
draw = ImageDraw.Draw(canvas)

# Try to load Arial font for Vietnamese
try:
    font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 32)
    font_text = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
except:
    font_title = ImageFont.load_default()
    font_text = ImageFont.load_default()

# Add title
draw.text((50, 30), "HÓA ĐƠN THANH TOÁN", fill='black', font=font_title)

# Add QR code
qr_resized = qr_img.resize((200, 200))
canvas.paste(qr_resized, (50, 100))

# Add invoice text
invoice_text = """
Mã hóa đơn: INV-2023-001
Ngày: 09/08/2023
Khách hàng: TMB CHUNG CU

Sản phẩm: Dịch vụ tư vấn quy hoạch
Số lượng: 1
Đơn giá: 23,970,400 VND

Tổng cộng: 23,970,400 VND
VAT (10%): 2,397,040 VND
Thành tiền: 26,367,440 VND

Ghi chú: Thanh toán trong vòng 30 ngày
"""

y_pos = 100
for line in invoice_text.strip().split('\n'):
    draw.text((280, y_pos), line.strip(), fill='black', font=font_text)
    y_pos += 35

# Add table (simple)
table_text = """
BẢNG CHI TIẾT

STT | Mô tả              | Số lượng | Đơn giá       | Thành tiền
----|-------------------|----------|---------------|-------------
 1  | Tư vấn quy hoạch  |    1     | 23,970,400   | 23,970,400
 2  | Phí dịch vụ       |    1     |    500,000   |    500,000
----|-------------------|----------|---------------|-------------
    | TỔNG CỘNG         |          |              | 24,470,400
"""

y_pos += 50
for line in table_text.strip().split('\n'):
    draw.text((50, y_pos), line, fill='black', font=font_text)
    y_pos += 30

# Save
canvas.save("test-qr-invoice.jpg", quality=95)
print("✓ Created: test-qr-invoice.jpg")
print(f"✓ QR data: {qr_data}")
