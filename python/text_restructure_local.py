"""
🔄 Quicord v3.2 - Local LLM Text Restructuring
🎯 Use local LLM to reorder OCR paragraphs without API costs

Supported models:
1. Qwen2.5-7B-Instruct (Best Vietnamese support)
2. Llama-3.2-3B-Instruct (Fastest, smallest)
3. Phi-3-mini-4k (Best document understanding)

Requirements:
- transformers>=4.40.0
- torch>=2.0.0
- accelerate>=0.20.0
"""

import sys
import os
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Check dependencies
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
except ImportError:
    print("❌ ERROR: Missing dependencies!")
    print("📦 Install: pip install transformers torch accelerate")
    sys.exit(1)


class LocalLLMRestructurer:
    """Use local LLM to restructure OCR text"""
    
    # Supported models with Vietnamese document restructuring
    MODELS = {
        "qwen": {
            "name": "Qwen/Qwen2.5-7B-Instruct",
            "size": "~8GB RAM",
            "speed": "Medium",
            "vietnamese": "⭐⭐⭐⭐⭐",
            "recommended": True,
            "description": "Best for Vietnamese documents, excellent context understanding"
        },
        "llama": {
            "name": "meta-llama/Llama-3.2-3B-Instruct",
            "size": "~4GB RAM",
            "speed": "Fast",
            "vietnamese": "⭐⭐⭐⭐",
            "recommended": False,
            "description": "Smallest & fastest, good Vietnamese support"
        },
        "phi": {
            "name": "microsoft/Phi-3-mini-4k-instruct",
            "size": "~4GB RAM",
            "speed": "Fast",
            "vietnamese": "⭐⭐⭐⭐",
            "recommended": False,
            "description": "Best for document tasks, optimized for CPU"
        }
    }
    
    def __init__(self, model_name: str = "qwen", device: str = "auto"):
        """
        Initialize local LLM restructurer
        
        Args:
            model_name: Model to use (qwen/llama/phi)
            device: Device to use (auto/cpu/cuda)
        """
        self.model_name = model_name
        self.device = device
        self.model = None
        self.tokenizer = None
        self.pipeline = None
        
        # Model cache directory
        self.cache_dir = Path.home() / ".cache" / "quicord_models"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"🤖 Initializing {self.MODELS[model_name]['name']}...")
        self._load_model()
    
    def _load_model(self):
        """Load model and tokenizer"""
        model_info = self.MODELS[self.model_name]
        model_id = model_info["name"]
        
        try:
            print(f"📦 Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                model_id,
                cache_dir=str(self.cache_dir),
                trust_remote_code=True
            )
            
            print(f"🧠 Loading model (this may take a few minutes first time)...")
            
            # Determine device
            if self.device == "auto":
                device = "cuda" if torch.cuda.is_available() else "cpu"
            else:
                device = self.device
            
            print(f"💻 Using device: {device.upper()}")
            
            # Load model with appropriate settings
            if device == "cuda":
                # Use GPU with float16 for speed
                self.model = AutoModelForCausalLM.from_pretrained(
                    model_id,
                    cache_dir=str(self.cache_dir),
                    torch_dtype=torch.float16,
                    device_map="auto",
                    trust_remote_code=True
                )
            else:
                # Use CPU with float32
                self.model = AutoModelForCausalLM.from_pretrained(
                    model_id,
                    cache_dir=str(self.cache_dir),
                    torch_dtype=torch.float32,
                    trust_remote_code=True
                )
                self.model.to(device)
            
            # Create pipeline
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if device == "cuda" else -1
            )
            
            print(f"✅ Model loaded successfully!")
            print(f"📊 Size: {model_info['size']}")
            print(f"⚡ Speed: {model_info['speed']}")
            print(f"🇻🇳 Vietnamese: {model_info['vietnamese']}")
            
        except Exception as e:
            print(f"❌ ERROR loading model: {e}")
            print(f"💡 Try: pip install transformers torch accelerate --upgrade")
            raise
    
    def restructure(
        self,
        ocr_text: str,
        doc_type: str = "contract",
        max_length: int = 4096,
        temperature: float = 0.1
    ) -> Tuple[str, Dict]:
        """
        Restructure OCR text using local LLM
        
        Args:
            ocr_text: Raw OCR text with interleaved paragraphs
            doc_type: Document type (contract/invoice/blueprint/report)
            max_length: Maximum output length
            temperature: Sampling temperature (0.1 = deterministic)
        
        Returns:
            (restructured_text, metadata)
        """
        # Build prompt based on document type
        prompt = self._build_prompt(ocr_text, doc_type)
        
        print(f"🔄 Restructuring {doc_type}...")
        print(f"📝 Input length: {len(ocr_text)} chars")
        
        try:
            # Generate with LLM
            result = self.pipeline(
                prompt,
                max_new_tokens=max_length,
                temperature=temperature,
                do_sample=temperature > 0,
                top_p=0.95,
                repetition_penalty=1.1
            )
            
            # Extract generated text
            generated = result[0]["generated_text"]
            
            # Remove prompt from output
            if prompt in generated:
                restructured = generated.replace(prompt, "").strip()
            else:
                restructured = generated.strip()
            
            # Extract restructured text (between markers)
            if "### ĐẦU RA ###" in restructured:
                parts = restructured.split("### ĐẦU RA ###")
                if len(parts) > 1:
                    restructured = parts[1].strip()
            
            print(f"✅ Output length: {len(restructured)} chars")
            
            # Metadata
            metadata = {
                "model": self.MODELS[self.model_name]["name"],
                "doc_type": doc_type,
                "input_length": len(ocr_text),
                "output_length": len(restructured),
                "temperature": temperature
            }
            
            return restructured, metadata
            
        except Exception as e:
            print(f"❌ ERROR during restructuring: {e}")
            raise
    
    def _build_prompt(self, ocr_text: str, doc_type: str) -> str:
        """Build prompt for LLM based on document type"""
        
        # Vietnamese document type names
        doc_names = {
            "contract": "HỢP ĐỒNG",
            "invoice": "HÓA ĐƠN",
            "blueprint": "BẢN VẼ KỸ THUẬT",
            "report": "BÁO CÁO"
        }
        
        doc_name = doc_names.get(doc_type, "TÀI LIỆU")
        
        # Base prompt (Vietnamese)
        prompt = f"""Bạn là chuyên gia sắp xếp lại văn bản tiếng Việt từ OCR.

### NHIỆM VỤ ###
Sắp xếp lại các đoạn văn trong văn bản {doc_name} dưới đây theo thứ tự logic đúng.

### QUY TẮC ###
1. TUYỆT ĐỐI KHÔNG thêm chữ mới
2. TUYỆT ĐỐI KHÔNG xóa/bỏ bất kỳ chữ nào
3. CHỈ sắp xếp lại thứ tự các đoạn văn
4. Giữ NGUYÊN VẸN nội dung gốc
5. Hiểu ngữ cảnh để sắp xếp đúng cấu trúc tài liệu

### CẤU TRÚC {doc_name.upper()} ###
"""

        # Add document-specific structure guidelines
        if doc_type == "contract":
            prompt += """
- Đầu tài liệu: Tiêu đề, ngày tháng, cơ quan ban hành
- Phần mở đầu: Căn cứ pháp lý, các bên tham gia
- Nội dung chính: Các điều khoản (Điều 1, Điều 2...)
- Quyền và nghĩa vụ của các bên
- Điều khoản chung
- Phần cuối: Chữ ký, đại diện pháp luật
"""
        elif doc_type == "invoice":
            prompt += """
- Đầu hóa đơn: Tiêu đề, mã số thuế, ngày tháng
- Thông tin người bán/người mua
- Bảng chi tiết sản phẩm/dịch vụ
- Tổng tiền, thuế GTGT
- Phần cuối: Chữ ký, con dấu
"""
        elif doc_type == "blueprint":
            prompt += """
- Đầu bản vẽ: Tiêu đề, mã số bản vẽ, tỷ lệ
- Thông tin dự án
- Nội dung bản vẽ chính
- Bảng chú thích, ký hiệu
- Phần cuối: Người vẽ, người duyệt
"""
        else:
            prompt += """
- Đầu tài liệu: Tiêu đề, ngày tháng
- Nội dung chính: Các phần, đoạn văn theo logic
- Phần cuối: Kết luận, chữ ký
"""

        prompt += f"""
### VĂN BẢN OCR GỐC ###
{ocr_text}

### ĐẦU RA ###
Văn bản đã được sắp xếp lại theo đúng cấu trúc (giữ nguyên nội dung):

"""
        
        return prompt
    
    @staticmethod
    def list_models():
        """List all available models with details"""
        print("\n📋 AVAILABLE LOCAL MODELS:\n")
        
        for key, info in LocalLLMRestructurer.MODELS.items():
            print(f"{'⭐ ' if info['recommended'] else '   '}{key.upper()}: {info['name']}")
            print(f"    Size: {info['size']}")
            print(f"    Speed: {info['speed']}")
            print(f"    Vietnamese: {info['vietnamese']}")
            print(f"    {info['description']}")
            print()
    
    @staticmethod
    def check_requirements():
        """Check if system meets requirements"""
        print("\n🔍 SYSTEM CHECK:\n")
        
        # Check Python version
        py_version = sys.version_info
        print(f"Python: {py_version.major}.{py_version.minor}.{py_version.micro}", end=" ")
        if py_version >= (3, 8):
            print("✅")
        else:
            print("❌ (Need 3.8+)")
        
        # Check PyTorch
        try:
            import torch
            print(f"PyTorch: {torch.__version__} ✅")
            
            # Check CUDA
            if torch.cuda.is_available():
                print(f"CUDA: Available (GPU: {torch.cuda.get_device_name(0)}) ⚡")
                print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
            else:
                print(f"CUDA: Not available (will use CPU) 💻")
        except ImportError:
            print("PyTorch: Not installed ❌")
        
        # Check Transformers
        try:
            import transformers
            print(f"Transformers: {transformers.__version__} ✅")
        except ImportError:
            print("Transformers: Not installed ❌")
        
        # Check RAM
        try:
            import psutil
            ram_gb = psutil.virtual_memory().total / 1e9
            print(f"RAM: {ram_gb:.1f} GB", end=" ")
            if ram_gb >= 16:
                print("✅ (Can run all models)")
            elif ram_gb >= 8:
                print("⚠️ (Can run small models)")
            else:
                print("❌ (Need 8GB+ for LLM)")
        except ImportError:
            print("RAM: Unknown (install psutil to check)")
        
        print()


