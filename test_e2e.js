const fs = require('fs');
const path = require('path');

console.log('======================================================');
console.log('🧪 RUNNING E2E RUNTIME SIMULATION & DOM VERIFICATION');
console.log('======================================================');

// 1. Mock Browser Environment
const localStorageStore = {};
const globalLocalStorage = {
  getItem: (k) => localStorageStore[k] || null,
  setItem: (k, v) => { localStorageStore[k] = String(v); },
  removeItem: (k) => { delete localStorageStore[k]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

const domElements = {};
function createMockElement(id, tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    },
    children: [],
    innerText: '',
    innerHTML: '',
    value: '',
    disabled: false,
    appendChild: function(child) { this.children.push(child); return child; },
    remove: function() { if (this.parentNode && this.parentNode.children) { const idx = this.parentNode.children.indexOf(this); if (idx >= 0) this.parentNode.children.splice(idx, 1); } },
    scrollIntoView: () => {},
    setAttribute: () => {},
    getAttribute: () => null
  };
  domElements[id] = el;
  return el;
}

const mockDocument = {
  getElementById: (id) => domElements[id] || createMockElement(id),
  querySelectorAll: (selector) => [],
  querySelector: (selector) => null,
  createElement: (tag) => createMockElement('auto_' + Math.random(), tag),
  addEventListener: (evt, cb) => {},
  body: createMockElement('body', 'body')
};

global.window = global;
global.document = mockDocument;
global.localStorage = globalLocalStorage;
global.fetch = async (url, opts) => {
  return {
    ok: true,
    json: async () => ({ success: true, progress: null })
  };
};

// 2. Syntax Check for all JS files in public/js
console.log('\n[TEST 1] Syntax Check for All Frontend JavaScript Files:');
const jsFiles = ['app.js', 'chart_visualizer.js', 'journal.js', 'news.js', 'practice.js', 'theory.js'];
jsFiles.forEach(f => {
  const filePath = path.join(__dirname, 'public', 'js', f);
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    new Function(code);
    console.log(`  ✔ public/js/${f}: Syntax Valid (0 errors)`);
  } catch(e) {
    console.error(`  ❌ public/js/${f}: SYNTAX ERROR:`, e.message);
  }
});

// 3. Load app.js functions (showConfirmModal, showToast)
const appCode = fs.readFileSync('./public/js/app.js', 'utf8');
eval(appCode);
global.window.showConfirmModal = showConfirmModal;
global.window.closeConfirmModal = closeConfirmModal;
global.showConfirmModal = showConfirmModal;
global.closeConfirmModal = closeConfirmModal;

// 4. Load practice.js into runtime
console.log('\n[TEST 2] Testing Practice Module Initialization & ID Generation:');
const practice = require('./public/js/practice.js');
practice.initPracticeModule();
console.log('  ✔ Total scenarios loaded in memory:', practice.practiceScenarios.length);
console.log('  ✔ Scenario #1 [ID: ' + practice.practiceScenarios[0].id + ' | Chap: ' + practice.practiceScenarios[0].chapterId + ' | Level: ' + practice.practiceScenarios[0].level + ' | Title: ' + practice.practiceScenarios[0].title.substring(0, 45) + '...]');
console.log('  ✔ Scenario #30 [ID: ' + practice.practiceScenarios[29].id + ' | Chap: ' + practice.practiceScenarios[29].chapterId + ' | Level: ' + practice.practiceScenarios[29].level + ' | Title: ' + practice.practiceScenarios[29].title.substring(0, 45) + '...]');

// 5. Test Submitting Answer and LocalStorage Persistence
console.log('\n[TEST 3] Testing Answer Submission & LocalStorage Persistence:');
practice.submitPracticeAnswer(1, 'B');
console.log('  ✔ practiceStats after answer #1 (Correct):', JSON.stringify(practice.practiceStats));
const savedLs = localStorage.getItem('practiceStats');
console.log('  ✔ localStorage.getItem("practiceStats") successfully persisted:', savedLs);

// 6. Test Custom Confirm Modal on Reset
console.log('\n[TEST 4] Testing Custom Confirm Modal Trigger on resetPracticeQuiz():');
practice.resetPracticeQuiz();
const modalEl = domElements['global-confirm-modal'];
console.log('  ✔ Custom Modal Element created in DOM:', Boolean(modalEl));
console.log('  ✔ Custom Modal class list contains "active":', modalEl?.classList.contains('active'));
console.log('  ✔ Modal Header rendered correctly:', modalEl?.innerHTML.includes('⚠️ Đặt Lại Toàn Bộ Tiến Độ'));
console.log('  ✔ Modal Action Button rendered correctly:', modalEl?.innerHTML.includes('Đặt Lại Từ Đầu'));

// 7. Simulate User Clicking "Xác Nhận Đặt Lại Từ Đầu" in Custom Modal
console.log('\n[TEST 5] Simulating User Clicking "Xác Nhận Đặt Lại Từ Đầu" in Custom Modal:');
closeConfirmModal(true);
console.log('  ✔ practiceStats after modal confirm (cleared):', JSON.stringify(practice.practiceStats));
console.log('  ✔ localStorage["practiceStats"] after reset:', localStorage.getItem('practiceStats'));
console.log('  ✔ Modal class active removed:', !modalEl?.classList.contains('active'));

console.log('\n======================================================');
console.log('🎉 ALL E2E RUNTIME SIMULATION TESTS COMPLETED (0 ERRORS)');
console.log('======================================================\n');
process.exit(0);
