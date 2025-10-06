"""
Test End-to-End RAG với Vietnamese Law Model
=============================================

Test query phức tạp về quy trình đầu tư trước/sau 1/7/2025
Kiểm tra:
- Model có trả lời được không
- Có citations không
- Response quality
- Performance
"""

import requests
import json
import time
from datetime import datetime

# Config
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "chatbot_vietnamese_law_qwen"

# Test query phức tạp
TEST_QUERY = """
Quy trình xét duyệt thủ tục xin thuận chủ trương đầu tư trước 1/7/2025 và sau ngày này ở TPHCM có gì khác nhau?

Hãy phân tích chi tiết:
1. Quy trình trước 1/7/2025
2. Quy trình sau 1/7/2025
3. Các điểm khác biệt chính
4. Tài liệu pháp lý liên quan
"""

# Context mô phỏng (giả lập RAG retrieval)
MOCK_CONTEXT = """
[NGUỒN 1] Luật Đầu tư 2020 - Điều 33:
Thủ tục cấp Giấy chứng nhận đăng ký đầu tư đối với dự án đầu tư không thuộc diện quyết định chủ trương đầu tư:
1. Nhà đầu tư nộp 01 bộ hồ sơ đề nghị cấp Giấy chứng nhận đăng ký đầu tư cho cơ quan đăng ký đầu tư.
2. Trong thời hạn 15 ngày kể từ ngày nhận đủ hồ sơ hợp lệ, cơ quan đăng ký đầu tư cấp Giấy chứng nhận đăng ký đầu tư cho nhà đầu tư.

[NGUỒN 2] Nghị định 31/2021/NĐ-CP - Hướng dẫn Luật Đầu tư 2020:
Đối với dự án đầu tư có sử dụng đất, nhà đầu tư phải có văn bản chấp thuận về nhu cầu sử dụng đất từ Ủy ban nhân dân cấp tỉnh trước khi nộp hồ sơ đăng ký đầu tư.

[NGUỒN 3] Quyết định 123/QĐ-UBND ngày 15/6/2025 của UBND TPHCM:
Kể từ ngày 1/7/2025, áp dụng quy trình mới:
- Dự án dưới 100 tỷ: không cần chấp thuận chủ trương
- Dự án từ 100-500 tỷ: UBND quận/huyện quyết định
- Dự án trên 500 tỷ: UBND thành phố quyết định
- Thời gian xử lý rút ngắn từ 15 ngày xuống 10 ngày làm việc

[NGUỒN 4] Thông tư 03/2025/TT-BKH hướng dẫn thực hiện:
Các bước trong quy trình mới (sau 1/7/2025):
1. Nhà đầu tư nộp hồ sơ trực tuyến qua Cổng dịch vụ công TPHCM
2. Hệ thống tự động kiểm tra tính đầy đủ hồ sơ (1 ngày)
3. Phòng Kinh tế thẩm định (5 ngày)
4. UBND ra quyết định (4 ngày)
5. Cấp Giấy chứng nhận (trong ngày)
"""

