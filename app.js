// ==================================================
// HocDrill — Nền Tảng Luyện Phản Xạ Ngữ Pháp & Ôn Luyện Tiếng Anh 100 Bài
// ==================================================

const MAX_TIME_SECONDS = 35 * 60;
let currentSpeechRate = 0.65; // Default slower speech rate (0.65x)

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

// Quiz / Review State
const STORAGE_KEY_COMPLETED = "hocdrill_completed_lessons";
let quizQuestions = [];
let currentQuizIdx = 0;
let quizScore = 0;
let quizUserAnswers = [];
let quizTimerSeconds = 0;
let quizTimerInterval = null;
let quizScrambleSelectedWords = [];
let quizIsRecordingSpeaking = false;

// DOM Element Selectors
const el = {
  // Main Tabs
  tabBtnLessons: document.getElementById("tabBtnLessons"),
  tabBtnReview: document.getElementById("tabBtnReview"),
  tabLessonsContent: document.getElementById("tabLessonsContent"),
  tabReviewContent: document.getElementById("tabReviewContent"),

  // Overall Progress
  overallProgressFill: document.getElementById("overallProgressFill"),
  overallProgressCount: document.getElementById("overallProgressCount"),
  btnToggleCurrentCompleted: document.getElementById("btnToggleCurrentCompleted"),

  // Lesson Tab Selectors
  lessonSelector: document.getElementById("lessonSelector"),
  btnLoadLesson: document.getElementById("btnLoadLesson"),
  btnJumpToReviewFromLesson: document.getElementById("btnJumpToReviewFromLesson"),
  lessonTitle: document.getElementById("lessonTitle"),
  timeLeft: document.getElementById("timeLeft"),
  progressFill: document.getElementById("progressFill"),
  audioStatusBadge: document.getElementById("audioStatusBadge"),

  // Steps in Lesson Tab
  stepSelect: document.getElementById("stepSelect"),
  stepDialogue: document.getElementById("stepDialogue"),
  stepDrill: document.getElementById("stepDrill"),
  stepDone: document.getElementById("stepDone"),

  // Dialogue Step
  dialogueSectionTitle: document.getElementById("dialogueSectionTitle"),
  btnPlayFullDialogue: document.getElementById("btnPlayFullDialogue"),
  dialogueList: document.getElementById("dialogueList"),
  grammarBox: document.getElementById("grammarBox"),
  grammarBoxHeaderTitle: document.getElementById("grammarBoxHeaderTitle"),
  grammarContent: document.getElementById("grammarContent"),
  btnReadGrammar: document.getElementById("btnReadGrammar"),
  btnGoToDrills: document.getElementById("btnGoToDrills"),
  btnBackToSelectFromDialogue: document.getElementById("btnBackToSelectFromDialogue"),

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

  // Mode 1
  btnAudioRepeat: document.getElementById("btnAudioRepeat"),
  btnAudioRepeatVi: document.getElementById("btnAudioRepeatVi"),
  btnMicRepeat: document.getElementById("btnMicRepeat"),
  waveCanvasRepeat: document.getElementById("waveCanvasRepeat"),
  liveSpeechStatus: document.getElementById("liveSpeechStatus"),
  repeatScore: document.getElementById("repeatScore"),
  repeatInputFallback: document.getElementById("repeatInputFallback"),
  btnCheckRepeatText: document.getElementById("btnCheckRepeatText"),

  // Mode 2
  fillSentenceDisplay: document.getElementById("fillSentenceDisplay"),
  fillOptionsGrid: document.getElementById("fillOptionsGrid"),

  // Mode 3
  scrambleTarget: document.getElementById("scrambleTarget"),
  scramblePool: document.getElementById("scramblePool"),
  btnResetScramble: document.getElementById("btnResetScramble"),
  btnCheckScramble: document.getElementById("btnCheckScramble"),

  // Mode 4
  transformInstruction: document.getElementById("transformInstruction"),
  transformInput: document.getElementById("transformInput"),
  btnCheckTransform: document.getElementById("btnCheckTransform"),
  btnMicTransform: document.getElementById("btnMicTransform"),

  // Mode 5
  contextInstruction: document.getElementById("contextInstruction"),
  contextInput: document.getElementById("contextInput"),
  btnCheckContext: document.getElementById("btnCheckContext"),
  btnMicContext: document.getElementById("btnMicContext"),

  // Feedback & Navigation
  feedbackMsg: document.getElementById("feedbackMsg"),
  btnPrevDrillMode: document.getElementById("btnPrevDrillMode"),
  btnNextDrillMode: document.getElementById("btnNextDrillMode"),
  recognitionHistory: document.getElementById("recognitionHistory"),
  finalScoreText: document.getElementById("finalScoreText"),
  btnRestartCurrentLesson: document.getElementById("btnRestartCurrentLesson"),
  btnNextLesson: document.getElementById("btnNextLesson"),
  btnGoToReviewAfterDone: document.getElementById("btnGoToReviewAfterDone"),

  // Stepper pills
  pills: [
    document.getElementById("pill-mode1"),
    document.getElementById("pill-mode2"),
    document.getElementById("pill-mode3"),
    document.getElementById("pill-mode4"),
    document.getElementById("pill-mode5")
  ],

  // Review / Quiz Tab Elements
  reviewSetupView: document.getElementById("reviewSetupView"),
  reviewCompletedCountText: document.getElementById("reviewCompletedCountText"),
  btnStartReviewQuiz: document.getElementById("btnStartReviewQuiz"),

  reviewQuizActiveView: document.getElementById("reviewQuizActiveView"),
  quizQuestionIdx: document.getElementById("quizQuestionIdx"),
  quizTotalQuestions: document.getElementById("quizTotalQuestions"),
  quizTimerText: document.getElementById("quizTimerText"),
  quizCurrentScore: document.getElementById("quizCurrentScore"),
  quizProgressBar: document.getElementById("quizProgressBar"),

  quizTypeBadge: document.getElementById("quizTypeBadge"),
  btnQuizPlayAudioPrompt: document.getElementById("btnQuizPlayAudioPrompt"),
  quizPromptVi: document.getElementById("quizPromptVi"),
  quizReadingBox: document.getElementById("quizReadingBox"),
  quizReadingPassageText: document.getElementById("quizReadingPassageText"),
  btnReadQuizPassage: document.getElementById("btnReadQuizPassage"),
  quizQuestionText: document.getElementById("quizQuestionText"),
  quizAnswerDynamicArea: document.getElementById("quizAnswerDynamicArea"),
  quizFeedbackBox: document.getElementById("quizFeedbackBox"),
  quizExplanationBox: document.getElementById("quizExplanationBox"),
  btnQuitReviewQuiz: document.getElementById("btnQuitReviewQuiz"),
  btnNextQuizQuestion: document.getElementById("btnNextQuizQuestion"),

  // Review Results Elements
  reviewResultView: document.getElementById("reviewResultView"),
  quizResultSubtitle: document.getElementById("quizResultSubtitle"),
  resScoreText: document.getElementById("resScoreText"),
  resPercentText: document.getElementById("resPercentText"),
  resTimeSpentText: document.getElementById("resTimeSpentText"),
  resGradeBadge: document.getElementById("resGradeBadge"),
  btnRestartNewQuiz: document.getElementById("btnRestartNewQuiz"),
  btnBackToLessonTab: document.getElementById("btnBackToLessonTab"),
  quizDetailedBreakdownList: document.getElementById("quizDetailedBreakdownList")
};

