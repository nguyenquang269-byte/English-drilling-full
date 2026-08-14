// ==================================================
// HocDrill — Ứng dụng Luyện Nói & Khoan Sâu Tiếng Anh (To Be)
// ==================================================

const MAX_TIME_SECONDS = 30 * 60;
let currentSpeechRate = 0.65; // Default slower speech rate as requested (0.65x)

let lessonData = null;
let currentTargetIndex = 0;
let currentMode = 1; // 1 to 5 drilling modes
let dialoguePlaybackIndex = -1;
let isDialoguePlaying = false;

let timeLeft = MAX_TIME_SECONDS;
let timerInterval = null;
let recognition = null;
let mediaStream = null;
let audioContext = null;
let analyser = null;
let isRecording = false;
let currentAudioElement = null;

let recognitionHistory = [];
let availableVoices = [];

// Scramble state
let scrambleSelectedWords = [];

// DOM Element Selectors
const el = {
  lessonSelector: document.getElementById("lessonSelector"),
  btnLoadLesson: document.getElementById("btnLoadLesson"),
  lessonTitle: document.getElementById("lessonTitle"),
  timeLeft: document.getElementById("timeLeft"),
  progressFill: document.getElementById("progressFill"),
  audioStatusBadge: document.getElementById("audioStatusBadge"),

  // Steps
  stepSelect: document.getElementById("stepSelect"),
  stepDialogue: document.getElementById("stepDialogue"),
  stepDrill: document.getElementById("stepDrill"),
  stepDone: document.getElementById("stepDone"),

  // Dialogue Step
  dialogueSectionTitle: document.getElementById("dialogueSectionTitle"),
  btnPlayFullDialogue: document.getElementById("btnPlayFullDialogue"),
  dialogueList: document.getElementById("dialogueList"),
  grammarBox: document.getElementById("grammarBox"),
  grammarContent: document.getElementById("grammarContent"),
  btnReadGrammar: document.getElementById("btnReadGrammar"),
  btnGoToDrills: document.getElementById("btnGoToDrills"),

  // Drill Step
  targetCounter: document.getElementById("targetCounter"),
  targetEnText: document.getElementById("targetEnText"),
  targetViText: document.getElementById("targetViText"),
  modeTitle: document.getElementById("modeTitle"),
  modePrompt: document.getElementById("modePrompt"),

  // Drill Containers
  containerMode1: document.getElementById("containerMode1"),
  containerMode2: document.getElementById("containerMode2"),
  containerMode3: document.getElementById("containerMode3"),
  containerMode4: document.getElementById("containerMode4"),
  containerMode5: document.getElementById("containerMode5"),

  // Mode 1 Elements
  btnAudioRepeat: document.getElementById("btnAudioRepeat"),
  btnAudioRepeatVi: document.getElementById("btnAudioRepeatVi"),
  btnMicRepeat: document.getElementById("btnMicRepeat"),
  repeatScore: document.getElementById("repeatScore"),
  waveCanvasRepeat: document.getElementById("waveCanvasRepeat"),
  liveSpeechStatus: document.getElementById("liveSpeechStatus"),
  repeatInputFallback: document.getElementById("repeatInputFallback"),
  btnCheckRepeatText: document.getElementById("btnCheckRepeatText"),

  // Mode 2 Elements
  fillSentenceDisplay: document.getElementById("fillSentenceDisplay"),
  fillOptionsGrid: document.getElementById("fillOptionsGrid"),

  // Mode 3 Elements
  scrambleTarget: document.getElementById("scrambleTarget"),
  scramblePool: document.getElementById("scramblePool"),
  btnResetScramble: document.getElementById("btnResetScramble"),
  btnCheckScramble: document.getElementById("btnCheckScramble"),

  // Mode 4 Elements
  transformInstruction: document.getElementById("transformInstruction"),
  transformInput: document.getElementById("transformInput"),
  btnCheckTransform: document.getElementById("btnCheckTransform"),
  btnMicTransform: document.getElementById("btnMicTransform"),

  // Mode 5 Elements
  contextInstruction: document.getElementById("contextInstruction"),
  contextInput: document.getElementById("contextInput"),
  btnCheckContext: document.getElementById("btnCheckContext"),
  btnMicContext: document.getElementById("btnMicContext"),

  // Feedback & Navigation
  feedbackMsg: document.getElementById("feedbackMsg"),
  btnPrevDrillMode: document.getElementById("btnPrevDrillMode"),
  btnNextDrillMode: document.getElementById("btnNextDrillMode"),

  // History & Summary
  recognitionHistory: document.getElementById("recognitionHistory"),
  finalScoreText: document.getElementById("finalScoreText"),
  btnNextLesson: document.getElementById("btnNextLesson")
};

// Lesson List
const LESSON_LIST = [
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
];

// ========== INITIALIZATION ==========
function init() {
  initVoices();
  populateLessonSelector();
  initSpeechRecognition();
  bindEvents();
  initSpeedControls();
  showStep("select");
  drawWavePlaceholder();
}

function initVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const loadVoices = () => {
      availableVoices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }
}

