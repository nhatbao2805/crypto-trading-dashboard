const theoryController = require('./server/controllers/theory.controller');
const theoryManager = require('./theory_manager');

console.log('--- 1. Testing loadTheoryData() ---');
const data = theoryManager.loadTheoryData();
console.log('Total Chapters:', data.totalChapters);
console.log('Chapters list:', data.chapters.map(c => ({ id: c.id, title: c.title.slice(0, 40) })));

console.log('\n--- 2. Testing getChapterById for all 12 chapters ---');
for (let id = 1; id <= 12; id++) {
  let resData = null;
  let resStatus = 200;
  const mockRes = {
    status(code) { resStatus = code; return this; },
    json(obj) { resData = obj; return this; }
  };

  theoryController.getChapterById({}, mockRes, { id: id.toString() });
  if (resStatus !== 200 || !resData || !resData.title) {
    console.error(`❌ Chapter ${id} FAILED:`, resStatus, resData);
  } else {
    console.log(`✅ Chapter ${id}: [${resData.title.slice(0, 45)}...] (${resData.content.length} chars, ${resData.sections.length} sections)`);
  }
}

console.log('\n--- 3. Testing getTheoryData ---');
let theoryAllData = null;
const mockResAll = {
  status(code) { return this; },
  json(obj) { theoryAllData = obj; return this; }
};
theoryController.getTheoryData({}, mockResAll);
console.log('getTheoryData result totalChapters:', theoryAllData.totalChapters);
console.log('Glossary count:', theoryAllData.glossary.length);
