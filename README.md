# English-drilling-full (HocDrill)

Nền tảng luyện phản xạ ngữ pháp và ôn luyện tiếng Anh chuyên sâu 100 bài học với hệ thống hội thoại 2 giọng đọc Nam/Nữ, 5 cấp độ khoan sâu (Drilling) và Tab Ôn Luyện Đề thi 20 câu ngẫu nhiên với 7 dạng bài tập phong phú.

Tác giả: **nguyenquang269-byte**  
Repository: **https://github.com/nguyenquang269-byte/English-drilling-full**

---

## 🌟 Các Tính Năng Nổi Bật

1. **100 Bài Học Ngữ Pháp Chuẩn Hóa**:
   - Từ Động từ To Be cơ bản, 12 Thì, Câu Bị Động, Câu Điều Kiện, Mệnh đề Quan hệ, Cụm Động từ đến Đảo ngữ & Rút gọn mệnh đề nâng cao.
   - Mỗi bài học đều có **Hội thoại mở đầu 1 Nam 1 Nữ (12 câu)** phát âm chuẩn ngữ điệu.
   - Giảng giải chi tiết quy tắc ngữ pháp trọng tâm và ví dụ thực tế.

2. **5 Cấp Độ Khoan Sâu Phản Xạ (Drilling Modes)**:
   - Cấp độ 1: Nghe & Nhắc lại (Hỗ trợ Web Speech API nhận diện giọng nói & đo sóng âm).
   - Cấp độ 2: Điền chỗ trống nhanh.
   - Cấp độ 3: Sắp xếp khối từ thành câu hoàn chỉnh.
   - Cấp độ 4: Biến đổi cấu trúc câu theo yêu cầu.
   - Cấp độ 5: Ứng dụng cấu trúc vào ngữ cảnh mới.

3. **Tự Động Đánh Dấu Bài Đã Học & Quản Lý Tiến Độ**:
   - Tự động lưu tiến độ vào `localStorage` khi hoàn thành bài học.
   - Thanh tiến độ tổng quan: `📊 Đã học X / 100 bài (X%)` và nhãn `✅ [Đã học]` trên danh sách.

4. **Tab Ôn Luyện Tổng Hợp (Smart Practice & 20-Q Quiz)**:
   - Trích xuất ngẫu nhiên **20 câu hỏi** từ ngân hàng bài tập của các bài đã học hoàn thành.
   - Hỗ trợ **7 dạng bài tập đa dạng**:
     1. 🎯 *Trắc nghiệm ngữ pháp (Multiple Choice)*
     2. ✍️ *Điền từ vào chỗ trống (Fill in the blank)*
     3. 🧩 *Sắp xếp từ thành câu (Sentence Scramble)*
     4. 🔍 *Tìm lỗi sai & Nhận diện câu chuẩn (Error Identification)*
     5. 🎧 *Nghe phản xạ & Dịch nghĩa (Listening Reflex)*
     6. 🎙️ *Luyện nói qua Micro (Speaking Practice)*: Nhận diện giọng nói qua Web Speech API, đo sóng âm và chấm % độ chính xác phát âm.
     7. 📖 *Đọc hiểu đoạn văn ngắn & Trả lời câu hỏi (Reading & Comprehension)*: Có nút nghe phát âm toàn bài đọc (TTS).
   - Chấm điểm tức thì, giải thích chi tiết đáp án đúng và báo cáo kết quả chi tiết.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu:
- Node.js (phiên bản 18+ trở lên).

### Các bước cài đặt:
1. Clone repository:
   ```bash
   git clone https://github.com/nguyenquang269-byte/English-drilling-full.git
   cd English-drilling-full
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi chạy máy chủ:
   ```bash
   npm start
   ```

4. Mở trình duyệt và truy cập:
   ```
   http://localhost:3000
   ```

---

## 📁 Cấu Trúc Dự Án

```
English-drilling-full/
├── data/
│   ├── lesson-001.json ... lesson-100.json    # Dữ liệu 100 bài học
│   └── exercises/
│       ├── exercise-001.json ... exercise-100.json # Ngân hàng 100 bài tập
├── scripts/
│   └── build_exercises.js                     # Kịch bản tạo ngân hàng bài tập
├── index.html                                 # Giao diện chính (Tabs, Drilling & Quiz)
├── app.js                                     # Logic xử lý, Web Speech API & Quiz Engine
├── server.js                                  # Node.js Express server & TTS Proxy
├── package.json                               # Cấu hình dự án & scripts
└── README.md                                  # Hướng dẫn sử dụng
```
