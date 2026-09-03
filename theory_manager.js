const fs = require('node:fs');
const path = require('node:path');

let cachedTheoryData = null;

function getHandbookPath() {
  const candidates = [
    path.join(__dirname, 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'),
    path.join(process.cwd(), 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'),
    path.join(__dirname, '..', 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md'),
    path.join(__dirname, 'README.md'),
    path.join(process.cwd(), 'README.md')
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function loadTheoryData(forceReload = false) {
  if (cachedTheoryData && !forceReload) {
    return cachedTheoryData;
  }

  const mdPath = getHandbookPath();
  if (!mdPath) {
    return { error: 'Handbook markdown file not found' };
  }

  const raw = fs.readFileSync(mdPath, 'utf8');
  const lines = raw.split('\n');
  const chapters = [];
  let currentChapter = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const chapterMatch = line.match(/^#\s+(CHƯƠNG\s+\d+[:\s].*)$/i);
    
    if (chapterMatch) {
      if (currentChapter) {
        chapters.push(currentChapter);
      }
      currentChapter = {
        id: chapters.length + 1,
        title: chapterMatch[1].trim(),
        content: line + '\n',
        sections: []
      };
    } else if (currentChapter) {
      currentChapter.content += line + '\n';
      const sectionMatch = line.match(/^##\s+(\d+\.\d+\.?\s+.*)$/);
      if (sectionMatch) {
        currentChapter.sections.push({
          title: sectionMatch[1].trim(),
          lineNumber: i + 1
        });
      }
    }
  }

  if (currentChapter) {
    chapters.push(currentChapter);
  }

  // Pre-extract Glossary from chapter containing "TỪ ĐIỂN"
  const glossary = [];
  const dictChap = chapters.find(c => c.title.includes('TỪ ĐIỂN'));
  if (dictChap) {
    const dictLines = dictChap.content.split('\n');
    for (const l of dictLines) {
      const parts = l.split('|').map(s => s.trim()).filter(Boolean);
      if (parts.length >= 3 && !parts[0].includes('---') && !parts[0].includes('Thuật Ngữ')) {
        const term = parts[0].replace(/\*\*/g, '').trim();
        const origin = parts[1].trim();
        const desc = parts[2].trim();
        if (term) {
          glossary.push({ term, origin, desc });
        }
      }
    }
  }

  cachedTheoryData = {
    totalChapters: chapters.length,
    chapters: chapters.map(c => ({
      id: c.id,
      title: c.title,
      sectionCount: c.sections.length,
      sections: c.sections,
      charCount: c.content.length
    })),
    rawChapters: chapters,
    glossary
  };

  return cachedTheoryData;
}

module.exports = {
  loadTheoryData
};
