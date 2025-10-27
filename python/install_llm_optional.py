"""
📦 Quicord v3.2 - Optional LLM Installer
Install local LLM models for AI text restructuring (OPTIONAL FEATURE)

This script allows users to choose if they want AI text restructuring.
Models are NOT bundled with app to keep it small (~500MB core).
"""

import sys
import os
from pathlib import Path

def clear_screen():
    """Clear terminal screen"""
    os.system('cls' if os.name == 'nt' else 'clear')


def show_header():
    """Show installer header"""
    print("=" * 80)
    print("📦 QUICORD v3.2 - OPTIONAL LLM INSTALLER")
    print("=" * 80)
    print("🤖 Install local AI model for text restructuring (OPTIONAL)")
    print("📝 Fix paragraph ordering in OCR output using AI")
    print("🔒 100% local, private, free (after download)")
    print("=" * 80)
    print()


def show_models():
    """Show available models"""
    print("🔍 AVAILABLE MODELS:")
    print()
    
    models = [
        {
            "id": "1",
            "name": "Qwen2.5-3B-Instruct",
            "badge": "🏆 BEST",
            "size": "~3GB",
            "context": "32K tokens",
            "quality": "87%",
            "speed": "Fast",
            "vietnamese": "⭐⭐⭐⭐⭐",
            "desc": "Latest Qwen 2.5, handles ALL Vietnamese contracts"
        },
        {
            "id": "2",
            "name": "Qwen2.5-1.5B-Instruct",
            "badge": "⚡ FASTEST",
            "size": "~1.5GB",
            "context": "32K tokens",
            "quality": "82%",
            "speed": "Very Fast",
            "vietnamese": "⭐⭐⭐⭐",
            "desc": "Tiny & fast, perfect for low-end PCs (8GB RAM)"
        },
        {
            "id": "3",
            "name": "Qwen2.5-7B-Instruct",
            "badge": "💎 HIGHEST",
            "size": "~8GB",
            "context": "32K tokens",
            "quality": "88%",
            "speed": "Medium",
            "vietnamese": "⭐⭐⭐⭐⭐",
            "desc": "Best quality but large (needs 16GB RAM)"
        },
        {
            "id": "4",
            "name": "Gemma-2-2B",
            "badge": "🔵 GOOGLE",
            "size": "~2GB",
            "context": "8K tokens",
            "quality": "84%",
            "speed": "Fast",
            "vietnamese": "⭐⭐⭐⭐",
            "desc": "Google's model, small & good"
        }
    ]
    
    for model in models:
        print(f"{model['badge']} [{model['id']}] {model['name']}")
        print(f"    Size: {model['size']} | Context: {model['context']} | Quality: {model['quality']}")
        print(f"    Speed: {model['speed']} | Vietnamese: {model['vietnamese']}")
        print(f"    {model['desc']}")
        print()
    
    print("[0] ⏭️  SKIP - Don't install LLM (use manual restructuring)")
    print()


def check_dependencies():
    """Check if dependencies are installed"""
    print("🔍 Checking dependencies...")
    print()
    
    missing = []
    
    try:
        import torch
        print(f"✅ PyTorch: {torch.__version__}")
        
        if torch.cuda.is_available():
            print(f"✅ CUDA: Available (GPU: {torch.cuda.get_device_name(0)})")
        else:
            print(f"ℹ️  CUDA: Not available (will use CPU)")
    except ImportError:
        print("❌ PyTorch: Not installed")
        missing.append("torch")
    
    try:
        import transformers
        print(f"✅ Transformers: {transformers.__version__}")
    except ImportError:
        print("❌ Transformers: Not installed")
        missing.append("transformers")
    
    try:
        import accelerate
        print(f"✅ Accelerate: {accelerate.__version__}")
    except ImportError:
        print("❌ Accelerate: Not installed")
        missing.append("accelerate")
    
    print()
    
    if missing:
        print(f"❌ Missing dependencies: {', '.join(missing)}")
        print()
        print("📦 Install them first:")
        print(f"   pip install {' '.join(missing)}")
        print()
        return False
    
    return True


def install_model(model_choice):
    """Install selected model"""
    model_map = {
        "1": ("Qwen/Qwen2.5-3B-Instruct", "qwen3b", "~3GB"),
        "2": ("Qwen/Qwen2.5-1.5B-Instruct", "qwen1.5b", "~1.5GB"),
        "3": ("Qwen/Qwen2.5-7B-Instruct", "qwen7b", "~8GB"),
        "4": ("google/gemma-2-2b-instruct", "gemma2b", "~2GB")
    }
    
    if model_choice not in model_map:
        print("❌ Invalid choice")
        return False
    
    model_id, model_key, model_size = model_map[model_choice]
    
    print("=" * 80)
    print(f"📦 INSTALLING: {model_id}")
    print("=" * 80)
    print(f"📊 Size: {model_size}")
    print(f"📍 Location: ~/.cache/quicord_models/")
    print(f"⏳ This will take 2-10 minutes (depending on internet speed)")
    print()
    
    confirm = input("Continue? (yes/no): ").strip().lower()
    if confirm not in ["yes", "y"]:
        print("❌ Cancelled")
        return False
    
    print()
    print("📥 Downloading model...")
    print("⏳ Please wait...\n")
    
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        cache_dir = Path.home() / ".cache" / "quicord_models"
        cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Download tokenizer
        print("📥 Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            cache_dir=str(cache_dir),
            trust_remote_code=True
        )
        print("✅ Tokenizer downloaded!")
        
        # Download model
        print(f"📥 Downloading model ({model_size})...")
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            cache_dir=str(cache_dir),
            torch_dtype="auto",
            device_map="auto",
            trust_remote_code=True
        )
        print("✅ Model downloaded!")
        
        print()
        print("=" * 80)
        print("✅ INSTALLATION COMPLETE!")
        print("=" * 80)
        print(f"📍 Model cached at: {cache_dir}")
        print(f"💾 Disk usage: {model_size}")
        print()
        print("🎉 You can now use AI text restructuring in Quicord!")
        print()
        print("📖 Usage:")
        print(f"   python python/text_restructure_local.py --model {model_key} --input file.txt")
        print()
        
        return True
        
    except Exception as e:
        print()
        print(f"❌ ERROR: {e}")
        print()
        print("💡 TROUBLESHOOTING:")
        print("1. Check internet connection")
        print("2. Check disk space (need ~10GB free)")
        print("3. Try again later (HuggingFace may be down)")
        return False


def main():
    """Main installer"""
    clear_screen()
    show_header()
    
    # Check dependencies first
    if not check_dependencies():
        print("❌ Please install dependencies first, then run this script again.")
        return
    
    print()
    print("=" * 80)
    show_models()
    print("=" * 80)
    
    print("💡 RECOMMENDATION:")
    print("   Option 1 (Qwen2.5-3B) is BEST for most users!")
    print("   - 3GB download, 32K context, 87% quality")
    print("   - Handles ALL Vietnamese contracts")
    print()
    
    choice = input("Your choice (0-4): ").strip()
    
    if choice == "0":
        print()
        print("⏭️  SKIPPED - No LLM installed")
        print("ℹ️  You can install it later by running:")
        print("   python python/install_llm_optional.py")
        print()
        print("📝 Quicord will work without LLM (manual text restructuring)")
        return
    
    print()
    success = install_model(choice)
    
    if success:
        print("🎉 SUCCESS! AI text restructuring is now available!")
    else:
        print("❌ Installation failed. You can try again later.")
    
    print()
    input("Press Enter to exit...")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
    except Exception as e:
        print(f"\n\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
