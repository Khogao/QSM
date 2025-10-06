"""
Test Vietnamese Law Model - Faster Version
With longer timeout and streaming support
"""
import requests
import json
import time

LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "chatbot_vietnamese_law_qwen"

def test_streaming():
    """Test with streaming for better responsiveness"""
    
    print("🚀 TEST MODEL VỚI STREAMING")
    print("=" * 60)
    
    question = "Luật đầu tư 2020 có điều khoản nào quan trọng?"
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": "Bạn là chuyên gia tư vấn pháp luật Việt Nam. Trả lời ngắn gọn."
            },
            {
                "role": "user",
                "content": question
            }
        ],
        "temperature": 0.7,
        "max_tokens": 300,
        "stream": True
    }
    
    print(f"\n📝 Question: {question}\n")
    print("📨 Response: ", end="", flush=True)
    
    start_time = time.time()
    total_tokens = 0
    full_response = ""
    
    try:
        with requests.post(
            LM_STUDIO_URL,
            json=payload,
            stream=True,
            timeout=180
        ) as response:
            
            for line in response.iter_lines():
                if line:
                    line_text = line.decode('utf-8')
                    if line_text.startswith('data: '):
                        data_str = line_text[6:]
                        if data_str == '[DONE]':
                            break
                        
                        try:
                            data = json.loads(data_str)
                            if 'choices' in data and len(data['choices']) > 0:
                                delta = data['choices'][0].get('delta', {})
                                content = delta.get('content', '')
                                if content:
                                    print(content, end="", flush=True)
                                    full_response += content
                                    total_tokens += 1
                        except json.JSONDecodeError:
                            pass
        
        elapsed = time.time() - start_time
        tokens_per_sec = total_tokens / elapsed if elapsed > 0 else 0
        
        print(f"\n\n{'=' * 60}")
        print(f"✅ Time: {elapsed:.2f}s")
        print(f"✅ Tokens: ~{total_tokens}")
        print(f"✅ Speed: ~{tokens_per_sec:.1f} tokens/sec")
        print(f"✅ Response length: {len(full_response)} chars")
        
        # Check speed
        if tokens_per_sec < 10:
            print(f"\n⚠️ CẢNH BÁO: Tốc độ chậm ({tokens_per_sec:.1f} tok/s)")
            print("💡 Khuyến nghị:")
            print("  1. Kiểm tra GPU layers trong LM Studio")
            print("  2. Giảm context length")
            print("  3. Thử quantization nhỏ hơn (Q4_K_M)")
        elif tokens_per_sec < 50:
            print(f"\n⚠️ Tốc độ chấp nhận được nhưng có thể tối ưu")
            print(f"💡 Nên đạt 60-100 tok/s với Vulkan")
        else:
            print(f"\n✅ Tốc độ TỐT! ({tokens_per_sec:.1f} tok/s)")
        
        return True
        
    except requests.exceptions.Timeout:
        print("\n❌ TIMEOUT! Model phản hồi quá chậm")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

def check_gpu_status():
    """Check if GPU is being used"""
    print("\n🔍 KIỂM TRA CẤU HÌNH GPU")
    print("=" * 60)
    print("💡 Mở LM Studio và kiểm tra:")
    print("  • Settings > Hardware > GPU Acceleration")
    print("  • Model Settings > GPU Layers (nên để Auto hoặc 99)")
    print("  • Kiểm tra VRAM usage trong Task Manager")
    print("=" * 60)

if __name__ == "__main__":
    check_gpu_status()
    test_streaming()