// Full catalog of 100 lessons
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
  { file: "lesson-018.json", name: "Bài 18: Hiện tại Tiếp diễn - Phủ định, Yes/No & Wh- Questions" },
  { file: "lesson-019.json", name: "Bài 19: Động từ Thường - Hiện tại Tiếp diễn (Be + V-ing)" },
  { file: "lesson-020.json", name: "Bài 20: Hiện tại Tiếp diễn - Đầy đủ 3 dạng & Trả lời ngắn" },
  { file: "lesson-021.json", name: "Bài 21: So sánh Tính từ - Cơ bản (So sánh hơn & So sánh nhất ngắn)" },
  { file: "lesson-022.json", name: "Bài 22: So sánh Tính từ - Dài hơn & Dạng Bất quy tắc nâng cao" },
  { file: "lesson-023.json", name: "Bài 23: Trạng từ Tần suất - Vị trí & Cách phối hợp" },
  { file: "lesson-024.json", name: "Bài 24: Trạng từ Chỉ mức độ & Cách thức - Vị trí & Ngữ cảnh" },
  { file: "lesson-025.json", name: "Bài 25: Hiện tại Hoàn thành - Cơ bản (Have / Has + V3/ed)" },
  { file: "lesson-026.json", name: "Bài 26: Hiện tại Hoàn thành - Phủ định, Câu hỏi & Trả lời ngắn" },
  { file: "lesson-027.json", name: "Bài 27: Hiện tại Hoàn thành - Kết hợp Ever / Never / Already / Yet" },
  { file: "lesson-028.json", name: "Bài 28: Quá khứ Tiếp diễn - Cơ bản (Was / Were + V-ing)" },
  { file: "lesson-029.json", name: "Bài 29: Quá khứ Tiếp diễn - Kết hợp Quá khứ Đơn (When / While)" },
  { file: "lesson-030.json", name: "Bài 30: Tương lai Tiếp diễn - Cơ bản (Will be + V-ing)" },
  { file: "lesson-031.json", name: "Bài 31: Tính từ & Trạng từ - Phân biệt & Chuyển đuôi -ly" },
  { file: "lesson-032.json", name: "Bài 32: Mạo từ - A / An / The & Không dùng mạo từ" },
  { file: "lesson-033.json", name: "Bài 33: Giới từ Chỉ Thời gian - In / On / At & Cụm cố định" },
  { file: "lesson-034.json", name: "Bài 34: Giới từ Chỉ Nơi chốn - In / On / At / Under / Next to" },
  { file: "lesson-035.json", name: "Bài 35: Giới từ Chỉ Phương hướng & Chuyển động - To / Into / Out of" },
  { file: "lesson-036.json", name: "Bài 36: Động từ Khuyết thiếu - Can / Can't (Khả năng & Xin phép)" },
  { file: "lesson-037.json", name: "Bài 37: Động từ Khuyết thiếu - Could / Couldn't (Quá khứ & Lịch sự)" },
  { file: "lesson-038.json", name: "Bài 38: Động từ Khuyết thiếu - May / Might (Dự đoán & Xin phép)" },
  { file: "lesson-039.json", name: "Bài 39: Danh từ Đếm được - Số ít & Số nhiều (-s / -es)" },
  { file: "lesson-040.json", name: "Bài 40: Danh từ Không đếm được & Lượng từ (Some / Any)" },
  { file: "lesson-041.json", name: "Bài 41: Lượng từ - Many / Much / A lot of / Some / Any" },
  { file: "lesson-042.json", name: "Bài 42: Câu So sánh - Cấu trúc đầy đủ (Than / As...As)" },
  { file: "lesson-043.json", name: "Bài 43: Câu Bị động - Hiện tại Đơn (Am / Is / Are + V3/ed)" },
  { file: "lesson-044.json", name: "Bài 44: Câu Bị động - Quá khứ Đơn (Was / Were + V3/ed)" },
  { file: "lesson-045.json", name: "Bài 45: Câu Bị động - Tương lai Đơn (Will be + V3/ed)" },
  { file: "lesson-046.json", name: "Bài 46: Câu Bị động - Hiện tại Tiếp diễn (Is/Are being + V3/ed)" },
  { file: "lesson-047.json", name: "Bài 47: Câu Bị động - Hiện tại Hoàn thành (Have/Has been + V3/ed)" },
  { file: "lesson-048.json", name: "Bài 48: Câu Bị động - Với Động từ khuyết thiếu (Can/Should/Must + be + V3)" },
  { file: "lesson-049.json", name: "Bài 49: Câu Điều kiện - Loại 3 (If + Had V3, Would have V3)" },
  { file: "lesson-050.json", name: "Bài 50: Câu Điều kiện - Tổng hợp 3 loại & Đảo ngữ If" },
  { file: "lesson-051.json", name: "Bài 51: Dạng Nguyên mẫu & V-ing sau Động từ (Like/Enjoy/Want/Hope)" },
  { file: "lesson-052.json", name: "Bài 52: Động từ Đuôi -ed - Cách phát âm 3 âm tiết (/t/ /d/ /ɪd/)" },
  { file: "lesson-053.json", name: "Bài 53: Trạng từ - So sánh hơn & So sánh nhất" },
  { file: "lesson-054.json", name: "Bài 54: Câu Tường thuật - Câu kể cơ bản (Lùi thì & Đổi đại từ)" },
  { file: "lesson-055.json", name: "Bài 55: Câu Tường thuật - Câu hỏi Yes/No & Wh- (If/Whether)" },
  { file: "lesson-056.json", name: "Bài 56: Câu Tường thuật - Mệnh lệnh & Yêu cầu (Told/Asked to V)" },
  { file: "lesson-057.json", name: "Bài 57: Đại từ Quan hệ - Who / Whom (Mệnh đề quan hệ người)" },
  { file: "lesson-058.json", name: "Bài 58: Đại từ Quan hệ - Which / That (Mệnh đề quan hệ vật)" },
  { file: "lesson-059.json", name: "Bài 59: Đại từ Quan hệ - Whose (Quan hệ sở hữu)" },
  { file: "lesson-060.json", name: "Bài 60: Đại từ Quan hệ - Where / When / Why (Trạng từ quan hệ)" },
  { file: "lesson-061.json", name: "Bài 61: Đại từ Quan hệ - Giới từ đi trước & Đại từ không xác định" },
  { file: "lesson-062.json", name: "Bài 62: Câu Ghép - Liên từ phối hợp (Both...and / Neither...nor / Either...or)" },
  { file: "lesson-063.json", name: "Bài 63: Câu Ghép - Liên từ đối lập & Nguyên nhân-kết quả" },
  { file: "lesson-064.json", name: "Bài 64: Hiện tại Hoàn thành Tiếp diễn - Cơ bản (Have/Has been + V-ing)" },
  { file: "lesson-065.json", name: "Bài 65: Quá khứ Hoàn thành - Cơ bản (Had + V3/ed)" },
  { file: "lesson-066.json", name: "Bài 66: Quá khứ Hoàn thành - Kết hợp Quá khứ Đơn (After / Before / When)" },
  { file: "lesson-067.json", name: "Bài 67: Quá khứ Hoàn thành Tiếp diễn - Cơ bản (Had been + V-ing)" },
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

// ==========================================
// 1. COMPLETION TRACKING & LOCALSTORAGE
// ==========================================
function getCompletedLessons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPLETED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCompletedLessons(arr) {
  try {
    localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(arr));
  } catch (e) {}
}

function isLessonCompleted(fileName) {
  const list = getCompletedLessons();
  return list.includes(fileName);
}

function markLessonCompleted(fileName, state = true) {
  let list = getCompletedLessons();
  if (state && !list.includes(fileName)) {
    list.push(fileName);
  } else if (!state && list.includes(fileName)) {
    list = list.filter(f => f !== fileName);
  }
  saveCompletedLessons(list);
  updateOverallProgressUI();
}

function toggleCurrentLessonCompleted() {
  const currentVal = el.lessonSelector.value;
  if (!currentVal) {
    alert("Vui lòng chọn một bài học trước!");
    return;
  }
  const currentStatus = isLessonCompleted(currentVal);
  markLessonCompleted(currentVal, !currentStatus);
}

function updateOverallProgressUI() {
  const completed = getCompletedLessons();
  const count = completed.length;
  const total = LESSON_LIST.length;
  const pct = Math.round((count / total) * 100);

  if (el.overallProgressFill) el.overallProgressFill.style.width = `${pct}%`;
  if (el.overallProgressCount) el.overallProgressCount.textContent = `${count} / ${total} bài (${pct}%)`;

  if (el.reviewCompletedCountText) {
    el.reviewCompletedCountText.textContent = `${count} bài`;
  }

  // Update current toggle button label
  const currentVal = el.lessonSelector.value;
  if (el.btnToggleCurrentCompleted) {
    if (currentVal && isLessonCompleted(currentVal)) {
      el.btnToggleCurrentCompleted.textContent = "✅ Đã học (Bấm để hủy)";
      el.btnToggleCurrentCompleted.style.background = "#dcfce7";
      el.btnToggleCurrentCompleted.style.color = "#166534";
    } else {
      el.btnToggleCurrentCompleted.textContent = "✔️ Đánh dấu bài này đã học";
      el.btnToggleCurrentCompleted.style.background = "#f1f5f9";
      el.btnToggleCurrentCompleted.style.color = "#334155";
    }
  }

  // Update lesson selector option labels
  populateLessonSelector(false);
}

