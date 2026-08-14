const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const exercisesDir = path.join(dataDir, 'exercises');

if (!fs.existsSync(exercisesDir)) {
  fs.mkdirSync(exercisesDir, { recursive: true });
}

// Generate 30 rich, crystal-clear questions for all 100 lessons
for (let i = 1; i <= 100; i++) {
  const pad = String(i).padStart(3, '0');
  const lessonFile = path.join(dataDir, `lesson-${pad}.json`);
  if (!fs.existsSync(lessonFile)) continue;

  const lesson = JSON.parse(fs.readFileSync(lessonFile, 'utf8'));
  const targets = lesson.drillingTargets || [];
  const lines = (lesson.openingDialogue && lesson.openingDialogue.lines) || [];
  const grammar = lesson.grammarRules || {};
  const points = grammar.points || [];

  const questions = [];
  let qIdx = 1;

  // Helper to format ID
  const makeId = () => `ex-${pad}-${String(qIdx++).padStart(2, '0')}`;

  // -------------------------------------------------------------
  // GROUP 1: MULTIPLE CHOICE (6 Questions)
  // -------------------------------------------------------------
  targets.forEach((t, idx) => {
    const d = t.drills || {};
    const fill = d.mode2_fill || {};
    questions.push({
      id: makeId(),
      type: "multiple_choice",
      promptVi: `[Trắc nghiệm] Chọn từ/cụm từ đúng để hoàn thành câu (${t.baseVi}):`,
      question: fill.sentenceWithBlank || `${t.baseEn.split(' ')[0]} _____ ${t.baseEn.split(' ').slice(2).join(' ')}`,
      options: fill.options && fill.options.length >= 4 ? fill.options : ["am", "is", "are", "be"],
      correctAnswer: fill.correctAnswer || t.baseEn.split(' ')[1] || "is",
      explanationVi: fill.explanationVi || `Giải thích: Cấu trúc câu chuẩn xác là "${t.baseEn}" (${t.baseVi}).`
    });
  });

  // Additional Multiple Choice from dialogue lines
  if (lines.length >= 2) {
    const line0 = lines[0];
    const line1 = lines[1];
    questions.push({
      id: makeId(),
      type: "multiple_choice",
      promptVi: `[Trắc nghiệm] Dịch câu sau sang tiếng Anh: "${line0.vi}"`,
      question: `Chọn bản dịch chuẩn xác cho câu: "${line0.vi}"`,
      options: [
        line0.en,
        line0.en.replace(/\b(is|are|am|was|were|do|does|did|will|have|has)\b/i, "be"),
        line1.en,
        "I want to go to the park now."
      ],
      correctAnswer: line0.en,
      explanationVi: `Câu đúng là "${line0.en}" (${line0.vi}).`
    });

    questions.push({
      id: makeId(),
      type: "multiple_choice",
      promptVi: `[Trắc nghiệm] Chọn câu trả lời hoặc cách diễn đạt phù hợp:`,
      question: `Trong ngữ cảnh giao tiếp: "${line0.en}", câu phản hồi tự nhiên là gì?`,
      options: [
        line1.en,
        "No, it is yesterday morning.",
        "Yes, I will eat apple.",
        "They are not at the library."
      ],
      correctAnswer: line1.en,
      explanationVi: `Phản hồi phù hợp: "${line1.en}" (${line1.vi}).`
    });
  }

  // -------------------------------------------------------------
  // GROUP 2: FILL IN THE BLANK WITH EXPLICIT CLARITY (5 Questions)
  // -------------------------------------------------------------
  targets.forEach((t, idx) => {
    const d = t.drills || {};
    const fill = d.mode2_fill || {};
    const words = t.baseEn.split(' ');
    const verb = words[1] || "is";
    const isNegative = t.baseEn.toLowerCase().includes("not") || t.baseEn.toLowerCase().includes("n't");
    const formType = isNegative ? "(Dạng phủ định)" : "(Dạng khẳng định)";

    questions.push({
      id: makeId(),
      type: "fill_blank",
      promptVi: `[Điền từ - ${formType}] Điền dạng đúng của động từ vào ô trống (${t.baseVi}):`,
      question: fill.sentenceWithBlank || t.baseEn.replace(verb, "_____"),
      correctAnswer: fill.correctAnswer || verb,
      options: fill.options && fill.options.length >= 4 ? fill.options : [verb, "is", "are", "am"],
      explanationVi: `Đáp án chính xác: "${fill.correctAnswer || verb}". ${t.baseVi}.`
    });
  });

  // Additional negative transformation fill blank
  const t0 = targets[0] || { baseEn: "I am happy.", baseVi: "Tôi vui vẻ." };
  questions.push({
    id: makeId(),
    type: "fill_blank",
    promptVi: `[Điền từ - Dạng PHỦ ĐỊNH] Hoàn thành câu phủ định sau:`,
    question: t0.drills && t0.drills.mode4_transform ? t0.drills.mode4_transform.prompt : `Biến đổi câu sau sang thể phủ định: "${t0.baseEn}"`,
    correctAnswer: (t0.drills && t0.drills.mode4_transform && t0.drills.mode4_transform.targetPattern) || t0.baseEn.replace(/\b(am|is|are|was|were)\b/i, "$1 not"),
    options: [
      (t0.drills && t0.drills.mode4_transform && t0.drills.mode4_transform.targetPattern) || t0.baseEn.replace(/\b(am|is|are|was|were)\b/i, "$1 not"),
      t0.baseEn,
      "Not " + t0.baseEn,
      t0.baseEn + " no"
    ],
    explanationVi: `Dạng phủ định chuẩn: ${(t0.drills && t0.drills.mode4_transform && t0.drills.mode4_transform.targetPattern) || "Thêm 'not' sau động từ chính."}`
  });

  // -------------------------------------------------------------
  // GROUP 3: SENTENCE SCRAMBLE (5 Questions)
  // -------------------------------------------------------------
  targets.forEach((t) => {
    const d = t.drills || {};
    const scramble = d.mode3_scramble || {};
    const wordList = scramble.words || t.baseEn.split(' ');
    // Shuffle words
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);

    questions.push({
      id: makeId(),
      type: "sentence_scramble",
      promptVi: `[Sắp xếp câu] Xếp các khối từ thành câu hoàn chỉnh mang nghĩa: "${t.baseVi}"`,
      words: shuffled,
      correctSentence: scramble.correctSentence || t.baseEn,
      hintVi: t.baseVi,
      explanationVi: `Câu hoàn chỉnh: "${scramble.correctSentence || t.baseEn}" (${t.baseVi}).`
    });
  });

  if (lines.length >= 3) {
    const l2 = lines[2];
    const l2Words = l2.en.replace(/[.,!?]/g, '').split(' ');
    questions.push({
      id: makeId(),
      type: "sentence_scramble",
      promptVi: `[Sắp xếp câu] Xếp các từ thành câu hội thoại: "${l2.vi}"`,
      words: [...l2Words].sort(() => Math.random() - 0.5),
      correctSentence: l2.en,
      hintVi: l2.vi,
      explanationVi: `Câu đúng: "${l2.en}" (${l2.vi}).`
    });
  }

  // -------------------------------------------------------------
  // GROUP 4: ERROR IDENTIFICATION / CHOOSE CORRECT (4 Questions)
  // -------------------------------------------------------------
  targets.forEach((t, idx) => {
    const cTarget = t.baseEn;
    const err1 = cTarget.replace(/\b(is|are|am|was|were)\b/i, "be");
    const err2 = cTarget.replace(/\b(is|are|am|was|were)\b/i, "are not is");
    const err3 = cTarget.split(' ').reverse().join(' ');

    const opts = Array.from(new Set([cTarget, err1, err2, err3]));
    while (opts.length < 4) opts.push(cTarget + " (sai)");

    questions.push({
      id: makeId(),
      type: "find_error",
      promptVi: `[Tìm lỗi sai & Chọn câu đúng] Câu nào dưới đây có cấu trúc ngữ pháp HOÀN TOÀN ĐÚNG?`,
      question: `Chủ điểm "${lesson.title}": Chọn câu CHÍNH XÁC:`,
      options: opts,
      correctAnswer: cTarget,
      explanationVi: `Câu chuẩn xác là: "${cTarget}" (${t.baseVi}).`
    });
  });

  // -------------------------------------------------------------
  // GROUP 5: LISTENING REFLEX (4 Questions)
  // -------------------------------------------------------------
  const listenLines = lines.length >= 4 ? lines.slice(0, 4) : lines;
  listenLines.forEach((l, idx) => {
    const wrong1 = (lines[(idx + 1) % lines.length] && lines[(idx + 1) % lines.length].vi) || "Chúng tôi đang ở nhà.";
    const wrong2 = (lines[(idx + 2) % lines.length] && lines[(idx + 2) % lines.length].vi) || "Họ không phải là sinh viên.";
    const wrong3 = "Ngày mai trời sẽ mưa to.";

    const opts = Array.from(new Set([l.vi, wrong1, wrong2, wrong3]));
    while (opts.length < 4) opts.push("Phương án sai " + opts.length);

    questions.push({
      id: makeId(),
      type: "listening_reflex",
      promptVi: `[Nghe phản xạ] Nghe câu phát âm tiếng Anh và chọn bản dịch tiếng Việt đúng nhất:`,
      audioPrompt: l.en,
      question: `Nhấn nút '🔊 Nghe audio' để nghe câu thoại và chọn nghĩa đúng:`,
      options: opts,
      correctAnswer: l.vi,
      explanationVi: `Câu nghe được: "${l.en}" có nghĩa là: "${l.vi}".`
    });
  });

  // -------------------------------------------------------------
  // GROUP 6: SPEAKING PRACTICE VIA MICROPHONE (4 Questions)
  // -------------------------------------------------------------
  targets.forEach((t) => {
    questions.push({
      id: makeId(),
      type: "speaking_practice",
      promptVi: `[Luyện nói qua Micro] Nhấn nút '🎙️ Bắt đầu nói' và đọc to, rõ ràng câu tiếng Anh sau:`,
      targetSentence: t.baseEn,
      hintVi: t.baseVi,
      explanationVi: `Câu mục tiêu: "${t.baseEn}" (${t.baseVi}). Luyện phát âm chuẩn xác từng âm tiết và ngữ điệu tự nhiên.`
    });
  });

  // -------------------------------------------------------------
  // GROUP 7: READING COMPREHENSION (2 Questions)
  // -------------------------------------------------------------
  const passageText1 = lines.slice(0, 4).map(l => `${l.speaker} (${l.gender === 'male' ? 'Nam' : 'Nữ'}): "${l.en}"`).join('\n');
  const passageText2 = lines.slice(4, 8).map(l => `${l.speaker} (${l.gender === 'male' ? 'Nam' : 'Nữ'}): "${l.en}"`).join('\n');

  questions.push({
    id: makeId(),
    type: "reading_comprehension",
    promptVi: `[Đọc hiểu đoạn văn 1] Đọc đoạn hội thoại mở đầu sau và trả lời câu hỏi:`,
    passage: passageText1 || (lines.map(l => `${l.speaker}: "${l.en}"`).join('\n')),
    question: `Câu hỏi: Trong đoạn hội thoại trên, các nhân vật đang thảo luận về chủ đề gì?`,
    options: [
      lesson.title.replace(/^Bài \d+:\s*/, ''),
      "Kế hoạch đi nghỉ dưỡng cuối tuần ở bãi biển",
      "Mua sắm quần áo và đồ dùng thể thao",
      "Cách làm món ăn truyền thống gia đình"
    ],
    correctAnswer: lesson.title.replace(/^Bài \d+:\s*/, ''),
    explanationVi: `Đoạn hội thoại mở đầu được thiết kế để minh họa trực tiếp cho chủ điểm ngữ pháp: "${lesson.title}".`
  });

  if (passageText2 && passageText2.trim() !== '') {
    questions.push({
      id: makeId(),
      type: "reading_comprehension",
      promptVi: `[Đọc hiểu đoạn văn 2] Đọc phần tiếp theo của đoạn hội thoại và chọn nhận định đúng:`,
      passage: passageText2,
      question: `Nhận định nào sau đây là ĐÚNG với nội dung đoạn hội thoại trên?`,
      options: [
        `Các câu hội thoại sử dụng đúng cấu trúc ngữ pháp "${lesson.title}".`,
        "Các nhân vật không hiểu ý nhau và từ chối nói chuyện.",
        "Đoạn hội thoại nói về việc chuyển nhà sang thành phố khác.",
        "Cả hai nhân vật đều đang ở sân bay chuẩn bị lên máy bay."
      ],
      correctAnswer: `Các câu hội thoại sử dụng đúng cấu trúc ngữ pháp "${lesson.title}".`,
      explanationVi: `Đoạn hội thoại thứ hai tiếp tục củng cố và ứng dụng các quy tắc ngữ pháp của "${lesson.title}".`
    });
  }

  // Final check: ensure at least 30 questions
  while (questions.length < 30) {
    const randomTarget = targets[questions.length % targets.length] || targets[0];
    questions.push({
      id: makeId(),
      type: "multiple_choice",
      promptVi: `[Ôn tập tổng hợp] Chọn câu tiếng Anh đúng nghĩa với: "${randomTarget.baseVi}":`,
      question: `Dịch câu: "${randomTarget.baseVi}"`,
      options: [
        randomTarget.baseEn,
        randomTarget.baseEn.replace(/\b(is|are|am|was|were)\b/i, "be"),
        "We are studying English.",
        "They do not know this."
      ],
      correctAnswer: randomTarget.baseEn,
      explanationVi: `Bản dịch chuẩn xác là: "${randomTarget.baseEn}" (${randomTarget.baseVi}).`
    });
  }

  const exerciseData = {
    lessonId: lesson.lessonId,
    lessonNumber: i,
    title: `Bài tập Ôn luyện: ${lesson.title}`,
    totalQuestions: questions.length,
    questions: questions
  };

  const outFile = path.join(exercisesDir, `exercise-${pad}.json`);
  fs.writeFileSync(outFile, JSON.stringify(exerciseData, null, 2), 'utf8');
}

console.log('Successfully generated 30+ rich, crystal-clear questions for all 100 lessons in /data/exercises!');