function populateLessonSelector() {
  el.lessonSelector.innerHTML = '<option value="">-- Vui lòng chọn bài học --</option>';
  LESSON_LIST.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.file;
    opt.textContent = item.name;
    el.lessonSelector.appendChild(opt);
  });
}

function initSpeedControls() {
  const speedBtns = document.querySelectorAll(".speed-btn");
  speedBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      speedBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSpeechRate = parseFloat(btn.dataset.speed) || 0.65;
    });
  });
}

// ========== STOP ALL AUDIO & TTS ENGINE ==========
function stopAllAudio(resetDialogueFlag = true) {
  if (resetDialogueFlag) {
    isDialoguePlaying = false;
    if (el.btnPlayFullDialogue) {
      el.btnPlayFullDialogue.textContent = "▶ Nghe toàn bộ hội thoại (2 giọng Nam & Nữ)";
    }
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0;
    currentAudioElement = null;
  }
  setAudioStatus(false);
}

function setAudioStatus(playing, label = "Đang phát...") {
  if (playing) {
    el.audioStatusBadge.textContent = `🔊 ${label}`;
    el.audioStatusBadge.style.display = "inline-block";
  } else {
    el.audioStatusBadge.style.display = "none";
  }
}

// Find distinct English voices for Male vs Female speakers
function getEnglishVoiceForGender(gender = "female") {
  if (!availableVoices || availableVoices.length === 0) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      availableVoices = window.speechSynthesis.getVoices();
    }
  }
  const enVoices = (availableVoices || []).filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
  if (enVoices.length === 0) return null;

  const isMale = (gender === "male");

  const maleKeywords = ["male", "david", "mark", "guy", "george", "alex", "daniel", "james", "fred", "aaron", "arthur", "richard", "tom", "michael", "oliver", "en-us-x-sfg#male"];
  const femaleKeywords = ["female", "zira", "samantha", "victoria", "karen", "jenny", "susan", "catherine", "lisa", "mary", "hazel", "ava", "google us english", "en-us-x-sfg#female"];

  if (isMale) {
    const maleVoice = enVoices.find(v => {
      const name = (v.name || "").toLowerCase();
      return maleKeywords.some(kw => name.includes(kw));
    });
    if (maleVoice) return maleVoice;
  } else {
    const femaleVoice = enVoices.find(v => {
      const name = (v.name || "").toLowerCase();
      return femaleKeywords.some(kw => name.includes(kw));
    });
    if (femaleVoice) return femaleVoice;
  }

  if (enVoices.length > 1) {
    return isMale ? enVoices[1] : enVoices[0];
  }

  return enVoices[0];
}

// Speak English text with distinct male / female voice configuration & fallback
function speakEn(text, isAutoDialogue = false, gender = "female") {
  return new Promise(resolve => {
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    if (!cleanText) return resolve();

    stopAllAudio(!isAutoDialogue);
    const isMale = (gender === "male");
    const statusText = isMale ? "Tiếng Anh (Nam 👨)" : "Tiếng Anh (Nữ 👩)";
    setAudioStatus(true, statusText);

    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        setAudioStatus(false);
        resolve();
      }
    };

    const safetyTimeout = setTimeout(() => {
      finish();
    }, Math.max(3500, cleanText.length * 120));

    // Try Web Speech API first with distinct voice and pitch
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(cleanText);
        utt.lang = "en-US";
        utt.rate = currentSpeechRate;

        // Distinct pitch & acoustic settings for Male vs Female
        utt.pitch = isMale ? 0.82 : 1.18;

        const voice = getEnglishVoiceForGender(gender);
        if (voice) {
          utt.voice = voice;
        }

        utt.onend = () => {
          clearTimeout(safetyTimeout);
          finish();
        };
        utt.onerror = () => {
          clearTimeout(safetyTimeout);
          speakViaProxy(cleanText, "en").then(finish);
        };

        window.speechSynthesis.speak(utt);
      } catch (e) {
        clearTimeout(safetyTimeout);
        speakViaProxy(cleanText, "en").then(finish);
      }
    } else {
      clearTimeout(safetyTimeout);
      speakViaProxy(cleanText, "en").then(finish);
    }
  });
}

// Speak Vietnamese text with Fallback to Server Proxy Endpoint
function speakVi(text, isAutoDialogue = false) {
  return new Promise(resolve => {
    const cleanText = text.replace(/<[^>]*>/g, "").replace(/[-*_]/g, " ").trim();
    if (!cleanText) return resolve();

    stopAllAudio(!isAutoDialogue);
    setAudioStatus(true, "Tiếng Việt");

    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        setAudioStatus(false);
        resolve();
      }
    };

    const safetyTimeout = setTimeout(() => {
      finish();
    }, Math.max(3500, cleanText.length * 120));

    if (availableVoices.length === 0 && "speechSynthesis" in window) {
      availableVoices = window.speechSynthesis.getVoices();
    }

    const viVoice = availableVoices.find(v => v.lang && (v.lang.startsWith("vi") || v.lang.includes("vi-VN")));

    if ("speechSynthesis" in window && viVoice) {
      try {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(cleanText);
        utt.lang = "vi-VN";
        utt.voice = viVoice;
        utt.rate = currentSpeechRate;

        utt.onend = () => {
          clearTimeout(safetyTimeout);
          finish();
        };
        utt.onerror = () => {
          clearTimeout(safetyTimeout);
          speakViaProxy(cleanText, "vi").then(finish);
        };

        window.speechSynthesis.speak(utt);
      } catch (e) {
        clearTimeout(safetyTimeout);
        speakViaProxy(cleanText, "vi").then(finish);
      }
    } else {
      clearTimeout(safetyTimeout);
      speakViaProxy(cleanText, "vi").then(finish);
    }
  });
}

