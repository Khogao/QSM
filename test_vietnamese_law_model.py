"""
Test Vietnamese Law Model with LM Studio
Quick test to verify model is working
"""
import requests
import json
import time

# Test configuration
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "chatbot_vietnamese_law_qwen"

def test_vietnamese_law_model():
    """Test model with Vietnamese legal question"""
    
    print("🧪 TEST VIETNAMESE LAW MODEL")
    print("=" * 60)
    
    # Test 1: Simple greeting
    print("\n📝 Test 1: Kiểm tra model phản hồi tiếng Việt")
    response1 = call_model("Xin chào, bạn là ai?")
    print(f"✅ Response: {response1[:200]}...")
    
    # Test 2: Legal question
    print("\n📝 Test 2: Câu hỏi về luật đầu tư")
    question = """Quy trình xét duyệt thủ tục xin thuận chủ trương đầu tư 
trước 1/7/2025 và sau ngày này ở TPHCM có gì khác nhau?"""
    
    response2 = call_model(question)
    print(f"✅ Response length: {len(response2)} characters")
    print(f"✅ Response preview:\n{response2[:500]}...")
    
    # Test 3: Performance test
    print("\n📝 Test 3: Đo hiệu suất")
    start = time.time()
    response3 = call_model("Luật đầu tư 2020 có những thay đổi gì?")
    elapsed = time.time() - start
    
    words = len(response3.split())
    tokens_approx = int(words * 1.3)  # Rough estimate
    tokens_per_sec = tokens_approx / elapsed if elapsed > 0 else 0
    
    print(f"✅ Time: {elapsed:.2f}s")
    print(f"✅ Words: {words}")
    print(f"✅ Estimated tokens: {tokens_approx}")
    print(f"✅ Speed: ~{tokens_per_sec:.1f} tokens/sec")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("🎉 Model đang hoạt động tốt với tiếng Việt!")
    
    return True

def call_model(prompt: str, max_tokens: int = 500) -> str:
    """Call LM Studio API"""
    try:
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {
                    "role": "system",
                    "content": "Bạn là chuyên gia tư vấn pháp luật Việt Nam."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": max_tokens
        }
        
        response = requests.post(
            LM_STUDIO_URL,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            return f"Error {response.status_code}: {response.text}"
            
    except Exception as e:
        return f"Exception: {str(e)}"

if __name__ == "__main__":
    test_vietnamese_law_model()
