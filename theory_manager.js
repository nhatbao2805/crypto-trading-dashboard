const fs = require('node:fs');
const path = require('node:path');

function getHandbookPath() {
  const p1 = path.join(__dirname, 'Cam_Nang_Crypto_Toan_Tap_Cho_Nguoi_Moi.md');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(__dirname, 'README.md');
  if (fs.existsSync(p2)) return p2;
  return null;
}

function loadTheoryData() {
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

  return {
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
}

module.exports = {
  loadTheoryData
};