def main():
    """Demo usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Local LLM Text Restructuring")
    parser.add_argument("--list-models", action="store_true", help="List available models")
    parser.add_argument("--check", action="store_true", help="Check system requirements")
    parser.add_argument("--model", default="qwen", help="Model to use (qwen/llama/phi)")
    parser.add_argument("--input", help="Input file (OCR text)")
    parser.add_argument("--output", help="Output file (restructured text)")
    parser.add_argument("--type", default="contract", help="Document type")
    
    args = parser.parse_args()
    
    if args.list_models:
        LocalLLMRestructurer.list_models()
        return
    
    if args.check:
        LocalLLMRestructurer.check_requirements()
        return
    
    if not args.input:
        print("❌ ERROR: --input required")
        parser.print_help()
        return
    
    # Load OCR text
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ ERROR: File not found: {input_path}")
        return
    
    ocr_text = input_path.read_text(encoding="utf-8")
    
    # Initialize restructurer
    restructurer = LocalLLMRestructurer(model_name=args.model)
    
    # Restructure
    restructured, metadata = restructurer.restructure(ocr_text, doc_type=args.type)
    
    # Save output
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = input_path.with_stem(f"{input_path.stem}_restructured")
    
    output_path.write_text(restructured, encoding="utf-8")
    print(f"✅ Saved to: {output_path}")
    
    # Print metadata
    print(f"\n📊 METADATA:")
    print(json.dumps(metadata, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
