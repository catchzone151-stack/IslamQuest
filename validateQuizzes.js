import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUIZZES_DIR = path.join(__dirname, "src/data/quizzes");

function getJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      results.push(fullPath);
    }
  }
  return results;
}

let errorCount = 0;
const seenQuestions = new Map();

function logError(file, lessonId, question, message) {
  const rel = path.relative(__dirname, file);
  console.error(`\n[ERROR] ${rel}`);
  console.error(`  lessonId : ${lessonId}`);
  if (question !== null) console.error(`  question : ${question}`);
  console.error(`  problem  : ${message}`);
  errorCount++;
}

const files = getJsonFiles(QUIZZES_DIR);

for (const file of files) {
  const rel = path.relative(__dirname, file);
  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    logError(file, "N/A", null, `Invalid JSON — ${e.message}`);
    continue;
  }

  if (!Array.isArray(parsed)) {
    logError(file, "N/A", null, "Top-level must be an array");
    continue;
  }

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    const lessonId = item.lessonId !== undefined ? item.lessonId : `item[${i}]`;

    if (item.lessonId === undefined) {
      logError(file, lessonId, null, "Missing required field: lessonId");
    }

    if (!Array.isArray(item.questions)) {
      logError(file, lessonId, null, "Missing or invalid field: questions (must be an array)");
      continue;
    }

    for (let q = 0; q < item.questions.length; q++) {
      const qObj = item.questions[q];
      const qText = typeof qObj.question === "string" ? qObj.question : `question[${q}]`;

      if (typeof qObj.question !== "string" || qObj.question.trim() === "") {
        logError(file, lessonId, qText, "question must be a non-empty string");
      }

      if (!Array.isArray(qObj.options)) {
        logError(file, lessonId, qText, "options must be an array");
        continue;
      }

      if (qObj.options.length < 2) {
        logError(file, lessonId, qText, `options must have at least 2 items (found ${qObj.options.length})`);
      }

      for (let o = 0; o < qObj.options.length; o++) {
        if (typeof qObj.options[o] !== "string" || qObj.options[o].trim() === "") {
          logError(file, lessonId, qText, `options[${o}] must be a non-empty string`);
        }
      }

      if (qObj.answer === undefined) {
        logError(file, lessonId, qText, "answer must exist");
      } else if (!Number.isInteger(qObj.answer)) {
        logError(file, lessonId, qText, `answer must be an integer (got ${typeof qObj.answer}: ${qObj.answer})`);
      } else if (qObj.answer < 0) {
        logError(file, lessonId, qText, `answer must be >= 0 (got ${qObj.answer})`);
      } else if (qObj.answer >= qObj.options.length) {
        logError(file, lessonId, qText, `answer ${qObj.answer} is out of range (options.length = ${qObj.options.length})`);
      }

      const key = qObj.question;
      if (typeof key === "string" && key.trim() !== "") {
        if (seenQuestions.has(key)) {
          const first = seenQuestions.get(key);
          const firstRel = path.relative(__dirname, first.file);
          console.error(`\n[DUPLICATE] "${key}"`);
          console.error(`  First seen : ${firstRel} (lessonId: ${first.lessonId})`);
          console.error(`  Duplicate  : ${rel} (lessonId: ${lessonId})`);
          errorCount++;
        } else {
          seenQuestions.set(key, { file, lessonId });
        }
      }
    }
  }
}

console.log("");
if (errorCount > 0) {
  console.error(`Validation complete. ${errorCount} error(s) found.`);
  process.exit(1);
} else {
  console.log("All quizzes validated successfully.");
  process.exit(0);
}
