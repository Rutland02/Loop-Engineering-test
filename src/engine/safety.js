const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '..', '..', 'reports');

function checkCircuit(attempts, constraints = {}) {
  const maxIterations = constraints.maxIterations || 5;
  const stagnationLimit = constraints.stagnationLimit || 3;
  const consecutiveFailureLimit = constraints.consecutiveFailureLimit || 5;

  if (attempts.length === 0) {
    return { continue: true };
  }

  const uniqueIterations = new Set(attempts.map((a) => a.iteration).filter(Boolean));
  if (uniqueIterations.size > maxIterations) {
    return { trip: true, reason: `max_iterations: ${uniqueIterations.size}/${maxIterations} reached` };
  }

  const failures = attempts.filter((a) => a.outcome === 'failure');
  if (failures.length >= consecutiveFailureLimit) {
    return { trip: true, reason: `consecutive_failures: ${failures.length} in a row` };
  }

  // stagnation: same error repeated N times
  const errors = failures.map((a) => a.error).filter(Boolean);
  const errorCounts = {};
  for (const err of errors) {
    const key = err.substring(0, 80);
    errorCounts[key] = (errorCounts[key] || 0) + 1;
    if (errorCounts[key] >= stagnationLimit) {
      return { trip: true, reason: `stagnation: same error ${stagnationLimit}x — "${key}"` };
    }
  }

  return { continue: true };
}

function checkBudget(attempts, dailyCap = 500000) {
  const totalTokens = attempts.reduce((sum, a) => sum + (a.tokensEstimate || 0), 0);
  const pct = (totalTokens / dailyCap) * 100;

  if (totalTokens >= dailyCap) {
    return { overBudget: true, totalTokens, dailyCap, pct, mode: 'halt' };
  }
  if (pct >= 80) {
    return { overBudget: false, totalTokens, dailyCap, pct, mode: 'report-only' };
  }
  return { overBudget: false, totalTokens, dailyCap, pct, mode: 'full' };
}

function buildEvidencePack(runState) {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const runId = runState.created_at ? runState.created_at.replace(/[:.]/g, '-') : Date.now();
  const filePath = path.join(REPORTS_DIR, `evidence-${runId}.md`);

  const lines = [];
  lines.push('# Loop Evidence Pack');
  lines.push('');
  lines.push(`**Generated**: ${new Date().toISOString()}`);
  lines.push(`**Goal**: ${runState.goal}`);
  lines.push(`**Pattern**: ${runState.pattern}`);
  lines.push(`**Level**: ${runState.level}`);
  lines.push(`**Verdict**: ${runState.verdict || 'not set'}`);
  lines.push('');
  lines.push('## Attempts');
  lines.push('');

  for (const a of runState.attempts || []) {
    lines.push(`### Iteration ${a.iteration} — ${a.outcome}`);
    lines.push(`- **Action**: ${a.action}`);
    lines.push(`- **Timestamp**: ${a.timestamp}`);
    if (a.error) lines.push(`- **Error**: \`${a.error}\``);
    if (a.tokensEstimate) lines.push(`- **Tokens**: ${a.tokensEstimate}`);
    if (a.filesChanged) lines.push(`- **Files**: ${Array.isArray(a.filesChanged) ? a.filesChanged.join(', ') : a.filesChanged}`);
    if (a.testsPassed !== undefined) lines.push(`- **Tests Passed**: ${a.testsPassed}`);
    lines.push('');
  }

  // summary
  const total = runState.attempts.length;
  const successes = runState.attempts.filter((a) => a.outcome === 'success').length;
  const failures = runState.attempts.filter((a) => a.outcome === 'failure').length;
  lines.push('## Summary');
  lines.push(`- **Total attempts**: ${total}`);
  lines.push(`- **Successes**: ${successes}`);
  lines.push(`- **Failures**: ${failures}`);
  lines.push(`- **Tokens used**: ${runState.attempts.reduce((s, a) => s + (a.tokensEstimate || 0), 0)}`);

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  return filePath;
}

module.exports = { checkCircuit, checkBudget, buildEvidencePack };