function speakViaProxy(text, lang) {
  return new Promise(resolve => {
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = Math.max(0.5, Math.min(1.5, currentSpeechRate));
      currentAudioElement = audio;

      audio.onended = () => {
        currentAudioElement = null;
        resolve();
      };
      audio.onerror = () => {
        currentAudioElement = null;
        resolve();
      };

      audio.play().catch(() => resolve());
    } catch (e) {
      resolve();
    }
  });
}

// ========== LOAD LESSON DATA ==========
async function loadSelectedLesson() {
  const fileName = el.lessonSelector.value;
  if (!fileName) {
    alert("Vui lòng chọn bài học!");
    return;
  }

  stopAllAudio();

  try {
    const res = await fetch(`./data/${fileName}`);
    if (!res.ok) throw new Error("File not found");
    lessonData = await res.json();
  } catch (err) {
    try {
      const resFallback = await fetch(`/data/${fileName}`);
      if (!resFallback.ok) throw new Error("Fallback failed");
      lessonData = await resFallback.json();
    } catch (fallbackErr) {
      return alert(`❌ Lỗi: Không tải được file bài học data/${fileName}`);
    }
  }

  el.lessonTitle.textContent = lessonData.title || "Bài học To Be";
  currentTargetIndex = 0;
  currentMode = 1;
  recognitionHistory = [];
  renderRecognitionHistory();

  timeLeft = MAX_TIME_SECONDS;
  clearInterval(timerInterval);
  startTimer();

  renderDialogueStep();
  showStep("dialogue");
}

// ========== TIMER & PROGRESS ==========
function startTimer() {
  updateTimeDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("⏰ Hết thời gian bài học!");
      return;
    }
    updateTimeDisplay();
  }, 1000);
}

function updateTimeDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = String(timeLeft % 60).padStart(2, "0");
  el.timeLeft.textContent = `${m}:${s}`;
}

function updateProgress() {
  if (!lessonData || !lessonData.drillingTargets) return;
  const totalSteps = lessonData.drillingTargets.length * 5;
  const currentCompleted = currentTargetIndex * 5 + (currentMode - 1);
  const percent = Math.min(100, Math.round((currentCompleted / totalSteps) * 100));
  el.progressFill.style.width = `${percent}%`;
}

// ========== STEP 1: OPENING DIALOGUE & GRAMMAR ==========
function renderDialogueStep() {
  if (!lessonData || !lessonData.openingDialogue) return;

  const dialogue = lessonData.openingDialogue;
  el.dialogueSectionTitle.textContent = dialogue.title || "🎙️ Hội thoại mở đầu (~30s)";

  // Render dialogue lines with explicit Male / Female badges and distinct voices
  el.dialogueList.innerHTML = dialogue.lines.map((line, idx) => {
    const isMale = (line.gender === "male" || (!line.gender && idx % 2 === 0));
    const genderTag = isMale ? "male" : "female";
    const genderLabel = isMale ? "👨 Nam" : "👩 Nữ";
    const badgeClass = isMale ? "speaker-badge speaker-male" : "speaker-badge speaker-female";
    const cardClass = isMale ? "dialogue-item speaker-male-card" : "dialogue-item speaker-female-card";

    return `
      <div class="${cardClass}" id="dialogue-item-${idx}">
        <span class="${badgeClass}">${genderLabel}: ${line.speaker}</span>
        <div class="dialogue-en">${line.en}</div>
        <div class="dialogue-vi">${line.vi}</div>
        <div class="dialogue-actions">
          <button class="btn-outline-en" onclick="speakEn('${escapeJs(line.en)}', false, '${genderTag}')">
            🔊 Nghe giọng ${isMale ? "Nam 👨" : "Nữ 👩"}
          </button>
          <button class="btn-outline-vi" onclick="speakVi('${escapeJs(line.vi)}')">🔊 Dịch Tiếng Việt</button>
        </div>
      </div>
    `;
  }).join("");

  // Render Grammar Rules
  if (lessonData.grammarRules) {
    const rules = lessonData.grammarRules;
    let html = `<p style="margin-bottom:8px;">${rules.summaryVi}</p><div class="grammar-grid">`;
    rules.points.forEach(pt => {
      html += `
        <div class="grammar-item">
          <strong>${pt.subject}</strong> → <span style="color:var(--primary); font-weight:700;">${pt.toBe}</span><br/>
          <span style="font-size:13px; color:#475569;">${pt.example}</span>
        </div>
      `;
    });
    html += `</div><div style="margin-top:10px; font-size:13px; color:#1e3a8a;"><strong>Cấu trúc:</strong> ${rules.forms.join(" | ")}</div>`;
    el.grammarContent.innerHTML = html;
  }
}

