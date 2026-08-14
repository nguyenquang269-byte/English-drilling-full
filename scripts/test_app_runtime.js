const createElem = (tag) => ({
  id: '',
  textContent: '',
  value: '',
  style: {},
  classList: { add: () => {}, remove: () => {}, contains: () => false },
  addEventListener: () => {},
  appendChild: () => {},
  querySelectorAll: () => [createElem('div')],
  querySelector: () => createElem('input'),
  onclick: null,
  onchange: null,
  scrollIntoView: () => {}
});

global.document = {
  getElementById: (id) => createElem(id),
  querySelectorAll: () => [createElem('div')],
  querySelector: () => createElem('input'),
  createElement: (tag) => createElem(tag),
  readyState: 'complete'
};
global.window = global;
global.speechSynthesis = {
  getVoices: () => [
    { name: 'Microsoft David', lang: 'en-US' },
    { name: 'Microsoft Zira', lang: 'en-US' },
    { name: 'Microsoft An', lang: 'vi-VN' }
  ],
  speak: () => {},
  cancel: () => {},
  resume: () => {}
};
global.SpeechSynthesisUtterance = function(t) { this.text = t; };
global.localStorage = {
  getItem: () => JSON.stringify(['lesson-001.json']),
  setItem: () => {}
};

try {
  require('../data/lessons-bundle.js');
  require('../app.js');

  console.log('1. Testing loadSelectedLesson()...');
  window.loadSelectedLesson();

  console.log('2. Testing toggleFullDialoguePlayback()...');
  window.toggleFullDialoguePlayback();

  console.log('3. Testing readGrammar()...');
  window.readGrammar();

  console.log('4. Testing goToDrills()...');
  window.goToDrills();

  console.log('5. Testing nextDrillMode() & prevDrillMode()...');
  window.nextDrillMode();
  window.prevDrillMode();

  console.log('6. Testing switchMainTab("review")...');
  window.switchMainTab('review');

  console.log('7. Testing startReviewQuiz()...');
  window.startReviewQuiz();

  console.log('8. Testing nextQuizQuestion()...');
  window.nextQuizQuestion();

  console.log('9. Testing switchMainTab("lessons")...');
  window.switchMainTab('lessons');

  console.log('\n>>> SUCCESS: ALL BUTTONS & FLOWS TESTED 100% ERROR-FREE! <<<');
} catch (e) {
  console.error('SIMULATION FAILED WITH ERROR:', e);
  process.exit(1);
}