function populateLessonSelector(resetSelection = true) {
  const prevVal = el.lessonSelector.value;
  el.lessonSelector.innerHTML = '<option value="">-- Vui lòng chọn bài học (1 - 100) --</option>';

  LESSON_LIST.forEach((item, idx) => {
    const opt = document.createElement("option");
    opt.value = item.file;
    const completed = isLessonCompleted(item.file);
    opt.textContent = completed ? `✅ [Đã học] ${item.name}` : `[Bài ${idx + 1}] ${item.name}`;
    el.lessonSelector.appendChild(opt);
  });

  if (!resetSelection && prevVal) {
    el.lessonSelector.value = prevVal;
  }
}

// ==========================================
// 2. MAIN TAB NAVIGATION
// ==========================================
function switchMainTab(tabName) {
  stopAllAudio();
  if (tabName === "review") {
    el.tabBtnLessons.classList.remove("active");
    el.tabBtnReview.classList.add("active");
    el.tabLessonsContent.classList.remove("active");
    el.tabReviewContent.classList.add("active");
    updateOverallProgressUI();
  } else {
    el.tabBtnReview.classList.remove("active");
    el.tabBtnLessons.classList.add("active");
    el.tabReviewContent.classList.remove("active");
    el.tabLessonsContent.classList.add("active");
    updateOverallProgressUI();
  }
}

// ==========================================
// 3. AUDIO & SPEECH SYNTHESIS ENGINE
// ==========================================
function initVoices() {
  if ("speechSynthesis" in window) {
    availableVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      availableVoices = window.speechSynthesis.getVoices();
    };
  }
}

function getVoiceForGender(gender) {
  if (!availableVoices.length) return null;
  const enVoices = availableVoices.filter(v => v.lang.startsWith("en"));
  if (!enVoices.length) return null;

  if (gender === "male") {
    const male = enVoices.find(v => /male|david|george|james|guy|alex/i.test(v.name));
    return male || enVoices[0];
  } else {
    const female = enVoices.find(v => /female|zira|samantha|victoria|susan|karen/i.test(v.name));
    return female || enVoices[enVoices.length - 1];
  }
}

function speakVi(text, callback) {
  stopAllAudio();
  setAudioBadge(true);

  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  const proxyUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=vi`;
  
  const audio = new Audio(proxyUrl);
  currentAudioElement = audio;

  audio.playbackRate = currentSpeechRate;
  audio.onended = () => {
    setAudioBadge(false);
    currentAudioElement = null;
    if (callback) callback();
  };

  audio.onerror = () => {
    // Fallback to Web Speech API
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(cleanText);
      u.lang = "vi-VN";
      u.rate = currentSpeechRate;
      u.onend = () => {
        setAudioBadge(false);
        if (callback) callback();
      };
      u.onerror = () => {
        setAudioBadge(false);
        if (callback) callback();
      };
      window.speechSynthesis.speak(u);
    } else {
      setAudioBadge(false);
      if (callback) callback();
    }
  };

  audio.play().catch(() => {
    setAudioBadge(false);
    if (callback) callback();
  });
}

function speakEn(text, gender = "male", callback) {
  stopAllAudio();
  setAudioBadge(true);

  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  const proxyUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=en`;
  
  const audio = new Audio(proxyUrl);
  currentAudioElement = audio;

  audio.playbackRate = currentSpeechRate;
  audio.onended = () => {
    setAudioBadge(false);
    currentAudioElement = null;
    if (callback) callback();
  };

  audio.onerror = () => {
    // Fallback to Web Speech API with gender selection
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(cleanText);
      u.lang = "en-US";
      u.rate = currentSpeechRate;
      const voice = getVoiceForGender(gender);
      if (voice) u.voice = voice;

      u.onend = () => {
        setAudioBadge(false);
        if (callback) callback();
      };
      u.onerror = () => {
        setAudioBadge(false);
        if (callback) callback();
      };
      window.speechSynthesis.speak(u);
    } else {
      setAudioBadge(false);
      if (callback) callback();
    }
  };

  audio.play().catch(() => {
    setAudioBadge(false);
    if (callback) callback();
  });
}

function stopAllAudio() {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  setAudioBadge(false);
  isDialoguePlaying = false;
  if (el.btnPlayFullDialogue) el.btnPlayFullDialogue.textContent = "▶ Nghe toàn bộ hội thoại";
}

function setAudioBadge(isPlaying) {
  if (!el.audioStatusBadge) return;
  el.audioStatusBadge.style.display = isPlaying ? "inline-block" : "none";
}

// ==========================================
// 4. SPEECH RECOGNITION & CANVAS WAVEFORM
// ==========================================
function initSpeechRecognition() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isRecording = true;
      if (el.btnMicRepeat) el.btnMicRepeat.classList.add("recording");
      if (el.btnMicTransform) el.btnMicTransform.classList.add("recording");
      if (el.btnMicContext) el.btnMicContext.classList.add("recording");
      if (el.liveSpeechStatus) el.liveSpeechStatus.textContent = "🎙️ Đang nghe... Hãy phát âm câu của bạn!";
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSpeechResult(transcript);
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      stopRecording();
      if (el.liveSpeechStatus) el.liveSpeechStatus.textContent = "⚠️ Không nhận diện được hoặc Micro bị chặn. Bạn có thể gõ văn bản dự phòng bên dưới.";
    };

    recognition.onend = () => {
      stopRecording();
    };
  }
}

function startRecording(canvasId) {
  stopAllAudio();
  if (recognition) {
    try {
      recognition.start();
    } catch (err) {}
  }
  startWaveVisualizer(canvasId);
}

function stopRecording() {
  isRecording = false;
  quizIsRecordingSpeaking = false;
  if (el.btnMicRepeat) el.btnMicRepeat.classList.remove("recording");
  if (el.btnMicTransform) el.btnMicTransform.classList.remove("recording");
  if (el.btnMicContext) el.btnMicContext.classList.remove("recording");
  
  const quizMicBtn = document.getElementById("btnQuizSpeakingMic");
  if (quizMicBtn) quizMicBtn.classList.remove("recording");

  stopWaveVisualizer();
}

function startWaveVisualizer(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  navigator.mediaDevices?.getUserMedia({ audio: true }).then((stream) => {
    mediaStream = stream;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 64;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function draw() {
      if (!isRecording && !quizIsRecordingSpeaking) return;
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = "#2563eb";
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    }
    draw();
  }).catch(() => {});
}

function stopWaveVisualizer() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = null;
  }
}

function handleSpeechResult(transcript) {
  addRecognitionHistory(transcript);

  // Check if we are currently inside the Review Quiz speaking mode
  if (quizIsRecordingSpeaking) {
    evaluateQuizSpeakingSpeech(transcript);
    return;
  }

  // Otherwise handle lesson drilling modes
  if (currentMode === 1) {
    const target = getTargetData();
    const targetText = target.baseEn;
    const score = calculateSimilarity(transcript, targetText);
    
    el.repeatScore.textContent = `${score}% ("${transcript}")`;
    el.liveSpeechStatus.textContent = `Bạn nói: "${transcript}"`;

    if (score >= 70) {
      showFeedback(true, `🎉 Xuất sắc! Phát âm chính xác ${score}%.`);
      markDrillSuccess(1);
    } else {
      showFeedback(false, `Chưa chính xác (${score}%). Thử lại hoặc nghe lại câu mẫu.`);
    }
  } else if (currentMode === 4) {
    el.transformInput.value = transcript;
    checkTransform();
  } else if (currentMode === 5) {
    el.contextInput.value = transcript;
    checkContext();
  }
}

function calculateSimilarity(str1, str2) {
  const clean1 = str1.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().split(/\s+/);
  const clean2 = str2.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim().split(/\s+/);
  
  let matches = 0;
  clean1.forEach(w => {
    if (clean2.includes(w)) matches++;
  });
  return Math.round((matches / Math.max(clean1.length, clean2.length)) * 100);
}

function addRecognitionHistory(text) {
  const time = new Date().toTimeString().split(" ")[0];
  recognitionHistory.unshift({ time, text });
  if (recognitionHistory.length > 8) recognitionHistory.pop();
  renderRecognitionHistory();
}

