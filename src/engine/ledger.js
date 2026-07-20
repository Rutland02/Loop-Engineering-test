const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, '..', '..', 'loop-ledger.json');

function readLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    return { goal: '', pattern: 'feature-development', level: 'L2', project: 'pomodoro-timer', budget: {}, attempts: [] };
  }
  return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf-8'));
}

function writeLedger(data) {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function initRun(goal, pattern = 'feature-development', level = 'L2', budget = {}) {
  const defaults = {
    max_tokens: 500000,
    max_iterations: 5,
    max_attempts_per_item: 3,
  };
  const ledger = {
    goal,
    pattern,
    level,
    project: 'pomodoro-timer',
    created_at: new Date().toISOString(),
    budget: { ...defaults, ...budget },
    attempts: [],
    currentPhase: 'plan',
    verdict: null,
  };
  writeLedger(ledger);
  return ledger;
}

function recordAttempt({ iteration, action, outcome, error, tokensEstimate, filesChanged, testsPassed }) {
  const ledger = readLedger();
  const entry = {
    iteration,
    timestamp: new Date().toISOString(),
    action,
    outcome,
    ...(error && { error }),
    ...(tokensEstimate !== undefined && { tokensEstimate }),
    ...(filesChanged && { filesChanged }),
    ...(testsPassed !== undefined && { testsPassed }),
  };
  ledger.attempts.push(entry);
  writeLedger(ledger);
  return entry;
}

function updatePhase(phase) {
  const ledger = readLedger();
  ledger.currentPhase = phase;
  writeLedger(ledger);
}

function setVerdict(verdict) {
  const ledger = readLedger();
  ledger.verdict = verdict;
  writeLedger(ledger);
}

function getRunState() {
  return readLedger();
}

function isExhausted() {
  const ledger = readLedger();
  const maxIters = ledger.budget.max_iterations;
  const attempts = ledger.attempts.length;
  return attempts >= maxIters;
}

function getAttemptCount() {
  return readLedger().attempts.length;
}

module.exports = { initRun, recordAttempt, updatePhase, setVerdict, getRunState, isExhausted, getAttemptCount };