def test_rag_query():
    """Test RAG với context được inject"""
    
    print("=" * 80)
    print("🧪 TEST RAG END-TO-END - VIETNAMESE LAW MODEL")
    print("=" * 80)
    print()
    
    print("📋 Query:")
    print(TEST_QUERY)
    print()
    
    print("📚 Context được cung cấp (mô phỏng RAG retrieval):")
    print(MOCK_CONTEXT[:500] + "...")
    print()
    
    # System prompt với context
    system_prompt = f"""Bạn là chuyên gia tư vấn pháp luật Việt Nam chuyên về đầu tư.

CONTEXT TÀI LIỆU (sử dụng để trả lời):
{MOCK_CONTEXT}

HƯỚNG DẪN:
1. Dựa vào context trên để trả lời câu hỏi
2. Trích dẫn nguồn bằng cách viết [NGUỒN 1], [NGUỒN 2], v.v.
3. Phân tích chi tiết và có cấu trúc
4. Nếu thông tin không đủ, hãy nói rõ
"""
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": TEST_QUERY}
        ],
        "temperature": 0.3,  # Giảm để có câu trả lời chính xác hơn
        "max_tokens": 1000,   # Tăng để trả lời đầy đủ
        "stream": True
    }
    
    print("-" * 80)
    print("🤖 Model đang trả lời...")
    print("-" * 80)
    print()
    
    start_time = time.time()
    response_text = ""
    token_count = 0
    
    try:
        with requests.post(LM_STUDIO_URL, json=payload, stream=True, timeout=300) as response:
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line_text = line.decode('utf-8')
                    
                    if line_text.startswith('data: '):
                        data_str = line_text[6:]
                        
                        if data_str.strip() == '[DONE]':
                            break
                        
                        try:
                            data = json.loads(data_str)
                            
                            if 'choices' in data and len(data['choices']) > 0:
                                delta = data['choices'][0].get('delta', {})
                                content = delta.get('content', '')
                                
                                if content:
                                    print(content, end="", flush=True)
                                    response_text += content
                                    token_count += 1
                        
                        except json.JSONDecodeError:
                            continue
        
        end_time = time.time()
        elapsed = end_time - start_time
        tokens_per_sec = token_count / elapsed if elapsed > 0 else 0
        
        print("\n")
        print("=" * 80)
        print("📊 KẾT QUẢ TEST")
        print("=" * 80)
        print()
        
        print(f"⏱️  Thời gian: {elapsed:.2f}s")
        print(f"📝 Tokens: ~{token_count}")
        print(f"⚡ Tốc độ: ~{tokens_per_sec:.1f} tokens/sec")
        print()
        
        # Phân tích citations
        citations = []
        for i in range(1, 5):
            if f"[NGUỒN {i}]" in response_text or f"[nguồn {i}]" in response_text.lower():
                citations.append(i)
        
        print("📌 ĐÁNH GIÁ:")
        print()
        
        if citations:
            print(f"✅ Citations: Có trích dẫn {len(citations)} nguồn: {citations}")
        else:
            print("❌ Citations: KHÔNG có trích dẫn (model không follow instruction)")
        
        if len(response_text) > 200:
            print("✅ Response length: Đầy đủ (>200 chars)")
        else:
            print("⚠️  Response length: Ngắn quá, có thể thiếu thông tin")
        
        if "1/7/2025" in response_text or "1.7.2025" in response_text:
            print("✅ Temporal reasoning: Model hiểu về thời gian (trước/sau 1/7/2025)")
        else:
            print("⚠️  Temporal reasoning: Model có thể không phân tích được về thời gian")
        
        if "khác nhau" in response_text or "khác biệt" in response_text:
            print("✅ Comparison: Model có so sánh sự khác biệt")
        else:
            print("⚠️  Comparison: Model có thể chưa so sánh rõ ràng")
        
        print()
        
        if tokens_per_sec < 20:
            print("⚠️  CẢNH BÁO: Tốc độ rất chậm!")
            print("💡 Khuyến nghị: Enable GPU trong LM Studio để tăng tốc 10-15x")
            print("   Xem chi tiết: OPTIMIZATION_GUIDE_URGENT.md")
        elif tokens_per_sec < 50:
            print("⚠️  Tốc độ chậm (có thể đang dùng CPU)")
            print("💡 Có thể cải thiện bằng GPU acceleration")
        else:
            print("✅ Tốc độ tốt!")
        
        print()
        
        # Kết luận tổng thể
        score = 0
        if citations: score += 3
        if len(response_text) > 200: score += 2
        if "1/7/2025" in response_text or "1.7.2025" in response_text: score += 2
        if "khác nhau" in response_text or "khác biệt" in response_text: score += 2
        if tokens_per_sec > 50: score += 1
        
        print("🎯 TỔNG KẾT:")
        print(f"   Score: {score}/10")
        
        if score >= 8:
            print("   ✅ RAG hoạt động TỐT!")
        elif score >= 5:
            print("   ⚠️  RAG hoạt động CHẤP NHẬN ĐƯỢC, cần cải thiện")
        else:
            print("   ❌ RAG cần KHẮC PHỤC nhiều vấn đề")
        
        print()
        print("=" * 80)
        
        # Lưu kết quả
        result = {
            "timestamp": datetime.now().isoformat(),
            "query": TEST_QUERY,
            "response": response_text,
            "metrics": {
                "time_seconds": elapsed,
                "tokens": token_count,
                "tokens_per_sec": tokens_per_sec
            },
            "analysis": {
                "citations": citations,
                "has_citations": len(citations) > 0,
                "response_length": len(response_text),
                "has_temporal_reasoning": "1/7/2025" in response_text or "1.7.2025" in response_text,
                "has_comparison": "khác nhau" in response_text or "khác biệt" in response_text,
                "score": score
            }
        }
        
        with open("test_rag_result.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print("💾 Kết quả đã lưu vào: test_rag_result.json")
        print()
        
        return result
        
    except requests.exceptions.Timeout:
        print("\n❌ TIMEOUT: Model không trả lời trong 5 phút")
        print("💡 Có thể do:")
        print("   - Model quá chậm (cần GPU)")
        print("   - Query quá phức tạp")
        print("   - Context quá dài")
        return None
        
    except Exception as e:
        print(f"\n❌ LỖI: {e}")
        return None

if __name__ == "__main__":
    test_rag_query()
