// Generate 30 test PDF/TXT files for testing RAG pipeline
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'test-documents');

// Create test directory
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Sample content for construction/architecture domain
const sampleTexts = [
  "Tiêu chuẩn xây dựng TCXDVN 356:2005 về thiết kế móng cọc. Chiều sâu móng tối thiểu phải đảm bảo chịu tải trọng công trình. Cọc bê tông cốt thép phải có cường độ tối thiểu M300.",
  "Quy chuẩn kỹ thuật quốc gia QCVN 02:2009/BXD về an toàn cháy cho nhà và công trình. Chiều rộng lối thoát hiểm tối thiểu 1.2m. Cửa thoát hiểm phải mở ra ngoài.",
  "TCVN 2737:1995 Tiêu chuẩn tải trọng và tác động - Tiêu chuẩn thiết kế. Tải trọng gió phải được tính toán theo vùng địa lý. Hệ số vượt tải áp dụng 1.2 cho tải trọng thường xuyên.",
  "Nghị định 46/2015/NĐ-CP về quản lý chất lượng và bảo trì công trình xây dựng. Công trình phải được nghiệm thu theo quy định. Hồ sơ hoàn công phải đầy đủ và chính xác.",
  "Thông tư 10/2020/TT-BXD hướng dẫn lập và quản lý dự án đầu tư xây dựng. Báo cáo kinh tế kỹ thuật phải được phê duyệt trước khi khởi công.",
  "Luật Xây dựng 2014 quy định về hoạt động xây dựng. Giấy phép xây dựng là bắt buộc đối với công trình xây mới. Vi phạm quy định có thể bị phạt từ 100-200 triệu đồng.",
  "TCVN 9362:2012 Tiêu chuẩn thiết kế hệ thống cấp thoát nước. Đường kính ống cấp nước tối thiểu Φ15mm. Áp lực nước cấp tối thiểu 0.15 MPa.",
  "Quy hoạch chi tiết xây dựng tỷ lệ 1/500 theo Nghị định 37/2010. Bản vẽ quy hoạch phải thể hiện ranh giới đất, hệ thống giao thông, công trình công cộng.",
  "Tiêu chuẩn thiết kế bãi đỗ xe TCXDVN 104:2007. Kích thước ô đỗ xe con 2.5m x 5m. Kích thước ô đỗ xe tải 3.5m x 10m. Độ dốc lối vào không quá 12%.",
  "QCVN 01:2021/BXD Quy chuẩn kỹ thuật quốc gia về quy hoạch xây dựng. Mật độ xây dựng tối đa 60% diện tích đất. Hệ số sử dụng đất không quá 4.0.",
  "Thông tư 26/2016/TT-BXD về định mức dự toán xây dựng công trình. Đơn giá nhân công khu vực I: 60,000 VNĐ/công. Khu vực II: 55,000 VNĐ/công.",
  "Luật Đất đai 2013 về quyền sử dụng đất. Thời hạn sử dụng đất ở không hạn chế. Đất thương mại dịch vụ tối đa 50 năm có thể gia hạn.",
  "TCVN 4086:2012 Gạch chịu lửa - Phương pháp thử. Độ chịu nén tối thiểu 20 MPa. Độ hút nước không quá 15%. Khối lượng thể tích 1800-2200 kg/m³.",
  "Quy chuẩn QCVN 04:2008/BXD về hệ thống cung cấp nước sinh hoạt. Chất lượng nước phải đạt tiêu chuẩn QCVN 01:2009/BYT. Áp lực nước tại điểm xa nhất tối thiểu 0.1 MPa.",
  "Nghị định 100/2018/NĐ-CP về đầu tư xây dựng công trình theo hình thức PPP. Thời gian thực hiện dự án BOT tối đa 50 năm. Vốn nhà nước tham gia không quá 50%.",
  "TCVN 7957:2008 Bê tông và cấu kiện bê tông cốt thép. Cường độ chịu nén B25 tương đương M300. Sai số cho phép cường độ ±15%. Độ sụt bê tông 2-12 cm.",
  "Thông tư 06/2021/TT-BXD về hệ thống thông tin báo cáo công tác quản lý dự án đầu tư xây dựng. Báo cáo tiến độ phải gửi hàng tháng. Báo cáo quyết toán phải có kiểm toán độc lập.",
  "Quy chuẩn QCVN 03:2012/BXD về cấp thoát nước đô thị. Hệ thống thoát nước mưa phải tách riêng. Đường kính cống thoát nước tối thiểu D300mm.",
  "TCXDVN 375:2006 Thiết kế đường ô tô. Bán kính cong ngang tối thiểu 15m với vận tốc 30km/h. Độ dốc dọc tối đa 9%. Mặt đường bê tông xi măng dày tối thiểu 20cm.",
  "Luật Nhà ở 2014 về quyền sở hữu nhà. Công dân Việt Nam được sở hữu nhà ở không hạn chế số lượng. Người nước ngoài được mua tối đa 30% căn hộ trong dự án.",
  "TCVN 9397:2012 Tiêu chuẩn thiết kế hệ thống chiếu sáng công cộng. Độ rộng đường 12m cần cột đèn cao 8m. Khoảng cách giữa các cột 25-30m. Công suất đèn LED 60-100W.",
  "Nghị định 59/2015/NĐ-CP về quản lý dự án đầu tư xây dựng. Chủ đầu tư phải có năng lực tài chính tối thiểu 15% tổng mức đầu tư. Tư vấn giám sát phải có chứng chỉ hành nghề.",
  "QCVN 05:2008/BXD Quy chuẩn kỹ thuật an toàn cháy cho nhà cao tầng. Chiều cao cứu hỏa tối đa 50m. Khoảng cách giữa 2 cầu thang thoát hiểm tối đa 50m. Cửa thoát hiểm mở ra ngoài.",
  "Thông tư 12/2019/TT-BXD về hợp đồng xây dựng. Hợp đồng trọn gói phải xác định rõ khối lượng và đơn giá. Thời gian bảo hành công trình tối thiểu 24 tháng.",
  "TCVN 5574:2018 Kết cấu bê tông và bê tông cốt thép. Chiều dày lớp bảo vệ cốt thép tối thiểu 20mm. Đường kính cốt thép chủ tối thiểu Φ12. Khoảng cách cốt thép 100-200mm.",
  "Quy hoạch sử dụng đất Thành phố Hồ Chí Minh đến 2030. Đất ở đô thị dự kiến 18,500 ha. Đất công trình công cộng 3,800 ha. Đất giao thông 12,200 ha.",
  "TCXDVN 335:2005 Nhà công nghiệp một tầng - Thiết kế kết cấu. Nhịp khung thép 18-30m. Cao trình mặt nền +0.00 cao hơn mặt đường 20cm. Móng băng bê tông cốt thép M200.",
  "Nghị định 68/2019/NĐ-CP về xử phạt vi phạm hành chính trong lĩnh vực xây dựng. Xây dựng không phép phạt 50-100 triệu. Sai phép phạt 30-50 triệu. Tháo dỡ công trình sai phạm.",
  "QCVN 07:2016/BXD Quy chuẩn kỹ thuật quốc gia về nhà chung cư. Diện tích căn hộ tối thiểu 25m². Chiều cao tầng 2.7-3.0m. Chiều rộng hành lang tối thiểu 1.5m.",
  "Thông tư 16/2016/TT-BXD về cấp chứng chỉ hành nghề xây dựng. Kiến trúc sư cần tốt nghiệp đại học chuyên ngành và 3 năm kinh nghiệm. Kỹ sư kết cấu cần 5 năm kinh nghiệm."
];

console.log('🚀 Generating 30 test documents...\n');

// Generate TXT files
for (let i = 0; i < 30; i++) {
  const fileName = `test-doc-${String(i + 1).padStart(3, '0')}.txt`;
  const filePath = path.join(testDir, fileName);
  
  // Use multiple sample texts for each file
  const contentParts = [];
  for (let j = 0; j < 3; j++) {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    contentParts.push(sampleTexts[randomIndex]);
  }
  const content = contentParts.join('\n\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created: ${fileName}`);
}

console.log(`\n✨ Successfully generated 30 test documents in: ${testDir}`);
console.log('\n📋 Document topics include:');
console.log('   - Construction standards (TCXDVN)');
console.log('   - National technical regulations (QCVN)');
console.log('   - Building laws and decrees');
console.log('   - Fire safety regulations');
console.log('   - Land use planning');
console.log('   - Architectural standards');
console.log('   - Infrastructure design');
console.log('\n🎯 Ready for RAG pipeline testing!');
