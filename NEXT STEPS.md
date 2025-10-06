NEXT STEPS
⏳ Install Docling → Fix PDF processing
⏳ Download Phi-3-Mini via app : recheck Model updates trên huggingface, hiện nay có nhiều model mới hơn.
⏳ Update Query UI → Connect RAG + LLM
⏳ Testing → Deploy! 🚀

do it!, ngoài ra làm các bước sau: 


1. fix các lỗi trong lần build trước và trongproblems console.  thực hiện lần lượt tất cả các bước trong AI Intergration Architecture (AIA) nhé. Yolomode . Hôm nay 100% focus vào tính năng Querying, backend  và UI của nó.

2. có thêm tính năng cho user enter/paste huggingface token của riêng họ không? tính năng AI powered suggestion sẽ based trên cấu hình máy tính của user, tạm thời thì dùng cấu hình máy tính của tôi để test : AMD 5700x, 64gb ram, rx580 8gb ram. 

3. tạm thời dùng Phi-4: https://huggingface.co/microsoft/phi-4 hoặc các biến thể phù hợp của nó hoặc Qwen https://huggingface.co/Qwen và các biến thể phù hợp của nó, hoặc Gemma https://huggingface.co/google . cái nào mạnh tiếng Việt thì ưu tiên.và tải luôn model về máy tôi,  tận dụng NVME nhanh của ổ C: bằng cách download model về folder tạm :"C:\AI Models for Vscode" . vì querying cần nhiều reasoning power nên bạn lưu ý điểm này. các model bạn đang tự recommend trong AI Intergrarion Architecture report  (AIA) , huggingface Intergation Complete (HIC) là cũ và outdated, cần làm mới lại. test luôn 100 file trong "D:\Work\Coding\archi-query-master\Documents" và tạo test report/ cập nhật test report đã có. 


4. LMstudio đã dc cài và chạy ổn định trên máy tính của tôi mấy tháng rồi, check your steps. nghiên cứu thêm các model khác phù hợp với LMstudio và test thử.  tôi muốn có thêm 1 lựa chọn nữa cho local reasoning là bare Vulkan, bạn nghiên cứu thêm và test thử.
5. UI cần có chỗ cho User enter/ paste API key của các Cloud AI mà họ đang dùng. . các dependencies dể support cho các hardware khác như cuda, ollama, Apple silicon và các supported hardware  vẫn phải được implemented sẵn. 

6. work flow của tôi monng muốn sẽ là: sau khi import 1000-5000 tài liệu của mình vào app, chọn model reasoning local/ cloud thì tôi có thể hỏi nó những câu như : quy trình xét duyệt thủ tục xin thuận chủ trương đầu tư trước 1/7/2025 và sau ngày này ở TPHCM có gì khác nhau? AI sẽ truy xuất những gì đã rag và thậm chí là rag thêm những file local có liên quan để trình bày câu trả lời, đồng thời cite các nội dung relevant trong các file local. có thêm tính năng web search để mở rộng phạm vi nghiên cứu và tính năng tải file trên web được tôi tự tải về hay AI tải về để làm phong phú thêm data cho chủ đề. thêm folder dạng như"new downloaded data trong folder chứa tài liệu. 

7. làm xong các bước này thì push/commit lên github.

8. tôi thấy có 1 con chatbot khá là thú vị, có vẻ có liên quan : https://huggingface.co/mradermacher/Chatbot_VietNamese_Law_Qwen-GGUF . tìm xem có chat bot nào mới hơn và tốt hơn theo chuyên đề Law này hay không. tìm hiểu xem có thể dùng nó như thế nào với lmstudio có sẵn của máy tôi nhé. 