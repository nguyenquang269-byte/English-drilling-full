const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const exercisesDir = path.join(dataDir, 'exercises');

if (!fs.existsSync(exercisesDir)) {
  fs.mkdirSync(exercisesDir, { recursive: true });
}

// Generate rich, varied exercises for all 100 lessons
for (let i = 1; i <= 100; i++) {
  const pad = String(i).padStart(3, '0');
  const lessonFile = path.join(dataDir, `lesson-${pad}.json`);
  if (!fs.existsSync(lessonFile)) continue;

  const lesson = JSON.parse(fs.readFileSync(lessonFile, 'utf8'));
  const targets = lesson.drillingTargets || [];
  const lines = (lesson.openingDialogue && lesson.openingDialogue.lines) || [];
  const grammar = lesson.grammarRules || {};

  const t0 = targets[0] || { baseEn: "I am ready.", baseVi: "Tôi đã sẵn sàng." };
  const t1 = targets[1] || t0;
  const t2 = targets[2] || t0;
  const t3 = targets[3] || t1;

  const d0 = t0.drills || {};
  const d1 = t1.drills || {};
  const d2 = t2.drills || {};
  const d3 = t3.drills || {};

  // Build reading passage from opening dialogue
  const passageSentences = lines.slice(0, 4);
  const passage = passageSentences.map(l => `${l.speaker}: "${l.en}"`).join('\n');
  const firstSpeaker = (lines[0] && lines[0].speaker) || "Speaker A";
  const secondSpeaker = (lines[1] && lines[1].speaker) || "Speaker B";

  // 1. Multiple Choice (Fill blank options)
  const q1 = {
    id: `ex-${pad}-01`,
    type: "multiple_choice",
    promptVi: "Chọn đáp án đúng nhất hoàn thành câu:",
    question: (d1.mode2_fill && d1.mode2_fill.sentenceWithBlank) || (d0.mode2_fill && d0.mode2_fill.sentenceWithBlank) || t1.baseEn,
    options: (d1.mode2_fill && d1.mode2_fill.options) || ["is", "are", "am", "be"],
    correctAnswer: (d1.mode2_fill && d1.mode2_fill.correctAnswer) || "is",
    explanationVi: (d1.mode2_fill && d1.mode2_fill.explanationVi) || `Quy tắc: ${grammar.summaryVi || "Áp dụng ngữ pháp chuẩn."}`
  };

  // 2. Fill in the blank (Input/Chips)
  const q2 = {
    id: `ex-${pad}-02`,
    type: "fill_blank",
    promptVi: "Điền từ hoặc dạng đúng của động từ vào chỗ trống:",
    question: (d0.mode2_fill && d0.mode2_fill.sentenceWithBlank) || t0.baseEn,
    correctAnswer: (d0.mode2_fill && d0.mode2_fill.correctAnswer) || "is",
    options: (d0.mode2_fill && d0.mode2_fill.options) || ["is", "are", "was", "were"],
    explanationVi: (d0.mode2_fill && d0.mode2_fill.explanationVi) || `Giải thích ngữ pháp: ${t0.baseVi}`
  };

  // 3. Sentence Scramble
  const q3 = {
    id: `ex-${pad}-03`,
    type: "sentence_scramble",
    promptVi: "Sắp xếp các khối từ sau thành câu hoàn chỉnh:",
    words: (d2.mode3_scramble && d2.mode3_scramble.words) || (d0.mode3_scramble && d0.mode3_scramble.words) || t2.baseEn.split(' '),
    correctSentence: (d2.mode3_scramble && d2.mode3_scramble.correctSentence) || t2.baseEn,
    hintVi: t2.baseVi,
    explanationVi: `Câu hoàn chỉnh: "${t2.baseEn}" (${t2.baseVi}).`
  };

  // 4. Error Identification
  const correctTarget = t3.baseEn;
  const incorrect1 = correctTarget.replace(/\b(is|are|am|was|were|have|has|had|will|would|do|does|did)\b/i, 'be');
  const incorrect2 = correctTarget.replace(/\b(to|with|for|at|in|on|by|about|of)\b/i, 'with');
  const incorrect3 = correctTarget.split(' ').slice(1).join(' ') + ' ' + correctTarget.split(' ')[0];
  
  const options4 = [
    correctTarget,
    incorrect1 !== correctTarget ? incorrect1 : correctTarget + " not",
    incorrect2 !== correctTarget ? incorrect2 : "Is " + correctTarget,
    incorrect3 !== correctTarget ? incorrect3 : correctTarget.toLowerCase()
  ];
  // Ensure uniqueness
  const uniqueOptions4 = Array.from(new Set(options4));
  while (uniqueOptions4.length < 4) {
    uniqueOptions4.push(correctTarget + " (incorrect variation " + uniqueOptions4.length + ")");
  }

  const q4 = {
    id: `ex-${pad}-04`,
    type: "find_error",
    promptVi: "Chọn câu có cấu trúc ngữ pháp chuẩn xác nhất trong các câu sau:",
    question: `Dựa vào chủ điểm ngữ pháp "${lesson.title}", câu nào sau đây là hoàn toàn CHÍNH XÁC?`,
    options: uniqueOptions4,
    correctAnswer: correctTarget,
    explanationVi: `Cấu trúc chuẩn xác là: "${correctTarget}" (${t3.baseVi}).`
  };

  // 5. Listening Reflex
  const q5 = {
    id: `ex-${pad}-05`,
    type: "listening_reflex",
    promptVi: "Nghe câu tiếng Anh và chọn bản dịch tiếng Việt chuẩn xác:",
    audioPrompt: (lines[0] && lines[0].en) || t0.baseEn,
    question: "Nghe câu phát âm tiếng Anh và chọn nghĩa đúng:",
    options: [
      (lines[0] && lines[0].vi) || t0.baseVi,
      (lines[1] && lines[1].vi) || t1.baseVi,
      (lines[2] && lines[2].vi) || t2.baseVi,
      "Hôm nay chúng tôi đi mua sắm tại trung tâm thương mại."
    ],
    correctAnswer: (lines[0] && lines[0].vi) || t0.baseVi,
    explanationVi: `Câu nghe được: "${(lines[0] && lines[0].en) || t0.baseEn}" nghĩa là: "${(lines[0] && lines[0].vi) || t0.baseVi}".`
  };

  // 6. Speaking Practice (Microphone)
  const q6 = {
    id: `ex-${pad}-06`,
    type: "speaking_practice",
    promptVi: "Luyện nói qua Micro: Hãy nhấn nút 'Nói ngay' và phát âm chuẩn xác câu sau:",
    targetSentence: t0.baseEn,
    hintVi: t0.baseVi,
    explanationVi: `Mẫu câu chuẩn: "${t0.baseEn}" (${t0.baseVi}). Hãy phát âm rõ ràng từng từ và giữ ngữ điệu tự nhiên.`
  };

  // 7. Reading Comprehension (Passage & Question)
  const cleanTitle = lesson.title.replace(/^Bài \d+:\s*/, '');
  const q7 = {
    id: `ex-${pad}-07`,
    type: "reading_comprehension",
    promptVi: "Đọc đoạn hội thoại ngắn sau và trả lời câu hỏi đọc hiểu:",
    passage: passage,
    question: `Dựa vào ngữ cảnh đoạn hội thoại trên, ${firstSpeaker} và ${secondSpeaker} đang trao đổi về nội dung trọng tâm nào?`,
    options: [
      cleanTitle,
      "Kế hoạch mua sắm và nấu ăn cho bữa tối gia đình",
      "Lịch trình đi du lịch nghỉ dưỡng mùa hè",
      "Dự báo thời tiết và nhiệt độ ngày mai"
    ],
    correctAnswer: cleanTitle,
    explanationVi: `Đoạn hội thoại mở đầu được thiết kế để minh họa và ứng dụng trực tiếp chủ điểm: "${lesson.title}".`
  };

  // 8. Translation & Grammar Reflex
  const opt8_1 = t2.baseEn;
  const opt8_2 = t2.baseEn.replace(/\b(is|are|am|was|were|have|has|had|will|would|do|does|did|can|could|should|must)\b/i, 'is');
  const opt8_3 = t2.baseEn.replace(/\b(to|for|with|in|on|at|by|from|about)\b/i, 'at');
  const opt8_4 = t1.baseEn;

  const rawOpts8 = [opt8_1, opt8_2, opt8_3, opt8_4];
  const uniqueOpts8 = Array.from(new Set(rawOpts8));
  while (uniqueOpts8.length < 4) {
    uniqueOpts8.push("Incorrect grammatical form " + uniqueOpts8.length);
  }

  const q8 = {
    id: `ex-${pad}-08`,
    type: "multiple_choice",
    promptVi: "Phản xạ dịch & Ngữ pháp: Chọn câu tiếng Anh diễn đạt đúng nghĩa:",
    question: `Dịch câu sang tiếng Anh: "${t2.baseVi}"`,
    options: uniqueOpts8,
    correctAnswer: opt8_1,
    explanationVi: `Bản dịch chuẩn xác và đúng ngữ pháp là: "${opt8_1}" (${t2.baseVi}).`
  };

  const exerciseData = {
    lessonId: lesson.lessonId,
    lessonNumber: i,
    title: `Bài tập Ôn luyện: ${lesson.title}`,
    questions: [q1, q2, q3, q4, q5, q6, q7, q8]
  };

  const outFile = path.join(exercisesDir, `exercise-${pad}.json`);
  fs.writeFileSync(outFile, JSON.stringify(exerciseData, null, 2), 'utf8');
}

console.log('Successfully regenerated all 100 comprehensive exercise files with 7 diverse question types.');
