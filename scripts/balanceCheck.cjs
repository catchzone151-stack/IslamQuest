const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '../src/data/quizzes');
const MIN_LEN = 15;
const MAX_LEN = 25;
const MAX_DIFF = 12;

function analyzeQuizFile(filePath) {
  const fileName = path.basename(filePath);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const issues = [];

  data.forEach((lesson, lessonIdx) => {
    const lessonId = lesson.lessonId || lessonIdx + 1;
    lesson.questions.forEach((q, qIdx) => {
      const lengths = q.options.map(opt => opt.length);
      const minLen = Math.min(...lengths);
      const maxLen = Math.max(...lengths);
      const diff = maxLen - minLen;
      
      const outsideRange = lengths.some(l => l < MIN_LEN || l > MAX_LEN);
      const tooDifferent = diff > MAX_DIFF;
      
      if (outsideRange || tooDifferent) {
        issues.push({
          lessonId,
          questionIdx: qIdx,
          question: q.question,
          options: q.options,
          answer: q.answer,
          lengths,
          diff,
          reasons: [
            outsideRange ? `Options outside ${MIN_LEN}-${MAX_LEN} range` : null,
            tooDifferent ? `Diff ${diff} > ${MAX_DIFF}` : null
          ].filter(Boolean)
        });
      }
    });
  });

  return { fileName, issues, totalQuestions: data.reduce((sum, l) => sum + l.questions.length, 0) };
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith('.json'));
  let totalIssues = 0;
  
  console.log('='.repeat(80));
  console.log('QUIZ ANSWER LENGTH BALANCE AUDIT - SUMMARY');
  console.log(`Criteria: Options should be ${MIN_LEN}-${MAX_LEN} chars, max diff ${MAX_DIFF}`);
  console.log('='.repeat(80));
  console.log('');

  files.forEach(file => {
    const result = analyzeQuizFile(path.join(QUIZ_DIR, file));
    const issueCount = result.issues.length;
    totalIssues += issueCount;
    
    const status = issueCount === 0 ? '✓' : '✗';
    console.log(`${status} ${file}: ${issueCount}/${result.totalQuestions} questions need balancing`);
  });

  console.log('');
  console.log('='.repeat(80));
  console.log(`TOTAL: ${totalIssues} issues across ${files.length} files`);
  console.log('='.repeat(80));
  
  // Write detailed report to file
  const reportPath = path.join(__dirname, 'balance_report.json');
  const fullReport = {};
  files.forEach(file => {
    const result = analyzeQuizFile(path.join(QUIZ_DIR, file));
    if (result.issues.length > 0) {
      fullReport[file] = result.issues;
    }
  });
  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(`\nDetailed report written to: ${reportPath}`);
}

main();