function renderRecognitionHistory() {
  if (!el.recognitionHistory) return;
  el.recognitionHistory.innerHTML = recognitionHistory.length
    ? recognitionHistory.map(item => `<div class="history-item"><span class="time">[${item.time}]</span> ${item.text}</div>`).join("")
    : `<div class="history-item"><span class="time">--:--:--</span> Chưa có dữ liệu nói</div>`;
}

// ==========================================
// 5. LESSON DRILLING LOGIC (TABS 1)
// ==========================================
function loadSelectedLesson() {
  const sel = document.getElementById("lessonSelector") || (el && el.lessonSelector);
  let fileName = (sel && sel.value) ? sel.value : "lesson-001.json";
  if (!fileName || fileName.trim() === "") {
    fileName = "lesson-001.json";
  }
  if (sel) sel.value = fileName;

  // 1. Instant Offline / In-Memory Bundle Check (Zero CORS & Zero Network Dependency)
  if (window.HOCDRILL_LESSONS && window.HOCDRILL_LESSONS[fileName]) {
    const data = window.HOCDRILL_LESSONS[fileName];
    lessonData = data;
    currentTargetIndex = 0;
    currentMode = 1;
    resetLessonTimer();
    renderDialogueStep();
    showStep("dialogue");
    updateOverallProgressUI();
    return;
  }

  // 2. Network / Server Fallback
  const pad = fileName.replace(".json", "");
  const numOnly = pad.replace("lesson-", "");

  const tryFetch = (url) => {
    return fetch(url).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  };

  const sources = [
    `./data/${fileName}`,
    `/data/${fileName}`,
    `data/${fileName}`,
    `/api/lesson/${pad}`,
    `/api/lesson/${numOnly}`,
    `./api/lesson/${pad}`,
    new URL(`data/${fileName}`, window.location.href).href
  ];

  let chain = tryFetch(sources[0]);
  for (let i = 1; i < sources.length; i++) {
    chain = chain.catch(() => tryFetch(sources[i]));
  }

  chain
    .then(data => {
      if (!data || !data.title) throw new Error("Invalid lesson data payload");
      lessonData = data;
      currentTargetIndex = 0;
      currentMode = 1;
      resetLessonTimer();
      renderDialogueStep();
      showStep("dialogue");
      updateOverallProgressUI();
    })
    .catch(err => {
      console.error("Error loading lesson:", err);
      alert(`Không thể tải tệp dữ liệu bài học (${fileName}). Vui lòng kiểm tra lại kết nối!`);
    });
}

window.loadSelectedLesson = loadSelectedLesson;
window.switchMainTab = switchMainTab;
window.toggleCurrentLessonCompleted = toggleCurrentLessonCompleted;
window.goToDrills = function() {
  stopAllAudio();
  showStep("drill");
  renderCurrentDrill();
};
window.playFullDialogue = playFullDialogue;
window.readGrammar = function() {
  if (lessonData && lessonData.grammarRules) {
    const rules = lessonData.grammarRules;
    const text = `${rules.summaryVi || ''} ${(rules.points || []).map(p => `${p.subject || ''}: ${p.toBe || p.rule || p.structure || ''}`).join('. ')}`;
    speakVi(text);
  }
};
window.backToSelect = function() {
  stopAllAudio();
  showStep("select");
};
window.startReviewQuiz = startReviewQuiz;
window.nextDrillMode = nextDrillMode;
window.prevDrillMode = prevDrillMode;
window.nextQuizQuestion = nextQuizQuestion;
window.quitReviewQuiz = function() {
  if (confirm("Bạn có chắc chắn muốn dừng bài ôn tập hiện tại?")) {
    clearInterval(quizTimerInterval);
    const activeView = document.getElementById("reviewQuizActiveView") || el.reviewQuizActiveView;
    const setupView = document.getElementById("reviewSetupView") || el.reviewSetupView;
    if (activeView) activeView.style.display = "none";
    if (setupView) setupView.style.display = "block";
  }
};
window.restartNewQuiz = function() {
  const resultView = document.getElementById("reviewResultView") || el.reviewResultView;
  const setupView = document.getElementById("reviewSetupView") || el.reviewSetupView;
  if (resultView) resultView.style.display = "none";
  if (setupView) setupView.style.display = "block";
};
window.restartCurrentLesson = function() {
  currentTargetIndex = 0;
  currentMode = 1;
  resetLessonTimer();
  showStep("drill");
  renderCurrentDrill();
};
window.nextLesson = function() {
  const sel = document.getElementById("lessonSelector") || el.lessonSelector;
  const currentVal = sel ? sel.value : "";
  const currIdx = LESSON_LIST.findIndex(item => item.file === currentVal);
  if (currIdx !== -1 && currIdx < LESSON_LIST.length - 1) {
    if (sel) sel.value = LESSON_LIST[currIdx + 1].file;
    loadSelectedLesson();
  } else {
    alert("Bạn đã học đến bài cuối cùng của khóa học!");
  }
};

