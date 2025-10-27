"""
Quick script to create a test scanned PDF for OCR testing
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

def create_test_pdf():
    """Create a fake scanned PDF with Vietnamese + English text"""
    
    print("Creating test scanned PDF...")
    
    # Create 3 pages
    images = []
    
    # Page 1
    img1 = Image.new('RGB', (800, 1000), color='white')
    draw1 = ImageDraw.Draw(img1)
    
    # Add text (simulating scanned document)
    draw1.text((50, 50), "TEST DOCUMENT - PAGE 1", fill='black')
    draw1.text((50, 100), "Đây là tài liệu test OCR", fill='black')
    draw1.text((50, 150), "This is a test OCR document", fill='black')
    draw1.text((50, 200), "Tiếng Việt: Xin chào!", fill='black')
    draw1.text((50, 250), "English: Hello World!", fill='black')
    images.append(img1)
    
    # Page 2
    img2 = Image.new('RGB', (800, 1000), color='white')
    draw2 = ImageDraw.Draw(img2)
    draw2.text((50, 50), "TEST DOCUMENT - PAGE 2", fill='black')
    draw2.text((50, 100), "Nội dung trang 2", fill='black')
    draw2.text((50, 150), "Page 2 content", fill='black')
    images.append(img2)
    
    # Page 3
    img3 = Image.new('RGB', (800, 1000), color='white')
    draw3 = ImageDraw.Draw(img3)
    draw3.text((50, 50), "TEST DOCUMENT - PAGE 3", fill='black')
    draw3.text((50, 100), "Trang cuối cùng", fill='black')
    draw3.text((50, 150), "Last page", fill='black')
    images.append(img3)
    
    # Save as PDF
    output_path = Path(__file__).parent / "test_scanned.pdf"
    images[0].save(
        str(output_path),
        save_all=True,
        append_images=images[1:],
        resolution=100.0
    )
    
    print(f"✓ Created: {output_path}")
    print(f"  - 3 pages")
    print(f"  - Size: {output_path.stat().st_size / 1024:.1f} KB")
    print(f"\nNow you can test OCR with:")
    print(f"  .\\ocr-complete.bat")
    print(f"  Then drag: test_scanned.pdf")

if __name__ == "__main__":
    create_test_pdf()
