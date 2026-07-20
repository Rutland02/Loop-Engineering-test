const { execSync } = require('child_process');
const path = require('path');
const ledger = require('./ledger');
const safety = require('./safety');
const tester = require('./tester');

const PROJECT_ROOT = path.join(__dirname, '..', '..');

function getGitDiff() {
  try {
    return execSync('git diff', { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 10000 });
  } catch {
    return '';
  }
}

function getGitStatus() {
  try {
    return execSync('git status --short', { cwd: PROJECT_ROOT, encoding: 'utf-8', timeout: 5000 });
  } catch {
    return '';
  }
}

/**
 * Run one complete loop iteration.
 * @param {object} opts - { goal, pattern, level, maxIterations, maxTokens, dryRun }
 */
async function runLoop(opts = {}) {
  const {
    goal = 'Improve pomodoro timer',
    pattern = 'feature-development',
    level = 'L2',
    maxIterations = 5,
    maxTokens = 500000,
    dryRun = false,
  } = opts;

  console.log(`\n=== Loop Engineering Run ===`);
  console.log(`Goal: ${goal}`);
  console.log(`Pattern: ${pattern} | Level: ${level}`);
  console.log(`Max Iterations: ${maxIterations} | Max Tokens: ${maxTokens}`);
  console.log(`Dry Run: ${dryRun}\n`);

  // Initialize or reset ledger
  ledger.initRun(goal, pattern, level, { max_iterations: maxIterations, max_tokens: maxTokens });

  let iteration = 0;
  let verdict = null;

  while (iteration < maxIterations) {
    iteration++;
    console.log(`--- Iteration ${iteration}/${maxIterations} ---`);

    // Pre-flight circuit check
    const state = ledger.getRunState();
    const circuitCheck = safety.checkCircuit(state.attempts, {
      maxIterations,
      stagnationLimit: 3,
      consecutiveFailureLimit: 5,
    });

    if (circuitCheck.trip) {
      console.log(`CIRCUIT BREAKER TRIPPED: ${circuitCheck.reason}`);
      verdict = 'ESCALATE_HUMAN';
      break;
    }

    // Budget check
    const budgetCheck = safety.checkBudget(state.attempts, maxTokens);
    console.log(`Budget: ${budgetCheck.totalTokens}/${budgetCheck.dailyCap} tokens (${budgetCheck.pct.toFixed(1)}%) — mode: ${budgetCheck.mode}`);
    if (budgetCheck.mode === 'halt') {
      console.log('Budget exhausted. Escalating.');
      verdict = 'ESCALATE_HUMAN';
      break;
    }

    // Phase: PLAN
    console.log('[PLAN] Writing task card...');
    ledger.updatePhase('plan');
    ledger.recordAttempt({
      iteration,
      action: 'plan',
      outcome: 'success',
      tokensEstimate: 500,
    });

    // Phase: BUILD
    console.log('[BUILD] Running builder...');
    ledger.updatePhase('build');

    if (dryRun) {
      console.log('  (dry run — skipping actual build)');
      ledger.recordAttempt({
        iteration,
        action: 'build',
        outcome: 'success',
        tokensEstimate: 2000,
        filesChanged: [],
      });
    } else {
      // In real mode, we launch Claude Code via subprocess
      // For now, simulate with direct execution of the task
      const buildResult = await runBuildStep(goal, iteration);
      ledger.recordAttempt({
        iteration,
        action: 'build',
        outcome: buildResult.success ? 'success' : 'failure',
        tokensEstimate: buildResult.tokensEstimate || 3000,
        filesChanged: buildResult.filesChanged || [],
        error: buildResult.error,
      });

      if (!buildResult.success) {
        console.log(`  Build failed: ${buildResult.error}`);
        continue;
      }
    }

    // Phase: TEST
    console.log('[TEST] Running tests...');
    ledger.updatePhase('test');
    const testResults = tester.runAllTests();
    console.log(`  ${testResults.summary}`);

    const diff = getGitDiff();
    const changedFiles = getGitStatus()
      .split('\n')
      .filter(Boolean)
      .map((l) => l.substring(3).trim());

    ledger.recordAttempt({
      iteration,
      action: 'test',
      outcome: testResults.passed ? 'success' : 'failure',
      tokensEstimate: 1000,
      filesChanged: changedFiles,
      testsPassed: testResults.passed,
      error: testResults.passed ? undefined : 'One or more tests failed',
    });

    if (!testResults.passed) {
      console.log('  Tests failed. Will re-iterate with fix attempt.');
      continue;
    }

    // Phase: REVIEW
    console.log('[REVIEW] Running reviewer...');
    ledger.updatePhase('review');
    const reviewResult = await runReviewStep(goal, diff, testResults.summary);

    console.log(`  Reviewer verdict: ${reviewResult.verdict}`);
    ledger.recordAttempt({
      iteration,
      action: 'review',
      outcome: reviewResult.verdict === 'APPROVE' ? 'success' : 'failure',
      tokensEstimate: 2000,
      error: reviewResult.verdict !== 'APPROVE' ? reviewResult.reasoning : undefined,
    });
    ledger.setVerdict(reviewResult.verdict);

    if (reviewResult.verdict === 'APPROVE') {
      verdict = 'APPROVE';
      break;
    } else if (reviewResult.verdict === 'ESCALATE_HUMAN') {
      verdict = 'ESCALATE_HUMAN';
      break;
    }
    // REJECT → loop back for another iteration
  }

  // Phase: SHIP or ESCALATE
  const finalState = ledger.getRunState();

  if (verdict === 'APPROVE') {
    console.log('\n=== LOOP COMPLETED SUCCESSFULLY ===');
    ledger.updatePhase('ship');
    if (!dryRun) {
      try {
        execSync('git add -A', { cwd: PROJECT_ROOT, timeout: 10000 });
        execSync(`git commit -m "Loop: ${goal}"`, { cwd: PROJECT_ROOT, timeout: 10000 });
        console.log('Changes committed.');
      } catch (err) {
        console.log(`Commit skipped: ${err.message}`);
      }
    }
  } else {
    console.log('\n=== LOOP ESCALATED ===');
    ledger.updatePhase('escalated');
    const evidencePath = safety.buildEvidencePack(finalState);
    console.log(`Evidence pack generated: ${evidencePath}`);
  }

  printSummary(finalState);
  return finalState;
}