function resetLessonTimer() {
  clearInterval(timerInterval);
  timeLeft = MAX_TIME_SECONDS;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("⏱️ Hết thời gian bài học!");
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  if (el.timeLeft) el.timeLeft.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function renderDialogueStep() {
  try {
    if (!lessonData) return;
    el.lessonTitle.textContent = lessonData.title || "Bài học tiếng Anh";
    if (el.dialogueSectionTitle) {
      el.dialogueSectionTitle.textContent = `🎙️ Hội thoại mở đầu: ${lessonData.openingDialogue ? lessonData.openingDialogue.title : ''}`;
    }

    // Dialogue lines
    const lines = (lessonData.openingDialogue && lessonData.openingDialogue.lines) || [];
    el.dialogueList.innerHTML = lines.map((line, idx) => {
      const isMale = line.gender === "male";
      const cardClass = isMale ? "speaker-male-card" : "speaker-female-card";
      const badgeClass = isMale ? "speaker-male" : "speaker-female";
      const icon = isMale ? "👨" : "👩";

      return `
        <div class="dialogue-item ${cardClass}" id="dialogue-line-${idx}">
          <span class="speaker-badge ${badgeClass}">${icon} ${line.speaker || 'Người nói'}</span>
          <div class="dialogue-en">${line.en || ''}</div>
          <div class="dialogue-vi">${line.vi || ''}</div>
          <div class="dialogue-actions">
            <button class="btn-outline-en" onclick="speakLineEn(${idx})" style="font-size:12px; padding:4px 8px;">🔊 Nghe EN</button>
            <button class="btn-outline-vi" onclick="speakLineVi(${idx})" style="font-size:12px; padding:4px 8px;">🔊 Nghe VI</button>
          </div>
        </div>
      `;
    }).join("");

    // Grammar Box
    if (lessonData.grammarRules) {
      const gr = lessonData.grammarRules;
      if (el.grammarBoxHeaderTitle) el.grammarBoxHeaderTitle.textContent = `💡 ${gr.title || 'Quy tắc ngữ pháp trọng tâm'}`;
      const points = gr.points || [];
      el.grammarContent.innerHTML = `
        <p style="margin-bottom:8px;"><strong>Tóm tắt:</strong> ${gr.summaryVi || ''}</p>
        <div class="grammar-grid">
          ${points.map(pt => {
            const ruleContent = String(pt.toBe || pt.rule || pt.structure || pt.formula || '').replace(/\n/g, '<br/>');
            const exampleContent = pt.example ? String(pt.example).replace(/\n/g, '<br/>') : '';
            return `
              <div class="grammar-item">
                <div style="font-weight:700; color:#1e40af; margin-bottom:4px;">${pt.subject || 'Quy tắc'}</div>
                <div style="font-size:13px; margin-bottom:4px;">${ruleContent}</div>
                ${exampleContent ? `<div style="font-size:12px; color:#15803d; font-style:italic;">VD: ${exampleContent}</div>` : ''}
              </div>
            `;
          }).join("")}
        </div>
      `;
    }
  } catch (err) {
    console.error("Error in renderDialogueStep:", err);
  }
}

window.speakLineEn = function(idx) {
  if (!lessonData || !lessonData.openingDialogue) return;
  const line = lessonData.openingDialogue.lines[idx];
  if (line) speakEn(line.en, line.gender);
};

window.speakLineVi = function(idx) {
  if (!lessonData || !lessonData.openingDialogue) return;
  const line = lessonData.openingDialogue.lines[idx];
  if (line) speakVi(line.vi);
};

function playFullDialogue() {
  if (!lessonData || !lessonData.openingDialogue) return;
  const lines = lessonData.openingDialogue.lines;
  if (!lines.length) return;

  isDialoguePlaying = true;
  dialoguePlaybackIndex = 0;
  if (el.btnPlayFullDialogue) el.btnPlayFullDialogue.textContent = "⏹ Dừng phát hội thoại";

  function playNext() {
    if (!isDialoguePlaying || dialoguePlaybackIndex >= lines.length) {
      stopAllAudio();
      return;
    }

    document.querySelectorAll(".dialogue-item").forEach(d => d.classList.remove("playing"));
    const currentCard = document.getElementById(`dialogue-line-${dialoguePlaybackIndex}`);
    if (currentCard) {
      currentCard.classList.add("playing");
      currentCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    const currentLine = lines[dialoguePlaybackIndex];
    speakEn(currentLine.en, currentLine.gender, () => {
      dialoguePlaybackIndex++;
      setTimeout(playNext, 600);
    });
  }

  playNext();
}

function getTargetData() {
  if (!lessonData || !lessonData.drillingTargets) return {};
  return lessonData.drillingTargets[currentTargetIndex] || {};
}

function renderCurrentDrill() {
  const target = getTargetData();
  if (!target || !target.drills) return;

  const totalTargets = lessonData.drillingTargets.length;
  el.targetCounter.textContent = `${currentTargetIndex + 1}/${totalTargets}`;
  el.targetEnText.textContent = target.baseEn;
  el.targetViText.textContent = target.baseVi;

  // Update stepper pills
  el.pills.forEach((p, idx) => {
    p.classList.remove("active");
    if (idx + 1 === currentMode) p.classList.add("active");
  });

  // Hide all mode containers
  el.containerMode1.style.display = "none";
  el.containerMode2.style.display = "none";
  el.containerMode3.style.display = "none";
  el.containerMode4.style.display = "none";
  el.containerMode5.style.display = "none";
  hideFeedback();
  el.btnNextDrillMode.style.display = "none";

  const d = target.drills;

  if (currentMode === 1) {
    el.containerMode1.style.display = "block";
    el.modeTitle.textContent = "Cấp độ 1: Nghe và nhắc lại";
    el.modePrompt.textContent = (d.mode1_repeat && d.mode1_repeat.promptVi) || "Hãy nghe và nói lại câu mẫu chính xác:";
    el.repeatScore.textContent = "—";
    el.liveSpeechStatus.textContent = "🎙️ Nhấn 'Nói ngay' và phát âm câu mẫu";
    if (el.repeatInputFallback) el.repeatInputFallback.value = "";
  } else if (currentMode === 2) {
    el.containerMode2.style.display = "block";
    el.modeTitle.textContent = "Cấp độ 2: Điền chỗ trống";
    el.modePrompt.textContent = (d.mode2_fill && d.mode2_fill.promptVi) || "Chọn từ thích hợp điền vào chỗ trống:";
    el.fillSentenceDisplay.innerHTML = (d.mode2_fill && d.mode2_fill.sentenceWithBlank.replace("___", '<span class="blank-input">___</span>')) || "";

    const options = (d.mode2_fill && d.mode2_fill.options) || [];
    el.fillOptionsGrid.innerHTML = options.map(opt => `
      <button class="chip-btn" onclick="checkFillOption('${opt.replace(/'/g, "\\'")}')">${opt}</button>
    `).join("");
  } else if (currentMode === 3) {
    el.containerMode3.style.display = "block";
    el.modeTitle.textContent = "Cấp độ 3: Sắp xếp câu";
    el.modePrompt.textContent = (d.mode3_scramble && d.mode3_scramble.promptVi) || "Nhấn vào các từ để ghép thành câu hoàn chỉnh:";
    initScrambleWords(d.mode3_scramble ? d.mode3_scramble.words : []);
  } else if (currentMode === 4) {
    el.containerMode4.style.display = "block";
    el.modeTitle.textContent = "Cấp độ 4: Biến đổi câu";
    el.modePrompt.textContent = (d.mode4_transform && d.mode4_transform.promptVi) || "Biến đổi câu theo yêu cầu:";
    el.transformInstruction.textContent = (d.mode4_transform && d.mode4_transform.instructionVi) || "";
    el.transformInput.value = "";
  } else if (currentMode === 5) {
    el.containerMode5.style.display = "block";
    el.modeTitle.textContent = "Cấp độ 5: Ngữ cảnh mới";
    el.modePrompt.textContent = (d.mode5_context && d.mode5_context.promptVi) || "Áp dụng cấu trúc vào ngữ cảnh mới:";
    el.contextInstruction.textContent = (d.mode5_context && d.mode5_context.instructionVi) || "";
    el.contextInput.value = "";
  }

  updateProgressFill();
}

function updateProgressFill() {
  if (!lessonData || !lessonData.drillingTargets) return;
  const total = lessonData.drillingTargets.length * 5;
  const current = (currentTargetIndex * 5) + currentMode;
  const pct = Math.round((current / total) * 100);
  if (el.progressFill) el.progressFill.style.width = `${pct}%`;
}

// Mode 2 Check
window.checkFillOption = function(selected) {
  const target = getTargetData();
  const correct = target.drills.mode2_fill.correctAnswer;
  if (selected.trim().toLowerCase() === correct.trim().toLowerCase()) {
    showFeedback(true, `🎉 Chính xác! Đáp án là "${correct}". ${target.drills.mode2_fill.explanationVi || ''}`);
    markDrillSuccess(2);
  } else {
    showFeedback(false, `Chưa chính xác. Hãy thử lại! Gợi ý: ${target.drills.mode2_fill.explanationVi || ''}`);
  }
};

// Mode 3 Scramble
function initScrambleWords(words) {
  scrambleSelectedWords = [];
  el.scrambleTarget.innerHTML = '<span style="color:#94a3b8; font-size:14px;">(Chạm vào các từ bên dưới)</span>';
  
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  el.scramblePool.innerHTML = shuffled.map((w, idx) => `
    <div class="word-block" id="word-${idx}" onclick="selectScrambleWord('${w.replace(/'/g, "\\'")}', this)">${w}</div>
  `).join("");
}

window.selectScrambleWord = function(word, btn) {
  if (btn.style.visibility === "hidden") return;
  btn.style.visibility = "hidden";
  scrambleSelectedWords.push({ word, btn });
  renderScrambleTarget();
};

function renderScrambleTarget() {
  if (!scrambleSelectedWords.length) {
    el.scrambleTarget.innerHTML = '<span style="color:#94a3b8; font-size:14px;">(Chạm vào các từ bên dưới)</span>';
    return;
  }
  el.scrambleTarget.innerHTML = scrambleSelectedWords.map((item, idx) => `
    <div class="word-block" onclick="removeScrambleWord(${idx})">${item.word}</div>
  `).join("");
}

window.removeScrambleWord = function(idx) {
  const item = scrambleSelectedWords.splice(idx, 1)[0];
  if (item && item.btn) item.btn.style.visibility = "visible";
  renderScrambleTarget();
};

function checkScramble() {
  const target = getTargetData();
  const correct = target.drills.mode3_scramble.correctSentence.trim().toLowerCase();
  const current = scrambleSelectedWords.map(i => i.word).join(" ").trim().toLowerCase();

  if (current === correct || calculateSimilarity(current, correct) >= 95) {
    showFeedback(true, `🎉 Chính xác! Câu hoàn chỉnh: "${target.drills.mode3_scramble.correctSentence}".`);
    markDrillSuccess(3);
  } else {
    showFeedback(false, `Chưa đúng trật tự từ. Thử lại hoặc bấm Làm lại!`);
  }
}

// Mode 4 Transform
function checkTransform() {
  const target = getTargetData();
  const correct = target.drills.mode4_transform.targetEn;
  const user = el.transformInput.value.trim();

  if (calculateSimilarity(user, correct) >= 80) {
    showFeedback(true, `🎉 Tuyệt vời! "${correct}".`);
    markDrillSuccess(4);
  } else {
    showFeedback(false, `Chưa đúng cấu trúc. Gợi ý: ${target.drills.mode4_transform.hintVi || ''}`);
  }
}

// Mode 5 Context
function checkContext() {
  const target = getTargetData();
  const correct = target.drills.mode5_context.targetEn;
  const user = el.contextInput.value.trim();

  if (calculateSimilarity(user, correct) >= 80) {
    showFeedback(true, `🎉 Hoàn hảo! "${correct}".`);
    markDrillSuccess(5);
  } else {
    showFeedback(false, `Chưa chính xác. Gợi ý: ${target.drills.mode5_context.hintVi || ''}`);
  }
}

function markDrillSuccess(mode) {
  if (el.pills[mode - 1]) el.pills[mode - 1].classList.add("completed");
  el.btnNextDrillMode.style.display = "inline-flex";
}

function nextDrillMode() {
  if (currentMode < 5) {
    currentMode++;
    renderCurrentDrill();
  } else {
    // Finish target
    const totalTargets = lessonData.drillingTargets.length;
    if (currentTargetIndex < totalTargets - 1) {
      currentTargetIndex++;
      currentMode = 1;
      renderCurrentDrill();
    } else {
      // Completed entire lesson!
      renderSummary();
      showStep("done");
    }
  }
}

function prevDrillMode() {
  if (currentMode > 1) {
    currentMode--;
    renderCurrentDrill();
  } else if (currentTargetIndex > 0) {
    currentTargetIndex--;
    currentMode = 5;
    renderCurrentDrill();
  }
}

function showFeedback(isSuccess, msg) {
  if (!el.feedbackMsg) return;
  el.feedbackMsg.className = `feedback-msg ${isSuccess ? 'success' : 'error'}`;
  el.feedbackMsg.textContent = msg;
}

function hideFeedback() {
  if (!el.feedbackMsg) return;
  el.feedbackMsg.style.display = "none";
}

// Summary Step
function renderSummary() {
  clearInterval(timerInterval);
  const timeSpentMinutes = Math.max(1, Math.floor((MAX_TIME_SECONDS - timeLeft) / 60));
  if (el.finalScoreText) {
    el.finalScoreText.textContent = `Bạn đã hoàn thành toàn bộ bài học "${lessonData.title}" trong ${timeSpentMinutes} phút! Đã chinh phục trọn vẹn 5 cấp độ phản xạ!`;
  }
  
  // Auto-mark completed lesson in localStorage
  if (el.lessonSelector.value) {
    markLessonCompleted(el.lessonSelector.value, true);
  }
}

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

// ==========================================
// 6. SMART REVIEW & 20-QUESTION QUIZ ENGINE (TAB 2)
// ==========================================
function startReviewQuiz() {
  stopAllAudio();
  const scopeEl = document.querySelector('input[name="reviewScope"]:checked');
  const countEl = document.querySelector('input[name="reviewCount"]:checked');
  const scope = scopeEl ? scopeEl.value : "completed";
  const count = countEl ? parseInt(countEl.value, 10) : 20;

  const completed = getCompletedLessons();
  let selectedLessonFiles = [];

  if (scope === "completed") {
    if (completed.length === 0) {
      // If no completed lessons, default to first 5 lessons for demo
      selectedLessonFiles = ["lesson-001.json", "lesson-002.json", "lesson-003.json", "lesson-004.json", "lesson-005.json"];
    } else {
      selectedLessonFiles = completed;
    }
  } else {
    // All 100 lessons
    selectedLessonFiles = LESSON_LIST.map(l => l.file);
  }

  // Fetch review questions from server endpoint
  const queryParam = selectedLessonFiles.join(",");
  fetch(`/api/review-pool?lessons=${encodeURIComponent(queryParam)}&count=${count}`)
    .then(r => {
      if (!r.ok) throw new Error("Could not load review pool");
      return r.json();
    })
    .then(data => {
      if (!data.questions || !data.questions.length) {
        alert("Không tìm thấy bài tập cho phạm vi đã chọn!");
        return;
      }
      initQuizState(data.questions, count);
    })
    .catch(err => {
      console.warn("Falling back to local exercise loading:", err);
      fallbackLoadReviewPool(selectedLessonFiles, count);
    });
}

function fallbackLoadReviewPool(lessonFiles, count) {
  // 1. Instant Offline / In-Memory Bundle Check
  if (window.HOCDRILL_EXERCISES) {
    let pool = [];
    lessonFiles.forEach(fn => {
      const pad = fn.replace(".json", "").replace("lesson-", "");
      const exKey = `exercise-${pad}.json`;
      if (window.HOCDRILL_EXERCISES[exKey] && window.HOCDRILL_EXERCISES[exKey].questions) {
        pool.push(...window.HOCDRILL_EXERCISES[exKey].questions);
      }
    });
    if (pool.length > 0) {
      pool.sort(() => Math.random() - 0.5);
      initQuizState(pool.slice(0, count), count);
      return;
    }
  }

  // 2. Network Fallback
  const base = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  const promises = lessonFiles.slice(0, 20).map(fn => {
    const pad = fn.replace(".json", "").replace("lesson-", "");
    const tryFetchEx = (url) => fetch(url).then(r => r.ok ? r.json() : Promise.reject());
    return tryFetchEx(`${base}data/exercises/exercise-${pad}.json`)
      .catch(() => tryFetchEx(`./data/exercises/exercise-${pad}.json`))
      .catch(() => tryFetchEx(`/data/exercises/exercise-${pad}.json`))
      .catch(() => tryFetchEx(`data/exercises/exercise-${pad}.json`))
      .catch(() => null);
  });

  Promise.all(promises).then(results => {
    let pool = [];
    results.forEach(res => {
      if (res && res.questions) pool.push(...res.questions);
    });

    if (!pool.length) {
      alert("Không tải được ngân hàng câu hỏi. Vui lòng kiểm tra lại!");
      return;
    }

    pool.sort(() => Math.random() - 0.5);
    initQuizState(pool.slice(0, count), count);
  });
}

function initQuizState(questions, totalCount) {
  quizQuestions = questions.slice(0, totalCount);
  currentQuizIdx = 0;
  quizScore = 0;
  quizUserAnswers = [];
  quizTimerSeconds = 0;

  clearInterval(quizTimerInterval);
  quizTimerInterval = setInterval(() => {
    quizTimerSeconds++;
    const m = Math.floor(quizTimerSeconds / 60);
    const s = quizTimerSeconds % 60;
    if (el.quizTimerText) {
      el.quizTimerText.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
  }, 1000);

  el.reviewSetupView.style.display = "none";
  el.reviewResultView.style.display = "none";
  el.reviewQuizActiveView.style.display = "block";

  renderQuizQuestion();
}

function renderQuizQuestion() {
  if (currentQuizIdx >= quizQuestions.length) {
    showQuizResults();
    return;
  }

  const q = quizQuestions[currentQuizIdx];
  const qNum = currentQuizIdx + 1;
  const total = quizQuestions.length;

  el.quizQuestionIdx.textContent = qNum;
  el.quizTotalQuestions.textContent = total;
  el.quizCurrentScore.textContent = `${quizScore} / ${currentQuizIdx}`;
  el.quizProgressBar.style.width = `${Math.round((qNum / total) * 100)}%`;

  el.quizFeedbackBox.style.display = "none";
  el.quizExplanationBox.style.display = "none";
  el.btnNextQuizQuestion.style.display = "none";

  // Badge mapping
  const typeMap = {
    multiple_choice: "🎯 Trắc nghiệm ngữ pháp",
    fill_blank: "✍️ Điền từ vào chỗ trống",
    sentence_scramble: "🧩 Sắp xếp câu hoàn chỉnh",
    find_error: "🔍 Nhận diện cấu trúc chuẩn",
    listening_reflex: "🎧 Nghe phản xạ & Dịch nghĩa",
    speaking_practice: "🎙️ Luyện nói qua Micro",
    reading_comprehension: "📖 Đọc hiểu đoạn văn"
  };
  el.quizTypeBadge.textContent = typeMap[q.type] || "🎯 Bài tập";

  el.quizPromptVi.textContent = q.promptVi || "Chọn hoặc điền câu trả lời chính xác:";

  // Audio prompt button for listening_reflex
  if (q.type === "listening_reflex" && q.audioPrompt) {
    el.btnQuizPlayAudioPrompt.style.display = "inline-flex";
    el.btnQuizPlayAudioPrompt.onclick = () => speakEn(q.audioPrompt, "female");
    // auto play audio prompt
    speakEn(q.audioPrompt, "female");
  } else {
    el.btnQuizPlayAudioPrompt.style.display = "none";
  }

  // Reading box
  if (q.type === "reading_comprehension" && q.passage) {
    el.quizReadingBox.style.display = "block";
    el.quizReadingPassageText.textContent = q.passage;
    el.btnReadQuizPassage.onclick = () => speakEn(q.passage.replace(/\n/g, ". "), "female");
  } else {
    el.quizReadingBox.style.display = "none";
  }

  el.quizQuestionText.textContent = q.question || q.promptVi || "";

  // Dynamic Question Content Renderer
  const container = el.quizAnswerDynamicArea;
  container.innerHTML = "";

  if (q.type === "multiple_choice" || q.type === "find_error" || q.type === "listening_reflex" || q.type === "reading_comprehension") {
    const opts = q.options || [];
    container.innerHTML = `
      <div class="options-grid">
        ${opts.map((opt, i) => `
          <button class="chip-btn" id="quiz-opt-${i}" onclick="selectQuizChoice('${opt.replace(/'/g, "\\'")}', this)">
            <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
          </button>
        `).join("")}
      </div>
    `;
  } else if (q.type === "fill_blank") {
    container.innerHTML = `
      <div style="display:flex; gap:10px; margin:16px 0; flex-wrap:wrap;">
        <input type="text" id="quizFillInput" placeholder="Nhập câu trả lời..." style="flex:1; padding:12px; font-size:16px; border-radius:10px; border:2px solid var(--border); outline:none;" />
        <button class="btn-primary" id="btnSubmitQuizFill" onclick="submitQuizFill()">Kiểm tra</button>
      </div>
    `;
  } else if (q.type === "sentence_scramble") {
    quizScrambleSelectedWords = [];
    const words = q.words || q.correctSentence.split(' ');
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="scramble-target" id="quizScrambleTarget">
        <span style="color:#94a3b8; font-size:14px;">(Chạm vào các từ bên dưới để ghép câu)</span>
      </div>
      <div class="scramble-pool" id="quizScramblePool">
        ${shuffled.map((w, idx) => `
          <div class="word-block" id="quiz-word-${idx}" onclick="selectQuizScrambleWord('${w.replace(/'/g, "\\'")}', this)">${w}</div>
        `).join("")}
      </div>
      <div style="text-align:center; margin-top:12px; display:flex; justify-content:center; gap:10px;">
        <button class="btn-secondary" onclick="resetQuizScramble()">🔄 Làm lại</button>
        <button class="btn-primary" onclick="submitQuizScramble()">✔️ Kiểm tra</button>
      </div>
    `;
  } else if (q.type === "speaking_practice") {
    container.innerHTML = `
      <div class="speaking-box">
        <div style="font-size:18px; font-weight:700; color:#7e22ce; margin-bottom:4px;">${q.targetSentence}</div>
        <div style="font-size:14px; color:var(--muted); margin-bottom:12px;">Dịch nghĩa: ${q.hintVi || ''}</div>
        
        <canvas id="waveCanvasQuizSpeaking" class="wave-canvas" width="600" height="60"></canvas>

        <div style="display:flex; justify-content:center; gap:10px; margin:12px 0; flex-wrap:wrap;">
          <button class="btn-outline-en" onclick="speakEn('${q.targetSentence.replace(/'/g, "\\'")}', 'female')">🔊 Nghe câu mẫu</button>
          <button class="btn-primary" id="btnQuizSpeakingMic" onclick="toggleQuizSpeakingRecording()">🎤 Bấm để Nói ngay</button>
        </div>

        <div id="quizSpeakingLiveText" style="text-align:center; font-size:14px; font-weight:600; color:var(--primary); min-height:22px;">
          🎙️ Bấm nút "Nói ngay" và phát âm câu mẫu
        </div>

        <div style="margin-top:10px; padding-top:10px; border-top:1px dashed var(--border);">
          <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">💡 Nhập văn bản dự phòng nếu không dùng Microphone:</div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="quizSpeakingFallbackInput" placeholder="Nhập câu tiếng Anh..." style="flex:1; padding:8px 12px; font-size:14px; border-radius:8px; border:1px solid var(--border); outline:none;" />
            <button class="btn-primary" onclick="submitQuizSpeakingFallback()" style="font-size:14px; padding:8px 16px;">Kiểm tra</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Choice submission
window.selectQuizChoice = function(selected, btnEl) {
  const q = quizQuestions[currentQuizIdx];
  const isCorrect = selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

  // Disable all option buttons
  document.querySelectorAll("#quizAnswerDynamicArea .chip-btn").forEach(b => {
    b.disabled = true;
    if (b.textContent.includes(q.correctAnswer)) b.classList.add("correct");
  });

  if (isCorrect) {
    btnEl.classList.add("correct");
    handleQuizEvaluation(true, selected);
  } else {
    btnEl.classList.add("wrong");
    handleQuizEvaluation(false, selected);
  }
};

// Fill submission
window.submitQuizFill = function() {
  const inputEl = document.getElementById("quizFillInput");
  if (!inputEl) return;
  const user = inputEl.value.trim();
  const q = quizQuestions[currentQuizIdx];
  const isCorrect = user.toLowerCase() === q.correctAnswer.trim().toLowerCase();
  
  inputEl.disabled = true;
  document.getElementById("btnSubmitQuizFill").disabled = true;
  handleQuizEvaluation(isCorrect, user);
};

// Scramble selection
window.selectQuizScrambleWord = function(word, btn) {
  if (btn.style.visibility === "hidden") return;
  btn.style.visibility = "hidden";
  quizScrambleSelectedWords.push({ word, btn });
  renderQuizScrambleTarget();
};

function renderQuizScrambleTarget() {
  const targetEl = document.getElementById("quizScrambleTarget");
  if (!targetEl) return;
  if (!quizScrambleSelectedWords.length) {
    targetEl.innerHTML = '<span style="color:#94a3b8; font-size:14px;">(Chạm vào các từ bên dưới để ghép câu)</span>';
    return;
  }
  targetEl.innerHTML = quizScrambleSelectedWords.map((item, idx) => `
    <div class="word-block" onclick="removeQuizScrambleWord(${idx})">${item.word}</div>
  `).join("");
}

window.removeQuizScrambleWord = function(idx) {
  const item = quizScrambleSelectedWords.splice(idx, 1)[0];
  if (item && item.btn) item.btn.style.visibility = "visible";
  renderQuizScrambleTarget();
};

window.resetQuizScramble = function() {
  const q = quizQuestions[currentQuizIdx];
  quizScrambleSelectedWords = [];
  const words = q.words || q.correctSentence.split(' ');
  const shuffled = [...words].sort(() => Math.random() - 0.5);

  document.getElementById("quizScrambleTarget").innerHTML = '<span style="color:#94a3b8; font-size:14px;">(Chạm vào các từ bên dưới)</span>';
  document.getElementById("quizScramblePool").innerHTML = shuffled.map((w, idx) => `
    <div class="word-block" id="quiz-word-${idx}" onclick="selectQuizScrambleWord('${w.replace(/'/g, "\\'")}', this)">${w}</div>
  `).join("");
};

window.submitQuizScramble = function() {
  const q = quizQuestions[currentQuizIdx];
  const current = quizScrambleSelectedWords.map(i => i.word).join(" ").trim();
  const isCorrect = current.toLowerCase() === q.correctSentence.trim().toLowerCase() || calculateSimilarity(current, q.correctSentence) >= 95;
  handleQuizEvaluation(isCorrect, current);
};

// Speaking toggle
window.toggleQuizSpeakingRecording = function() {
  if (quizIsRecordingSpeaking) {
    stopRecording();
  } else {
    quizIsRecordingSpeaking = true;
    const btn = document.getElementById("btnQuizSpeakingMic");
    if (btn) btn.classList.add("recording");
    startRecording("waveCanvasQuizSpeaking");
    const status = document.getElementById("quizSpeakingLiveText");
    if (status) status.textContent = "🎙️ Đang nghe... Hãy phát âm câu tiếng Anh của bạn!";
  }
};

function evaluateQuizSpeakingSpeech(transcript) {
  stopRecording();
  const q = quizQuestions[currentQuizIdx];
  const target = q.targetSentence;
  const score = calculateSimilarity(transcript, target);

  const status = document.getElementById("quizSpeakingLiveText");
  if (status) status.textContent = `Bạn đã nói: "${transcript}" (Độ tương đồng: ${score}%)`;

  const isCorrect = score >= 70;
  handleQuizEvaluation(isCorrect, `${transcript} (${score}%)`);
}

window.submitQuizSpeakingFallback = function() {
  const input = document.getElementById("quizSpeakingFallbackInput");
  if (!input) return;
  const user = input.value.trim();
  const q = quizQuestions[currentQuizIdx];
  const score = calculateSimilarity(user, q.targetSentence);
  handleQuizEvaluation(score >= 70, `${user} (${score}%)`);
};

// Common Evaluation Handler
function handleQuizEvaluation(isCorrect, userAns) {
  const q = quizQuestions[currentQuizIdx];
  if (isCorrect) quizScore++;

  quizUserAnswers.push({
    question: q.question || q.promptVi,
    userAnswer: userAns,
    correctAnswer: q.correctAnswer || q.correctSentence || q.targetSentence,
    explanationVi: q.explanationVi,
    isCorrect: isCorrect
  });

  el.quizCurrentScore.textContent = `${quizScore} / ${currentQuizIdx + 1}`;

  el.quizFeedbackBox.style.display = "block";
  el.quizFeedbackBox.className = `feedback-msg ${isCorrect ? 'success' : 'error'}`;
  el.quizFeedbackBox.textContent = isCorrect ? "🎉 Chính xác!" : "❌ Chưa chính xác!";

  if (q.explanationVi) {
    el.quizExplanationBox.style.display = "block";
    el.quizExplanationBox.innerHTML = `<strong>💡 Giải thích chi tiết:</strong> ${q.explanationVi}`;
  }

  el.btnNextQuizQuestion.style.display = "inline-flex";
}

function nextQuizQuestion() {
  currentQuizIdx++;
  renderQuizQuestion();
}

function showQuizResults() {
  clearInterval(quizTimerInterval);
  el.reviewQuizActiveView.style.display = "none";
  el.reviewResultView.style.display = "block";

  const total = quizQuestions.length;
  const pct = Math.round((quizScore / total) * 100);
  const m = Math.floor(quizTimerSeconds / 60);
  const s = quizTimerSeconds % 60;
  const timeStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  el.resScoreText.textContent = `${quizScore} / ${total}`;
  el.resPercentText.textContent = `${pct}%`;
  el.resPercentText.style.color = pct >= 80 ? "#16a34a" : (pct >= 50 ? "#d97706" : "#dc2626");
  el.resTimeSpentText.textContent = timeStr;

  if (pct >= 90) {
    el.resGradeBadge.textContent = "🏆 Xuất sắc";
    el.resGradeBadge.style.color = "#16a34a";
  } else if (pct >= 75) {
    el.resGradeBadge.textContent = "⭐ Rất Tốt";
    el.resGradeBadge.style.color = "#2563eb";
  } else if (pct >= 50) {
    el.resGradeBadge.textContent = "👍 Đạt Yêu Cầu";
    el.resGradeBadge.style.color = "#d97706";
  } else {
    el.resGradeBadge.textContent = "💡 Cần Ôn Lại";
    el.resGradeBadge.style.color = "#dc2626";
  }

  // Render Detailed Review Breakdown
  el.quizDetailedBreakdownList.innerHTML = quizUserAnswers.map((item, idx) => `
    <div class="review-item-card ${item.isCorrect ? 'is-correct' : 'is-wrong'}">
      <div style="font-weight:700; font-size:15px; margin-bottom:4px; color:#0f172a;">
        Câu ${idx + 1}: ${item.question}
      </div>
      <div style="font-size:14px; margin-bottom:2px;">
        <strong>Câu trả lời của bạn:</strong> 
        <span style="color:${item.isCorrect ? '#16a34a' : '#dc2626'}; font-weight:600;">${item.userAnswer}</span>
      </div>
      ${!item.isCorrect ? `
        <div style="font-size:14px; margin-bottom:4px;">
          <strong>Đáp án đúng:</strong> <span style="color:#16a34a; font-weight:700;">${item.correctAnswer}</span>
        </div>
      ` : ''}
      <div style="font-size:13px; color:#475569; margin-top:6px; background:#f1f5f9; padding:6px 10px; border-radius:6px;">
        💡 ${item.explanationVi}
      </div>
    </div>
  `).join("");
}

// ==========================================
// 7. INITIALIZATION & EVENT BINDINGS
// ==========================================
function init() {
  initVoices();
  populateLessonSelector(true);
  updateOverallProgressUI();
  initSpeechRecognition();
  bindEvents();
  initSpeedControls();
}

function initSpeedControls() {
  document.querySelectorAll(".speed-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSpeechRate = parseFloat(btn.getAttribute("data-speed"));
    });
  });
}