async function playFullDialogue() {
  if (!lessonData || !lessonData.openingDialogue) return;
  const lines = lessonData.openingDialogue.lines;

  if (isDialoguePlaying) {
    stopAllAudio(true);
    return;
  }

  isDialoguePlaying = true;
  if (el.btnPlayFullDialogue) {
    el.btnPlayFullDialogue.textContent = "⏹️ Dừng phát";
  }

  for (let i = 0; i < lines.length; i++) {
    if (!isDialoguePlaying) break;

    // Highlight line
    document.querySelectorAll(".dialogue-item").forEach(item => item.classList.remove("playing"));
    const activeItem = document.getElementById(`dialogue-item-${i}`);
    if (activeItem) {
      activeItem.classList.add("playing");
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    const lineGender = lines[i].gender || (i % 2 === 0 ? "male" : "female");
    // Speak English line sequentially with respective male or female voice
    await speakEn(lines[i].en, true, lineGender);
    if (!isDialoguePlaying) break;

    // Natural conversational pause between turns
    await new Promise(r => setTimeout(r, 650));
  }

  document.querySelectorAll(".dialogue-item").forEach(item => item.classList.remove("playing"));
  isDialoguePlaying = false;
  if (el.btnPlayFullDialogue) {
    el.btnPlayFullDialogue.textContent = "▶ Nghe toàn bộ hội thoại (2 giọng Nam & Nữ)";
  }
}

// Helper to escape single quotes in inline onclick
function escapeJs(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ========== STEP 2: 5-LEVEL DRILLING LOGIC ==========
function renderCurrentDrill() {
  hideFeedback();
  stopAllAudio();
  updateProgress();

  const targets = lessonData.drillingTargets;
  if (!targets || currentTargetIndex >= targets.length) {
    showStep("done");
    renderSummary();
    return;
  }

  const currentTarget = targets[currentTargetIndex];
  el.targetCounter.textContent = `${currentTargetIndex + 1}/${targets.length}`;
  el.targetEnText.textContent = currentTarget.baseEn;
  el.targetViText.textContent = currentTarget.baseVi;

  // Update Stepper Pills
  [1, 2, 3, 4, 5].forEach(m => {
    const pill = document.getElementById(`pill-mode${m}`);
    if (pill) {
      pill.classList.remove("active", "completed");
      if (m === currentMode) pill.classList.add("active");
      else if (m < currentMode) pill.classList.add("completed");
    }
  });

  // Hide all mode containers
  [el.containerMode1, el.containerMode2, el.containerMode3, el.containerMode4, el.containerMode5].forEach(c => c.style.display = "none");

  el.btnNextDrillMode.style.display = "none";
  el.btnPrevDrillMode.style.display = (currentTargetIndex === 0 && currentMode === 1) ? "none" : "inline-flex";

  const drills = currentTarget.drills;

  // Mode Specific Renders
  if (currentMode === 1) {
    renderMode1(drills.mode1_repeat);
  } else if (currentMode === 2) {
    renderMode2(drills.mode2_fill);
  } else if (currentMode === 3) {
    renderMode3(drills.mode3_scramble);
  } else if (currentMode === 4) {
    renderMode4(drills.mode4_transform);
  } else if (currentMode === 5) {
    renderMode5(drills.mode5_context);
  }
}

// --- Mode 1: Nghe & Nhắc lại ---
function renderMode1(data) {
  el.modeTitle.textContent = "Cấp độ 1: Nghe và Nhắc lại theo mẫu";
  el.modePrompt.textContent = data.promptVi || "Bấm 🎤 Nói ngay để luyện phát âm chuẩn.";
  el.repeatScore.textContent = "—";
  if (el.liveSpeechStatus) {
    el.liveSpeechStatus.textContent = "🎙️ Nhấn 'Nói ngay' và phát âm câu mẫu";
    el.liveSpeechStatus.style.color = "var(--primary)";
  }
  if (el.repeatInputFallback) el.repeatInputFallback.value = "";
  el.containerMode1.style.display = "block";
  drawWavePlaceholder();

  el.btnAudioRepeat.onclick = () => speakEn(data.targetEn);
  el.btnAudioRepeatVi.onclick = () => speakVi(data.hintVi);

  const processScoreResult = (score, said) => {
    el.repeatScore.textContent = `${score}%`;
    if (el.repeatInputFallback && said) el.repeatInputFallback.value = said;

    if (score >= 60) {
      showFeedback(true, `🎉 Rất tốt! Bạn nói: "${said}" (${score}%)`);
      speakEn("Very good!").then(() => {
        el.btnNextDrillMode.style.display = "inline-flex";
      });
    } else if (said) {
      showFeedback(false, `⚠️ Bạn nói: "${said}" (${score}%). Nhấn 🎤 thử lại hoặc chỉnh sửa ô nhập bàn phím.`);
    } else {
      showFeedback(false, `⚠️ Chưa nhận diện được giọng nói. Vui lòng thử nói to hơn hoặc dùng bàn phím nhập.`);
    }
  };

  el.btnMicRepeat.onclick = () => {
    startRecognitionFlow(data.targetEn, processScoreResult);
  };

  if (el.btnCheckRepeatText) {
    el.btnCheckRepeatText.onclick = () => {
      const typed = (el.repeatInputFallback.value || "").trim();
      if (!typed) {
        showFeedback(false, "Vui lòng nhập câu tiếng Anh bạn muốn kiểm tra.");
        return;
      }
      const score = calculateSimilarityScore(typed, data.targetEn);
      processScoreResult(score, typed);
    };
  }
}

// --- Mode 2: Điền từ vào chỗ trống ---
function renderMode2(data) {
  el.modeTitle.textContent = "Cấp độ 2: Điền từ còn thiếu vào chỗ trống";
  el.modePrompt.textContent = data.promptVi || "Chọn đáp án đúng để hoàn thành câu:";
  el.containerMode2.style.display = "block";

  const parts = data.sentenceWithBlank.split("___");
  el.fillSentenceDisplay.innerHTML = `${parts[0]}<span class="blank-input" id="blankWordSlot">___</span>${parts[1] || ""}`;

  el.fillOptionsGrid.innerHTML = data.options.map(opt => `
    <button class="chip-btn" onclick="checkMode2Answer('${opt}', '${data.correctAnswer}', '${data.sentenceWithBlank.replace('___', opt)}')">${opt}</button>
  `).join("");
}

function checkMode2Answer(selected, correct, fullSentence) {
  const slot = document.getElementById("blankWordSlot");
  if (slot) slot.textContent = selected;

  if (selected.toLowerCase() === correct.toLowerCase()) {
    showFeedback(true, `✅ Chính xác! "${fullSentence}"`);
    speakEn(fullSentence).then(() => {
      el.btnNextDrillMode.style.display = "inline-flex";
    });
  } else {
    showFeedback(false, `❌ Chưa đúng! Hãy thử lại.`);
  }
}

// --- Mode 3: Sắp xếp từ ---
function renderMode3(data) {
  el.modeTitle.textContent = "Cấp độ 3: Sắp xếp từ xáo trộn thành câu";
  el.modePrompt.textContent = data.promptVi || "Nhấn vào từng từ bên dưới theo thứ tự đúng:";
  el.containerMode3.style.display = "block";

  scrambleSelectedWords = [];
  renderScrambleState(data.words, data.correctSentence);
}

function renderScrambleState(allWords, correctSentence) {
  el.scrambleTarget.innerHTML = scrambleSelectedWords.map((w, idx) => `
    <div class="word-block" onclick="removeScrambleWord(${idx}, '${escapeJs(correctSentence)}')">${w}</div>
  `).join("") || '<span style="color:#94a3b8; font-size:13px;">Chưa chọn từ...</span>';

  // Pool contains remaining unselected words
  const remainingWords = [...allWords];
  scrambleSelectedWords.forEach(selected => {
    const index = remainingWords.indexOf(selected);
    if (index > -1) remainingWords.splice(index, 1);
  });

  el.scramblePool.innerHTML = remainingWords.map(w => `
    <div class="word-block" onclick="addScrambleWord('${escapeJs(w)}', '${escapeJs(correctSentence)}')">${w}</div>
  `).join("");

  el.btnResetScramble.onclick = () => {
    scrambleSelectedWords = [];
    renderScrambleState(allWords, correctSentence);
    hideFeedback();
  };

  el.btnCheckScramble.onclick = () => {
    const constructed = scrambleSelectedWords.join(" ").trim();
    if (constructed.toLowerCase() === correctSentence.toLowerCase()) {
      showFeedback(true, `🎉 Xuất sắc! Câu chuẩn: "${correctSentence}"`);
      speakEn(correctSentence).then(() => {
        el.btnNextDrillMode.style.display = "inline-flex";
      });
    } else {
      showFeedback(false, `❌ Chưa chính xác. Thứ tự hiện tại: "${constructed}"`);
    }
  };
}

function addScrambleWord(word, correctSentence) {
  scrambleSelectedWords.push(word);
  const targets = lessonData.drillingTargets[currentTargetIndex].drills.mode3_scramble.words;
  renderScrambleState(targets, correctSentence);
}

function removeScrambleWord(index, correctSentence) {
  scrambleSelectedWords.splice(index, 1);
  const targets = lessonData.drillingTargets[currentTargetIndex].drills.mode3_scramble.words;
  renderScrambleState(targets, correctSentence);
}

// --- Mode 4: Biến đổi câu ---
function renderMode4(data) {
  el.modeTitle.textContent = "Cấp độ 4: Biến đổi câu theo yêu cầu";
  el.modePrompt.textContent = data.promptVi;
  el.containerMode4.style.display = "block";

  el.transformInstruction.innerHTML = `<strong>Yêu cầu:</strong> ${data.instructionVi}<br/><span style="color:var(--muted); font-size:13px;">Gợi ý: ${data.hintVi}</span>`;
  el.transformInput.value = "";

  el.btnCheckTransform.onclick = () => {
    const userInput = el.transformInput.value.trim();
    checkTextAnswer(userInput, data.targetEn);
  };

  el.btnMicTransform.onclick = () => {
    startRecognitionFlow(data.targetEn, (score, said) => {
      el.transformInput.value = said;
      checkTextAnswer(said, data.targetEn);
    });
  };
}

// --- Mode 5: Đổi ngữ cảnh / Ngôi ---
function renderMode5(data) {
  el.modeTitle.textContent = "Cấp độ 5: Biến đổi theo ngôi / ngữ cảnh mới";
  el.modePrompt.textContent = data.promptVi;
  el.containerMode5.style.display = "block";

  el.contextInstruction.innerHTML = `<strong>Yêu cầu:</strong> ${data.instructionVi}<br/><span style="color:var(--muted); font-size:13px;">Nghĩa: ${data.hintVi}</span>`;
  el.contextInput.value = "";

  el.btnCheckContext.onclick = () => {
    const userInput = el.contextInput.value.trim();
    checkTextAnswer(userInput, data.targetEn);
  };

  el.btnMicContext.onclick = () => {
    startRecognitionFlow(data.targetEn, (score, said) => {
      el.contextInput.value = said;
      checkTextAnswer(said, data.targetEn);
    });
  };
}

function checkTextAnswer(userText, targetEn) {
  if (!userText) {
    showFeedback(false, "Vui lòng nhập câu trả lời trước khi kiểm tra.");
    return;
  }
  const score = calculateSimilarityScore(userText, targetEn);
  if (score >= 75) {
    showFeedback(true, `🎉 Hoàn hảo! "${userText}" (Độ chính xác: ${score}%)`);
    speakEn(targetEn).then(() => {
      el.btnNextDrillMode.style.display = "inline-flex";
    });
  } else {
    showFeedback(false, `❌ Chưa chính xác ("${userText}" - ${score}%). Đáp án gợi ý: "${targetEn}"`);
  }
}

// ========== TEXT NORMALIZATION & SIMILARITY ==========
function normalizeText(text) {
  if (!text) return "";
  let s = text.toLowerCase().trim();
  s = s.replace(/i'm/g, "i am")
       .replace(/you're/g, "you are")
       .replace(/he's/g, "he is")
       .replace(/she's/g, "she is")
       .replace(/it's/g, "it is")
       .replace(/we're/g, "we are")
       .replace(/they're/g, "they are")
       .replace(/isn't/g, "is not")
       .replace(/aren't/g, "are not")
       .replace(/don't/g, "do not")
       .replace(/can't/g, "cannot");
  s = s.replace(/[.,?!'"]/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

function calculateSimilarityScore(said, target) {
  const normSaid = normalizeText(said);
  const normTarget = normalizeText(target);

  if (!normSaid) return 0;
  if (normSaid === normTarget) return 100;

  const wordsSaid = normSaid.split(" ");
  const wordsTarget = normTarget.split(" ");

  let matchedWords = 0;
  const tempTargetWords = [...wordsTarget];

  wordsSaid.forEach(w => {
    const idx = tempTargetWords.indexOf(w);
    if (idx !== -1) {
      matchedWords++;
      tempTargetWords.splice(idx, 1);
    }
  });

  const wordRatio = (matchedWords / wordsTarget.length) * 100;
  const levSim = levDistanceSimilarity(normSaid, normTarget);

  return Math.min(100, Math.round(Math.max(wordRatio, levSim)));
}

function levDistanceSimilarity(s1, s2) {
  let m = s1.length, n = s2.length;
  if (m === 0) return n === 0 ? 100 : 0;
  if (n === 0) return 0;

  let d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      let cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }

  let dist = d[m][n];
  let maxLen = Math.max(m, n);
  return Math.round(((maxLen - dist) / maxLen) * 100);
}

// ========== DRILL NAVIGATION ==========
function nextDrillMode() {
  if (currentMode < 5) {
    currentMode++;
  } else {
    currentMode = 1;
    currentTargetIndex++;
  }
  renderCurrentDrill();
}

function prevDrillMode() {
  if (currentMode > 1) {
    currentMode--;
  } else if (currentTargetIndex > 0) {
    currentTargetIndex--;
    currentMode = 5;
  }
  renderCurrentDrill();
}

// ========== FEEDBACK MESSAGES ==========
function showFeedback(isSuccess, text) {
  el.feedbackMsg.className = `feedback-msg ${isSuccess ? "success" : "error"}`;
  el.feedbackMsg.textContent = text;
}

function hideFeedback() {
  el.feedbackMsg.className = "feedback-msg";
  el.feedbackMsg.style.display = "none";
}

// ========== SPEECH RECOGNITION & AUDIO WAVE ==========
let recognitionTimeout = null;

function initSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    console.warn("Speech recognition API is not supported in this browser.");
    return;
  }
  try {
    recognition = new SpeechRec();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
  } catch (e) {
    console.warn("Could not init SpeechRecognition:", e);
  }
}

let waveAnimFrame = null;

async function startRecognitionFlow(targetText, callback) {
  if (!recognition) {
    initSpeechRecognition();
  }

  if (!recognition) {
    addToHistory("⚠️ Trình duyệt chưa hỗ trợ Web Speech Recognition API");
    if (el.liveSpeechStatus) {
      el.liveSpeechStatus.textContent = "⚠️ Trình duyệt chưa hỗ trợ nhận diện tự động. Bạn hãy nhập câu bằng bàn phím bên dưới!";
      el.liveSpeechStatus.style.color = "var(--danger)";
    }
    showFeedback(false, "Trình duyệt chưa hỗ trợ nhận diện giọng nói tự động. Hãy nhập câu nói vào ô bàn phím bên dưới!");
    return;
  }

  // Stop any ongoing TTS audio before starting mic input
  stopAllAudio(true);

  isRecording = true;
  updateMicButtonState(true);
  startWaveVisualization();

  if (el.liveSpeechStatus) {
    el.liveSpeechStatus.textContent = "🎙️ Đang lắng nghe... Hãy nói ngay bây giờ!";
    el.liveSpeechStatus.style.color = "#dc2626";
  }

  try {
    recognition.abort();
  } catch (e) {}

  let lastCapturedTranscript = "";

  recognition.interimResults = true;
  recognition.lang = "en-US";

  // Safeguard timeout to prevent infinite listening hanging
  if (recognitionTimeout) clearTimeout(recognitionTimeout);
  recognitionTimeout = setTimeout(() => {
    if (isRecording) {
      try { recognition.stop(); } catch (e) {}
    }
  }, 10000);

  recognition.onresult = (e) => {
    let interimText = "";
    let finalText = "";
    for (let i = 0; i < e.results.length; i++) {
      const trans = e.results[i][0].transcript;
      if (e.results[i].isFinal) {
        finalText += " " + trans;
      } else {
        interimText += " " + trans;
      }
    }
    lastCapturedTranscript = (finalText || interimText).trim();
    if (lastCapturedTranscript && el.liveSpeechStatus) {
      el.liveSpeechStatus.textContent = `🗣️ Đang nghe: "${lastCapturedTranscript}"`;
      el.liveSpeechStatus.style.color = "var(--primary)";
    }
  };

  recognition.onerror = (err) => {
    if (recognitionTimeout) clearTimeout(recognitionTimeout);
    isRecording = false;
    updateMicButtonState(false);
    stopWaveVisualization();

    const errCode = err.error || "unknown";
    console.warn("Speech recognition error:", errCode, err);

    let msg = "Lỗi nhận diện giọng nói.";
    if (errCode === "no-speech") {
      msg = "Không phát hiện tiếng nói (Micro nhỏ hoặc ngắt lời nhanh). Bạn có thể thử lại hoặc nhập câu bằng bàn phím.";
    } else if (errCode === "network") {
      msg = "Không kết nối được dịch vụ nhận diện giọng nói Google. Vui lòng nhập câu bằng bàn phím.";
    } else if (errCode === "not-allowed" || errCode === "service-not-allowed") {
      msg = "Quyền truy cập Micro bị từ chối hoặc bị chặn bởi trình duyệt.";
    } else if (errCode === "audio-capture") {
      msg = "Không tìm thấy thiết bị thu âm Micro.";
    }

    if (el.liveSpeechStatus) {
      el.liveSpeechStatus.textContent = `❌ ${msg}`;
      el.liveSpeechStatus.style.color = "var(--danger)";
    }

    addToHistory(`❌ Lỗi [${errCode}]: ${msg}`);
    showFeedback(false, `❌ ${msg}`);
  };

  recognition.onend = () => {
    if (recognitionTimeout) clearTimeout(recognitionTimeout);
    const wasRecording = isRecording;
    isRecording = false;
    updateMicButtonState(false);
    stopWaveVisualization();

    if (lastCapturedTranscript) {
      const said = lastCapturedTranscript;
      const score = calculateSimilarityScore(said, targetText);

      if (el.liveSpeechStatus) {
        el.liveSpeechStatus.textContent = `✅ Nghe xong: "${said}" (${score}%)`;
        el.liveSpeechStatus.style.color = "var(--success)";
      }

      addToHistory(`🎤 Nghe được: "${said}" → Độ chính xác: ${score}%`);
      callback(score, said);
    } else if (wasRecording) {
      if (el.liveSpeechStatus && !el.liveSpeechStatus.textContent.includes("❌")) {
        el.liveSpeechStatus.textContent = "⚠️ Chưa nhận diện được từ nào. Bấm 'Nói ngay' lại hoặc dùng ô nhập bàn phím bên dưới.";
        el.liveSpeechStatus.style.color = "var(--warning)";
      }
    }
  };

  try {
    setTimeout(() => {
      if (isRecording) {
        try {
          recognition.start();
        } catch (startErr) {
          console.warn("Recognition start error:", startErr);
        }
      }
    }, 100);
  } catch (err) {
    isRecording = false;
    updateMicButtonState(false);
    stopWaveVisualization();
    if (el.liveSpeechStatus) {
      el.liveSpeechStatus.textContent = "❌ Không thể khởi động nhận diện giọng nói. Hãy dùng bàn phím nhập bên dưới.";
      el.liveSpeechStatus.style.color = "var(--danger)";
    }
  }
}

function startWaveVisualization() {
  const canvas = el.waveCanvasRepeat;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (waveAnimFrame) cancelAnimationFrame(waveAnimFrame);

  let step = 0;
  const renderWave = () => {
    if (!isRecording) return;
    waveAnimFrame = requestAnimationFrame(renderWave);
    step += 0.15;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    const numBars = 32;
    const barWidth = width / numBars;

    for (let i = 0; i < numBars; i++) {
      const val = Math.sin(step + i * 0.35) * Math.cos(step * 0.7 + i * 0.15);
      const barHeight = Math.max(6, Math.abs(val) * (height * 0.75));

      ctx.fillStyle = i % 2 === 0 ? "#2563eb" : "#3b82f6";
      ctx.fillRect(i * barWidth + 2, midY - barHeight / 2, barWidth - 4, barHeight);
    }
  };
  renderWave();
}

function stopWaveVisualization() {
  isRecording = false;
  if (waveAnimFrame) {
    cancelAnimationFrame(waveAnimFrame);
    waveAnimFrame = null;
  }
  drawWavePlaceholder();
}

function drawWavePlaceholder() {
  const canvas = el.waveCanvasRepeat;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🎤 Sóng âm giọng nói sẽ xuất hiện tại đây khi bạn nói", canvas.width / 2, canvas.height / 2 + 4);
}

function updateMicButtonState(recording) {
  [el.btnMicRepeat, el.btnMicTransform, el.btnMicContext].forEach(btn => {
    if (!btn) return;
    if (recording) {
      btn.classList.add("recording");
    } else {
      btn.classList.remove("recording");
    }
  });
}

// ========== RECOGNITION HISTORY ==========
function addToHistory(text) {
  const time = new Date().toLocaleTimeString("vi-VN");
  recognitionHistory.unshift({ time, text });
  if (recognitionHistory.length > 20) recognitionHistory.pop();
  renderRecognitionHistory();
}

function renderRecognitionHistory() {
  el.recognitionHistory.innerHTML = recognitionHistory.length
    ? recognitionHistory.map(item => `<div class="history-item"><span class="time">[${item.time}]</span> ${item.text}</div>`).join("")
    : `<div class="history-item"><span class="time">--:--:--</span> Chưa có dữ liệu nói</div>`;
}

// ========== SUMMARY STEP ==========
function renderSummary() {
  clearInterval(timerInterval);
  const timeSpentMinutes = Math.max(1, Math.floor((MAX_TIME_SECONDS - timeLeft) / 60));
  el.finalScoreText.textContent = `Bạn đã hoàn thành bài học "${lessonData.title}" trong ${timeSpentMinutes} phút! Tất cả 5 Cấp độ Drilling đã được vượt qua thành công.`;
}

// ========== STEP NAVIGATION HELPER ==========
function showStep(name) {
  el.stepSelect.classList.remove("active");
  el.stepDialogue.classList.remove("active");
  el.stepDrill.classList.remove("active");
  el.stepDone.classList.remove("active");

  if (name === "select") el.stepSelect.classList.add("active");
  if (name === "dialogue") el.stepDialogue.classList.add("active");
  if (name === "drill") el.stepDrill.classList.add("active");
  if (name === "done") el.stepDone.classList.add("active");
}

// ========== BIND EVENT LISTENERS ==========
function bindEvents() {
  el.btnLoadLesson.addEventListener("click", loadSelectedLesson);

  el.btnPlayFullDialogue.addEventListener("click", () => {
    if (isDialoguePlaying) {
      stopAllAudio();
    } else {
      playFullDialogue();
    }
  });

  el.btnReadGrammar.addEventListener("click", () => {
    if (lessonData && lessonData.grammarRules) {
      const rules = lessonData.grammarRules;
      const text = `${rules.summaryVi} ${rules.points.map(p => `${p.subject} dùng với ${p.toBe}`).join('. ')}`;
      speakVi(text);
    }
  });

  el.btnGoToDrills.addEventListener("click", () => {
    stopAllAudio();
    showStep("drill");
    renderCurrentDrill();
  });

  el.btnNextDrillMode.addEventListener("click", nextDrillMode);
  el.btnPrevDrillMode.addEventListener("click", prevDrillMode);

  el.btnNextLesson.addEventListener("click", () => {
    const currentVal = el.lessonSelector.value;
    const currIdx = LESSON_LIST.findIndex(item => item.file === currentVal);
    if (currIdx !== -1 && currIdx < LESSON_LIST.length - 1) {
      el.lessonSelector.value = LESSON_LIST[currIdx + 1].file;
    } else {
      el.lessonSelector.value = LESSON_LIST[0].file;
    }
    loadSelectedLesson();
  });
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", init);