async function runBuildStep(goal, iteration) {
  // Try using the Claude Code CLI
  try {
    const prompt = `Implement the following task: ${goal}. Make minimal, focused changes. Only edit files under src/pomodoro/. Do not edit config files.`;
    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}" --permission-mode plan --output-format text`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 300000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output: result, tokensEstimate: 5000, filesChanged: [] };
  } catch (err) {
    return { success: false, error: err.message, tokensEstimate: 1000 };
  }
}

async function runReviewStep(goal, diff, testSummary) {
  try {
    const prompt = [
      'You are the reviewer. Check the changes against the goal.',
      `Goal: ${goal}`,
      `Test Results: ${testSummary}`,
      `Diff: ${diff || '(no changes)'}`,
      'Output only one word: APPROVE, REJECT, or ESCALATE_HUMAN, followed by 1-2 lines reasoning.',
    ].join('\n');

    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}" --permission-mode plan --output-format text`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 120000,
    });

    if (result.includes('APPROVE')) return { verdict: 'APPROVE', reasoning: result.substring(0, 300) };
    if (result.includes('REJECT')) return { verdict: 'REJECT', reasoning: result.substring(0, 300) };
    return { verdict: 'ESCALATE_HUMAN', reasoning: result.substring(0, 300) };
  } catch (err) {
    return { verdict: 'ESCALATE_HUMAN', reasoning: `Reviewer execution failed: ${err.message}` };
  }
}

function printSummary(state) {
  console.log('\n=== RUN SUMMARY ===');
  console.log(`Goal: ${state.goal}`);
  console.log(`Pattern: ${state.pattern}`);
  console.log(`Verdict: ${state.verdict || 'none'}`);
  console.log(`Total attempts: ${state.attempts.length}`);
  for (const a of state.attempts) {
    const status = a.outcome === 'success' ? 'OK' : 'FAIL';
    console.log(`  [${status}] ${a.action} — iteration ${a.iteration}${a.error ? ` — ${a.error}` : ''}`);
  }
}

module.exports = { runLoop };
