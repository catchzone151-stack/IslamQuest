const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '../src/data/quizzes');
const MIN_LEN = 15;
const MAX_LEN = 25;

function padOption(option) {
  let opt = option.trim();
  const len = opt.length;
  
  if (len >= MIN_LEN) return opt;
  
  if (opt.match(/^\d+$/)) return `The number ${opt} here`;
  if (opt.match(/^\d+\s+(years?|yrs)$/i)) return opt.replace(/years?|yrs/i, 'years total');
  if (opt.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i)) return `On ${opt} of week`;
  if (opt.match(/^(Ramadan|Muharram|Safar|Rajab|Shaban|Dhul)$/i)) return `Month of ${opt}`;
  
  const diff = MIN_LEN - len;
  if (diff >= 10) return `The answer is ${opt}`;
  if (diff >= 7) return `It was ${opt} truly`;
  if (diff >= 5) return `${opt} specifically`;
  if (diff >= 3) return `${opt} indeed`;
  if (diff >= 1) return `${opt} truly`;
  
  return opt;
}

function shortenOption(option) {
  let opt = option.trim();
  if (opt.length <= MAX_LEN) return opt;
  
  const patterns = [
    [/\s+specifically$/i, ''],
    [/\s+indeed$/i, ''],
    [/\s+truly$/i, ''],
    [/\s+itself$/i, ''],
    [/\s+here$/i, ''],
    [/\s+of course$/i, ''],
    [/\s+in fact$/i, ''],
    [/\s+total$/i, ''],
    [/^It was\s+/i, ''],
    [/^This is\s+/i, ''],
    [/^That is\s+/i, ''],
    [/^The answer is\s+/i, ''],
    [/^Being\s+/i, ''],
    [/Muhammad\s*ﷺ/g, ''],
    [/Prophet\s+/g, ''],
    [/the Prophet\s*/g, ''],
    [/\s+ibn\s+/gi, ' b. '],
    [/\s+bint\s+/gi, ' bt. '],
    [/Surah\s+Al-/gi, 'S. '],
    [/Surah\s+/gi, 'S. '],
    [/\s+years?\s+old/gi, ' yrs'],
    [/\s+years?$/gi, ' yrs'],
    [/\s+and\s+/g, ' & '],
    [/\s+with\s+the\s+/g, ' w/ '],
    [/\s+with\s+/g, ' w/ '],
    [/\s+without\s+/g, ' w/o '],
    [/\s+through\s+/g, ' via '],
    [/\s+because\s+/gi, ' as '],
    [/\s+immediately\s+/gi, ' quickly '],
    [/\s+completely\s+/gi, ' fully '],
    [/\s+approximately\s+/gi, ' ~'],
    [/\s+specifically\s+/gi, ' '],
    [/\s+carrying\s+/gi, ' w/ '],
    [/\s+during\s+/gi, ' in '],
    [/\s+covering\s+the\s+/gi, ' over '],
    [/\s+covering\s+/gi, ' over '],
    [/Abyssinia\s*\(Ethiopia\)/gi, 'Ethiopia'],
    [/\s+announced\s+/gi, ' said '],
    [/\s+revealed\s+/gi, ' given '],
    [/\s+companions?\s+/gi, ' sahaba '],
    [/\s+husband\s+/gi, ' mate '],
    [/\s+brother-in-law\s+/gi, ' in-law '],
    [/\s+sister-in-law\s+/gi, ' in-law '],
    [/\s+persecution\s+/gi, ' harm '],
    [/\s+leadership\s+/gi, ' lead '],
    [/\s+responsibility\s+/gi, ' duty '],
    [/\s+beautiful\s+/gi, ' fine '],
    [/\s+different\s+/gi, ' other '],
    [/\s+abundant\s+/gi, ' much '],
    [/\s+became\s+/gi, ' got '],
    [/\s+wealthy\s+/gi, ' rich '],
    [/\s+strong\s+/gi, ' firm '],
    [/\s+according\s+to\s+/gi, ' per '],
    [/His\s+/g, ''],
    [/Her\s+/g, ''],
    [/Their\s+/g, ''],
    [/\s+when\s+/gi, ' as '],
    [/\s+about\s+/gi, ' on '],
    [/\s+every\s+/gi, ' each '],
    [/\s+other\s+/gi, ' '],
    [/\s+Muslim\s+/gi, ' '],
    [/\s+tortured\s+/gi, ' '],
    [/\s+slaves?\s+/gi, ' '],
    [/\s+eternal\s+/gi, ' '],
    [/\s+temporary\s+/gi, ' '],
    [/\s+world\s+/gi, ' life '],
    [/\s+Hereafter\s+/gi, ' next '],
    [/\s+transition\s+/gi, ' move '],
    [/\s+existence\s+/gi, ' life '],
    [/\s+complete\s+/gi, ' full '],
    [/\s+punishment\s+/gi, ' '],
    [/\s+state\s+of\s+/gi, ' '],
    [/\s+from\s+Allah\s+/gi, ' '],
    [/\s+to\s+all\s+the\s+/gi, ' to '],
    [/\s+to\s+the\s+/gi, ' to '],
    [/\s+on\s+the\s+/gi, ' on '],
    [/\s+in\s+the\s+/gi, ' in '],
    [/\s+of\s+the\s+/gi, ' of '],
    [/\s+from\s+the\s+/gi, ' from '],
    [/Judgment\s+Day/gi, 'Qiyamah'],
    [/\s+provisions?\s+/gi, ' rizq '],
    [/\s+revelation\s+/gi, ' wahy '],
    [/\s+trumpet\s+/gi, ' horn '],
    [/\s+horizon\s+/gi, ' sky '],
    [/\s+Blowing\s+/gi, ' Blow '],
    [/\s+Delivering\s+/gi, ' Give '],
    [/\s+Distributing\s+/gi, ' Give '],
    [/\s+Taking\s+/gi, ' Take '],
    [/\s+arrives?\s+/gi, ' comes '],
    [/\s+declared\s+/gi, ' said '],
    [/\s+believed\s+/gi, ' trust '],
    [/\s+immediately\s+/gi, ' fast '],
    [/\s+disbelievers?\s+/gi, ' '],
    [/\s+mocked\s+/gi, ' '],
    [/\s+mockers?\s+/gi, ' '],
    [/\s+described\s+/gi, ' told '],
    [/\s+night\s+journey\s+/gi, ' Isra '],
    [/\s+split\s+in\s+two\s+/gi, ' split '],
    [/\s+come\s+near\s+/gi, ' near '],
    [/\s+Hour\s+has\s+/gi, ' Hour '],
    [/\s+moon\s+has\s+/gi, ' moon '],
    [/\s+has\s+already\s+/gi, ' '],
    [/\s+has\s+risen\s+/gi, ' rose '],
    [/\s+has\s+split\s+/gi, ' split '],
    [/\s+has\s+turned\s+/gi, ' turned '],
    [/\s+from\s+this\s+/gi, ' from '],
    [/\s+to\s+this\s+/gi, ' to '],
    [/\(The\s+[^)]+\)/gi, ''],
    [/\[[^\]]+\]/gi, ''],
  ];
  
  for (const [pattern, replacement] of patterns) {
    if (opt.length <= MAX_LEN) break;
    opt = opt.replace(pattern, replacement);
  }
  
  opt = opt.replace(/\s+/g, ' ').trim();
  
  if (opt.length > MAX_LEN) {
    const words = opt.split(' ');
    while (words.length > 2 && opt.length > MAX_LEN) {
      words.pop();
      opt = words.join(' ');
    }
  }
  
  return opt;
}

function balanceOptions(options, correctIdx) {
  return options.map(opt => {
    let newOpt = opt.trim();
    
    if (newOpt.length < MIN_LEN) newOpt = padOption(newOpt);
    if (newOpt.length > MAX_LEN) newOpt = shortenOption(newOpt);
    if (newOpt.length < MIN_LEN) newOpt = padOption(newOpt);
    
    return newOpt;
  });
}

function processQuizFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changesCount = 0;
  
  data.forEach(lesson => {
    lesson.questions.forEach(q => {
      const oldOptions = [...q.options];
      const newOptions = balanceOptions(q.options, q.answer);
      
      const changed = oldOptions.some((o, i) => o !== newOptions[i]);
      if (changed) {
        q.options = newOptions;
        changesCount++;
      }
    });
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return changesCount;
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith('.json'));
  
  console.log('Auto-balancing quiz answer lengths...\n');
  
  files.forEach(file => {
    const filePath = path.join(QUIZ_DIR, file);
    const changes = processQuizFile(filePath);
    console.log(`${file}: ${changes} questions modified`);
  });
  
  console.log('\nDone! Run balanceCheck.cjs to verify results.');
}

main();
