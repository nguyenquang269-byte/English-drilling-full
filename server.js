const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static files from root directory
app.use(express.static(path.join(__dirname)));

// TTS proxy route for zero-dependency reliable voice synthesis on all OS platforms
app.get('/api/tts', (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).send('Missing text parameter');
  
  const targetLang = (lang === 'vi' || lang === 'vi-VN') ? 'vi' : 'en';
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim();
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${targetLang}&client=tw-ob`;

  const requestOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  };

  https.get(ttsUrl, requestOptions, (ttsRes) => {
    if (ttsRes.statusCode === 200) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      ttsRes.pipe(res);
    } else {
      res.status(ttsRes.statusCode || 500).send('TTS upstream request failed');
    }
  }).on('error', (err) => {
    console.error('TTS Proxy Error:', err);
    res.status(500).send('TTS service error');
  });
});

// API route to list available lessons
app.get('/api/lessons', (req, res) => {
  res.json([
    { file: "lesson-001.json", name: "Bài 1: ToBe - I am / You are (Cơ bản)" },
    { file: "lesson-002.json", name: "Bài 2: ToBe - Hiện tại Đơn (Nghề nghiệp & Tính chất)" },
    { file: "lesson-003.json", name: "Bài 3: ToBe - Phủ định (Am not / Isn't / Aren't)" },
    { file: "lesson-004.json", name: "Bài 4: ToBe - Câu hỏi Yes/No (Am / Is / Are...)" },
    { file: "lesson-005.json", name: "Bài 5: ToBe - Câu hỏi Wh- (Where / Who / How / What)" },
    { file: "lesson-006.json", name: "Bài 6: Động từ Thường - Thói quen hàng ngày (I/You/We/They)" },
    { file: "lesson-007.json", name: "Bài 7: Động từ Thường - Ngôi thứ 3 số ít & Does/Doesn't" },
    { file: "lesson-008.json", name: "Bài 8: ToBe - Quá khứ Đơn (Was / Were - Vị trí & Trạng thái)" },
    { file: "lesson-009.json", name: "Bài 9: ToBe - Quá khứ Đơn (Phủ định Wasn't/Weren't & Câu hỏi)" },
    { file: "lesson-010.json", name: "Bài 10: ToBe - Tương lai Đơn (Will be - Sẽ ở đâu & Trạng thái)" },
    { file: "lesson-011.json", name: "Bài 11: ToBe - Tương lai Đơn (Phủ định Won't be & Câu hỏi)" },
    { file: "lesson-012.json", name: "Bài 12: Động từ Thường - Phủ định (Don't / Doesn't)" },
    { file: "lesson-013.json", name: "Bài 13: Động từ Thường - Câu hỏi Yes/No (Do / Does...?)" },
    { file: "lesson-014.json", name: "Bài 14: Động từ Thường - Câu hỏi Wh- (What/Where/When/Who...)" },
    { file: "lesson-015.json", name: "Bài 15: Động từ Thường - Quá khứ Đơn (Did / Didn't)" },
    { file: "lesson-016.json", name: "Bài 16: Động từ Thường - Tương lai Đơn (Will / Won't)" },
    { file: "lesson-017.json", name: "Bài 17: ToBe - Hiện tại Tiếp diễn (Am / Is / Are + V-ing)" },
    { file: "lesson-018.json", name: "Bài 18: Hiện tại Tiếp diễn - Phủ định & Câu hỏi (Yes/No & Wh-)" },
    { file: "lesson-019.json", name: "Bài 19: Động từ Thường - Hiện tại Tiếp diễn (Be + V-ing)" },
    { file: "lesson-020.json", name: "Bài 20: Hiện tại Tiếp diễn - Đầy đủ 3 dạng & Trả lời ngắn" },
    { file: "lesson-021.json", name: "Bài 21: So sánh Tính từ - Cơ bản (Ngắn: -er / -est)" },
    { file: "lesson-022.json", name: "Bài 22: So sánh Tính từ - Dài hơn (More/Most) & Bất quy tắc" },
    { file: "lesson-023.json", name: "Bài 23: Trạng từ Tần suất - Vị trí & Cách phối hợp" },
    { file: "lesson-024.json", name: "Bài 24: Giới từ Thời gian & Nơi chốn (In / On / At)" },
    { file: "lesson-025.json", name: "Bài 25: Hiện tại Hoàn thành - Cơ bản (Have / Has + V3/ed)" },
    { file: "lesson-026.json", name: "Bài 26: Hiện tại Hoàn thành - Phủ định, Câu hỏi & Trả lời ngắn" },
    { file: "lesson-027.json", name: "Bài 27: Hiện tại Hoàn thành - Kết hợp Ever / Never / Already / Yet" },
    { file: "lesson-028.json", name: "Bài 28: Quá khứ Tiếp diễn - Cơ bản (Was / Were + V-ing)" },
    { file: "lesson-029.json", name: "Bài 29: Quá khứ Tiếp diễn - Kết hợp Quá khứ Đơn (When / While)" },
    { file: "lesson-030.json", name: "Bài 30: Tương lai Tiếp diễn - Cơ bản (Will be + V-ing)" },
    { file: "lesson-031.json", name: "Bài 31: Tính từ & Trạng từ - Phân biệt & Đuôi -ly" },
    { file: "lesson-032.json", name: "Bài 32: Mạo từ - A / An / The & Mạo từ Rỗng (Zero Article)" },
    { file: "lesson-033.json", name: "Bài 33: Đại từ - Chủ ngữ / Tân ngữ / Sở hữu Cơ bản" },
    { file: "lesson-034.json", name: "Bài 34: Động từ Khuyết thiếu - Can / Can't (Khả năng & Xin phép)" },
    { file: "lesson-035.json", name: "Bài 35: Động từ Khuyết thiếu - Must / Have to (Nghĩa vụ & Quy định)" },
    { file: "lesson-036.json", name: "Bài 36: Động từ Khuyết thiếu - Should / Shouldn't (Lời khuyên)" },
    { file: "lesson-037.json", name: "Bài 37: Động từ Khuyết thiếu - Could / Couldn't (Khả năng Quá khứ & Lịch sự)" },
    { file: "lesson-038.json", name: "Bài 38: Động từ Khuyết thiếu - May / Might (Sự chắc chắn không cao & Xin phép)" },
    { file: "lesson-039.json", name: "Bài 39: Danh từ Đếm được - Số ít & Số nhiều (Quy tắc thêm -s / -es)" },
    { file: "lesson-040.json", name: "Bài 40: Danh từ Không đếm được - Cách dùng & Lượng từ (Some / Any)" },
    { file: "lesson-041.json", name: "Bài 41: Lượng từ - Many / Much / A lot of / Some / Any" },
    { file: "lesson-042.json", name: "Bài 42: Câu So sánh - Cấu trúc đầy đủ (Than / As...As)" },
    { file: "lesson-043.json", name: "Bài 43: Câu Điều kiện - Loại 1 (If + Hiện tại Đơn, Tương lai Đơn)" },
    { file: "lesson-044.json", name: "Bài 44: Câu Điều kiện - Loại 2 (If + Quá khứ Đơn, Would + V)" },
    { file: "lesson-045.json", name: "Bài 45: Câu Bị động - Hiện tại Đơn (Am/Is/Are + V3/ed)" },
    { file: "lesson-046.json", name: "Bài 46: Câu Bị động - Quá khứ Đơn (Was/Were + V3/ed)" },
    { file: "lesson-047.json", name: "Bài 47: Câu Bị động - Hiện tại Hoàn thành (Have/Has been + V3/ed)" },
    { file: "lesson-048.json", name: "Bài 48: Câu Bị động - Với Động từ khuyết thiếu (Can/Should/Must + be + V3/ed)" },
    { file: "lesson-049.json", name: "Bài 49: Câu Điều kiện - Loại 3 (If + Quá khứ Hoàn thành, Would have + V3/ed)" },
    { file: "lesson-050.json", name: "Bài 50: Câu Điều kiện - Tổng hợp 3 loại & Cách rút gọn If" },
    { file: "lesson-051.json", name: "Bài 51: Dạng Nguyên mẫu & V-ing sau Động từ (Like / Enjoy / Want / Hope)" },
    { file: "lesson-052.json", name: "Bài 52: Động từ Đuôi -ed - Cách phát âm 3 âm tiết (/t/ /d/ /ɪd/)" },
    { file: "lesson-053.json", name: "Bài 53: Trạng từ - So sánh hơn & So sánh nhất (More / Most / Faster / Best)" },
    { file: "lesson-054.json", name: "Bài 54: Câu Hỏi Đuôi - Cơ bản (Tag Questions: Isn't it? Aren't you? Doesn't she?)" },
    { file: "lesson-055.json", name: "Bài 55: Câu Hỏi Đuôi - Trường hợp Đặc biệt (Everybody / Nobody / Let's / I am)" },
    { file: "lesson-056.json", name: "Bài 56: Mệnh đề Quan hệ - Who / Whom / Which / That (Xác định & Không xác định)" },
    { file: "lesson-057.json", name: "Bài 57: Mệnh đề Quan hệ - Whose / Where / When / Why (Sở hữu, Nơi chốn, Thời gian, Lý do)" },
    { file: "lesson-058.json", name: "Bài 58: Câu Tường thuật - Câu Kể (Reported Speech: Say / Tell & Quy tắc lùi thì)" },
    { file: "lesson-059.json", name: "Bài 59: Câu Tường thuật - Câu Hỏi & Câu Mệnh lệnh (Ask / Tell / Request)" },
    { file: "lesson-060.json", name: "Bài 60: Cấu trúc Nhấn mạnh & Đảo ngữ Cơ bản (Cleft Sentences & Negative Inversion)" },
    { file: "lesson-061.json", name: "Bài 61: Đại từ Quan hệ - Giới từ đi trước & Đại từ không xác định" },
    { file: "lesson-062.json", name: "Bài 62: Câu Ghép - Liên từ phối hợp (Both...and / Neither...nor / Either...or)" },
    { file: "lesson-063.json", name: "Bài 63: Câu Ghép - Liên từ đối lập & nguyên nhân-kết quả" },
    { file: "lesson-064.json", name: "Bài 64: Hiện tại Hoàn thành Tiếp diễn - Cơ bản (Have/Has been + V-ing)" },
    { file: "lesson-065.json", name: "Bài 65: Quá khứ Hoàn thành - Cơ bản (Had + V3/ed)" },
    { file: "lesson-066.json", name: "Bài 66: Quá khứ Hoàn thành - Kết hợp với Quá khứ Đơn & Trạng từ" },
    { file: "lesson-067.json", name: "Bài 67: Quá khứ Hoàn thành Tiếp diễn (Had been + V-ing)" },
    { file: "lesson-068.json", name: "Bài 68: Tương lai Hoàn thành & Tương lai Hoàn thành Tiếp diễn" },
    { file: "lesson-069.json", name: "Bài 69: Cấu trúc Động từ + Giới từ thông dụng (Depend on / Listen to...)" },
    { file: "lesson-070.json", name: "Bài 70: Cấu trúc Động từ + Trạng từ (Cụm Động từ Phrasal Verb - Cơ bản)" },
    { file: "lesson-071.json", name: "Bài 71: Cụm Động từ - Nâng cao & Dễ nhầm lẫn (Look up / Look after / Take after...)" },
    { file: "lesson-072.json", name: "Bài 72: Tính từ - Đuôi -ed & -ing (Phân biệt Cảm xúc vs Tính chất)" },
    { file: "lesson-073.json", name: "Bài 73: Cấu trúc So sánh nâng cao - The...the... & So sánh gấp bội" },
    { file: "lesson-074.json", name: "Bài 74: Cấu trúc với Too / Enough / So / Such" },
    { file: "lesson-075.json", name: "Bài 75: Đảo ngữ - Toàn bộ & Bộ phận (Đầy đủ các trường hợp thông dụng)" },
    { file: "lesson-076.json", name: "Bài 76: Cấu trúc Nhấn mạnh - Nhấn mạnh chủ ngữ, hành động, thời gian" },
    { file: "lesson-077.json", name: "Bài 77: Đại từ Quan hệ - Giới từ + whom/which & Mệnh đề không xác định" },
    { file: "lesson-078.json", name: "Bài 78: Tính từ & Động từ Đi kèm Giới từ Cố định (Afraid of / Good at...)" },
    { file: "lesson-079.json", name: "Bài 79: Cấu trúc Đề xuất & Ước muốn (Suggest / Recommend / Wish / If only)" },
    { file: "lesson-080.json", name: "Bài 80: Tổng hợp 12 Thì - Bản đồ Ngữ pháp & Dấu hiệu nhận biết" },
    { file: "lesson-081.json", name: "Bài 81: Câu Điều kiện - Loại hỗn hợp (Kết hợp loại 2 & 3)" },
    { file: "lesson-082.json", name: "Bài 82: Cấu trúc With / Without + V-ing / Danh từ" },
    { file: "lesson-083.json", name: "Bài 83: Cấu trúc Dùng + Động từ nguyên mẫu & V-ing (Make / Let / Help / Have / Get)" },
    { file: "lesson-084.json", name: "Bài 84: Cấu trúc Thì trong Mệnh đề Thời gian & Điều kiện" },
    { file: "lesson-085.json", name: "Bài 85: Danh từ Đếm được & Không đếm được - Nâng cao & Trạng từ Số lượng" },
    { file: "lesson-086.json", name: "Bài 86: So sánh - Toàn bộ dạng & Cấu trúc đặc biệt" },
    { file: "lesson-087.json", name: "Bài 87: Cụm Động từ - Từ chỉ Hướng & Vị trí" },
    { file: "lesson-088.json", name: "Bài 88: Giới từ - Tổng hợp trường hợp Dễ nhầm & Cố định" },
    { file: "lesson-089.json", name: "Bài 89: Cấu trúc Nhấn mạnh với What / All / Wh-" },
    { file: "lesson-090.json", name: "Bài 90: Rút gọn Mệnh đề - Dùng V-ing / V3 / Nguyên mẫu" },
    { file: "lesson-091.json", name: "Bài 91: Câu Tường thuật - Nâng cao: Thì hỗn hợp & Cụm cố định" },
    { file: "lesson-092.json", name: "Bài 92: Đại từ Quan hệ - Tổng hợp 3 loại & Mệnh đề không xác định" },
    { file: "lesson-093.json", name: "Bài 93: Động từ Theo sau 2 Dạng - Khác biệt Nghĩa (Remember / Stop / Try / Regret...)" },
    { file: "lesson-094.json", name: "Bài 94: Cấu trúc Giả định - It's time / Would rather / Had better" },
    { file: "lesson-095.json", name: "Bài 95: Cấu trúc With / Without + Danh từ + Bổ nghĩa" },
    { file: "lesson-096.json", name: "Bài 96: Cụm Động từ - Nhóm Thông dụng tổng hợp theo Nghĩa" },
    { file: "lesson-097.json", name: "Bài 97: Liên từ Nâng cao - Cách dùng & Vị trí trong câu" },
    { file: "lesson-098.json", name: "Bài 98: Đảo ngữ - Tổng hợp đầy đủ các trường hợp" },
    { file: "lesson-099.json", name: "Bài 99: Cấu trúc Thay thế & Tránh Lặp trong câu" },
    { file: "lesson-100.json", name: "Bài 100: Tổng hợp Ngữ pháp Toàn Diện - Bản đồ Tinh hoa & Bài Kiểm tra Tổng kết" }
  ]);
});

// API route to get an exercise file
app.get('/api/exercise/:id', (req, res) => {
  const exId = req.params.id.replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(__dirname, 'data', 'exercises', `${exId}.json`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Exercise not found' });
  }
});

// API route to get random 20 review questions from specified lessons
app.get('/api/review-pool', (req, res) => {
  try {
    let lessonsParam = req.query.lessons;
    let count = parseInt(req.query.count, 10) || 20;
    let targetLessons = [];

    if (lessonsParam) {
      targetLessons = lessonsParam.split(',').map(s => s.trim().replace('.json', '').replace('lesson-', ''));
    } else {
      for (let i = 1; i <= 100; i++) targetLessons.push(String(i).padStart(3, '0'));
    }

    let allQuestions = [];
    targetLessons.forEach(num => {
      const pad = String(num).padStart(3, '0');
      const exFile = path.join(__dirname, 'data', 'exercises', `exercise-${pad}.json`);
      if (fs.existsSync(exFile)) {
        const data = JSON.parse(fs.readFileSync(exFile, 'utf8'));
        if (data.questions && Array.isArray(data.questions)) {
          allQuestions.push(...data.questions);
        }
      }
    });

    if (allQuestions.length === 0) {
      return res.status(404).json({ error: 'No questions found for the selected lessons' });
    }

    // Shuffle questions
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    const selectedQuestions = allQuestions.slice(0, Math.min(count, allQuestions.length));
    res.json({
      totalAvailable: allQuestions.length,
      count: selectedQuestions.length,
      questions: selectedQuestions
    });
  } catch (err) {
    console.error('Error generating review pool:', err);
    res.status(500).json({ error: 'Failed to generate review pool' });
  }
});

// Fallback to index.html for any unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`HocDrill server running at http://${HOST}:${PORT}`);
  });
}

module.exports = app;
