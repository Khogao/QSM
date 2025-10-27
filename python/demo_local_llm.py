"""
🧪 Demo: Local LLM Text Restructuring
Test with Vietnamese contract sample
"""

import sys
from pathlib import Path

# Sample OCR text with interleaved paragraphs (from your contract)
SAMPLE_OCR = """
thế chấp bằng bất san cua bên thứ ba

Cộng hoà xã hội chủ Việt Nam

(Tài sán là quyên sư dung

HỢP ĐỒNG THẾ CHẤP
Bằng quyền sử dụng đất và tài sản gắn liền với đất

Số: 2023.08.09/TMB-CHUNG CU

Hôm nay, ngày 09 tháng 08 năm 2023

Căn cứ Bộ luật Dân sự số 91/2015/QH13

Chúng tôi gồm có:

BÊN THẾ CHẤP (Bên A):

Ông/Bà: NGUYEN VAN A
CMND/CCCD số: 001234567890
Địa chỉ thường trú: 123 Đường ABC, Quận 1, TP.HCM

BÊN NHẬN THẾ CHẤP (Bên B):

NGÂN HÀNG TMCP KỸ THƯƠNG VIỆT NAM
Mã số thuế: 0123456789
Địa chỉ: 456 Đường XYZ, Quận 3, TP.HCM

ĐIỀU 1: ĐỐI TƯỢNG THẾ CHẤP

Quyền sử dụng đất và tài sản gắn liền với đất tại:
- Địa chỉ: Căn hộ số 14.02, Tòa nhà Chung cư II
- Diện tích: 75.5 m2

ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN

2.1. Quyền của Bên A:
- Tiếp tục sử dụng tài sản thế chấp

2.2. Nghĩa vụ của Bên A:
- Bảo quản tài sản thế chấp

Chữ ký Bên A                    Chữ ký Bên B
"""


def main():
    print("=" * 80)
    print("🧪 DEMO: Local LLM Text Restructuring")
    print("=" * 80)
    
    # Import module
    sys.path.insert(0, str(Path(__file__).parent))
    from text_restructure_local import LocalLLMRestructurer
    
    print("\n📋 Step 1: Check system requirements\n")
    LocalLLMRestructurer.check_requirements()
    
    print("\n📋 Step 2: List available models\n")
    LocalLLMRestructurer.list_models()
    
    print("\n" + "=" * 80)
    print("📝 SAMPLE OCR TEXT (Interleaved paragraphs):")
    print("=" * 80)
    print(SAMPLE_OCR[:500] + "...")
    
    # Ask user which model to use
    print("\n" + "=" * 80)
    print("🤔 Which model do you want to test?")
    print("=" * 80)
    print("1. Qwen2.5-3B (🏆 BEST! 3GB, 32K context, 87% quality) ⭐ RECOMMENDED")
    print("2. Qwen2.5-1.5B (⚡ FASTEST! 1.5GB, 32K context, 82% quality)")
    print("3. Qwen2.5-7B (Largest, 8GB, 32K context, 88% quality)")
    print("4. Gemma-2-2B (Google, 2GB, 8K context, 84% quality)")
    print("0. Skip demo (just show info)")
    
    choice = input("\nYour choice (0-4): ").strip()
    
    if choice == "0":
        print("\n✅ Demo completed (no model loaded)")
        return
    
    model_map = {
        "1": "qwen3b",
        "2": "qwen1.5b",
        "3": "qwen7b",
        "4": "gemma2b"
    }
    
    if choice not in model_map:
        print("❌ Invalid choice")
        return
    
    model_name = model_map[choice]
    
    print("\n" + "=" * 80)
    print(f"🚀 Loading {model_name.upper()} model...")
    print("=" * 80)
    print("⏳ This will download ~1.5-8GB on first run (cached after)")
    print("⏳ Please wait 2-5 minutes...\n")
    
    # Initialize restructurer
    try:
        restructurer = LocalLLMRestructurer(model_name=model_name)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\n💡 TROUBLESHOOTING:")
        print("1. Install dependencies: pip install transformers torch accelerate")
        print("2. Make sure you have 8GB+ RAM")
        print("3. Check disk space (need 10GB for model cache)")
        return
    
    print("\n" + "=" * 80)
    print("🔄 Restructuring text...")
    print("=" * 80)
    
    # Restructure
    restructured, metadata = restructurer.restructure(
        SAMPLE_OCR,
        doc_type="contract",
        temperature=0.1
    )
    
    print("\n" + "=" * 80)
    print("✅ RESTRUCTURED TEXT (Correct order):")
    print("=" * 80)
    print(restructured)
    
    print("\n" + "=" * 80)
    print("📊 METADATA:")
    print("=" * 80)
    import json
    print(json.dumps(metadata, indent=2, ensure_ascii=False))
    
    # Save to file
    output_path = Path(__file__).parent.parent / "test_restructured_output.txt"
    output_path.write_text(restructured, encoding="utf-8")
    print(f"\n💾 Saved to: {output_path}")
    
    print("\n" + "=" * 80)
    print("✅ DEMO COMPLETED!")
    print("=" * 80)
    print(f"Model: {metadata['model']}")
    print(f"Input: {metadata['input_length']} chars")
    print(f"Output: {metadata['output_length']} chars")
    print("\n🎉 Now you can integrate this into ocr_complete.py!")


if __name__ == "__main__":
    main()