function bindEvents() {
  // Main tab switching
  el.tabBtnLessons.addEventListener("click", () => switchMainTab("lessons"));
  el.tabBtnReview.addEventListener("click", () => switchMainTab("review"));
  el.btnJumpToReviewFromLesson.addEventListener("click", () => switchMainTab("review"));
  el.btnGoToReviewAfterDone.addEventListener("click", () => switchMainTab("review"));
  el.btnBackToLessonTab.addEventListener("click", () => switchMainTab("lessons"));

  // Toggle lesson completed status
  el.btnToggleCurrentCompleted.addEventListener("click", toggleCurrentLessonCompleted);

  // Lesson selector change updates toggle button
  el.lessonSelector.addEventListener("change", () => {
    updateOverallProgressUI();
  });

  // Lesson Tab events
  el.btnLoadLesson.addEventListener("click", loadSelectedLesson);
  el.btnBackToSelectFromDialogue.addEventListener("click", () => {
    stopAllAudio();
    showStep("select");
  });

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
      const text = `${rules.summaryVi || ''} ${(rules.points || []).map(p => `${p.subject || ''}: ${p.toBe || p.rule || p.structure || ''}`).join('. ')}`;
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

  el.btnRestartCurrentLesson.addEventListener("click", () => {
    currentTargetIndex = 0;
    currentMode = 1;
    resetLessonTimer();
    showStep("drill");
    renderCurrentDrill();
  });

  el.btnNextLesson.addEventListener("click", () => {
    const currentVal = el.lessonSelector.value;
    const currIdx = LESSON_LIST.findIndex(item => item.file === currentVal);
    if (currIdx !== -1 && currIdx < LESSON_LIST.length - 1) {
      el.lessonSelector.value = LESSON_LIST[currIdx + 1].file;
      loadSelectedLesson();
    } else {
      alert("Bạn đã học đến bài cuối cùng của khóa học!");
    }
  });

  // Drill Mode 1 (Repeat)
  el.btnAudioRepeat.addEventListener("click", () => {
    const target = getTargetData();
    speakEn(target.baseEn, "female");
  });

  el.btnAudioRepeatVi.addEventListener("click", () => {
    const target = getTargetData();
    speakVi(target.baseVi);
  });

  el.btnMicRepeat.addEventListener("click", () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording("waveCanvasRepeat");
    }
  });

  if (el.btnCheckRepeatText) {
    el.btnCheckRepeatText.addEventListener("click", () => {
      const val = el.repeatInputFallback.value.trim();
      if (!val) return;
      handleSpeechResult(val);
    });
  }

  // Drill Mode 3 (Scramble)
  el.btnResetScramble.addEventListener("click", () => {
    const target = getTargetData();
    initScrambleWords(target.drills.mode3_scramble.words);
  });

  el.btnCheckScramble.addEventListener("click", checkScramble);

  // Drill Mode 4 (Transform)
  el.btnCheckTransform.addEventListener("click", checkTransform);
  el.btnMicTransform.addEventListener("click", () => {
    if (isRecording) stopRecording();
    else startRecording("waveCanvasRepeat");
  });

  // Drill Mode 5 (Context)
  el.btnCheckContext.addEventListener("click", checkContext);
  el.btnMicContext.addEventListener("click", () => {
    if (isRecording) stopRecording();
    else startRecording("waveCanvasRepeat");
  });

  // Review / Quiz Tab Events
  el.btnStartReviewQuiz.addEventListener("click", startReviewQuiz);
  el.btnNextQuizQuestion.addEventListener("click", nextQuizQuestion);
  el.btnQuitReviewQuiz.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn dừng bài ôn tập hiện tại?")) {
      clearInterval(quizTimerInterval);
      el.reviewQuizActiveView.style.display = "none";
      el.reviewSetupView.style.display = "block";
    }
  });
  el.btnRestartNewQuiz.addEventListener("click", () => {
    el.reviewResultView.style.display = "none";
    el.reviewSetupView.style.display = "block";
  });
}

// Start app safely on DOM ready or immediate
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
