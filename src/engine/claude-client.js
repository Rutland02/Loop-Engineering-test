const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');

function readConstraints() {
  const filePath = path.join(PROJECT_ROOT, 'loop-constraints.md');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

function readLoopDoc() {
  const filePath = path.join(PROJECT_ROOT, 'LOOP.md');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '';
}

/**
 * Run Claude Code as a builder subprocess.
 * @param {object} task - { goal, acceptanceCriteria, files }
 */
function runBuilder(task) {
  const constraints = readConstraints();
  const prompt = [
    'You are a builder agent in a Loop Engineering pipeline. Your job: implement the task below.',
    '',
    '## Task',
    `**Goal**: ${task.goal}`,
    task.acceptanceCriteria ? `**Acceptance Criteria**: ${task.acceptanceCriteria}` : '',
    '',
    '## Constraints (binding)',
    constraints || 'Default: edit only src/pomodoro/ files. Never edit config files.',
    '',
    '## Rules',
    '- Make minimal, focused edits. Do not refactor unrelated code.',
    '- After editing, describe exactly what you changed and why.',
    '- Only edit files under src/pomodoro/',
  ].join('\n');

  try {
    const result = execSync(`claude --print "${prompt.replace(/"/g, '\\"')}" --permission-mode plan`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 300000,
    });
    return { success: true, output: result };
  } catch (err) {
    return { success: false, output: err.stdout || '', error: err.message };
  }
}

/**
 * Run Claude Code as a reviewer subprocess.
 * @param {object} context - { goal, diff, testResults }
 */
function runReviewer(context) {
  const verifierPath = path.join(PROJECT_ROOT, '.claude', 'agents', 'loop-verifier.md');
  let verifierPrompt = '';
  if (fs.existsSync(verifierPath)) {
    verifierPrompt = fs.readFileSync(verifierPath, 'utf-8');
  }

  // Try spawning claude CLI first, fall back to just parsing the diff ourselves
  const prompt = [
    verifierPrompt || 'You are a code reviewer. Check the changes against the goal.',
    '',
    `**Goal**: ${context.goal}`,
    '',
    '## Test Results',
    context.testResults || 'No test results provided',
    '',
    '## Changes (git diff)',
    context.diff || 'No diff available',
    '',
    'Output only: APPROVE | REJECT | ESCALATE_HUMAN with 1-2 line reasoning.',
  ].join('\n');

  try {
    const result = execSync(`claude --print "${prompt.replace(/"/g, '\\"')}" --permission-mode plan`, {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 120000,
    });
    return parseVerdict(result);
  } catch (err) {
    return { verdict: 'ESCALATE_HUMAN', reasoning: `Reviewer execution failed: ${err.message}`, output: err.stdout || '' };
  }
}

function parseVerdict(output) {
  const text = output || '';
  if (text.includes('APPROVE')) return { verdict: 'APPROVE', reasoning: text.substring(0, 300) };
  if (text.includes('REJECT')) return { verdict: 'REJECT', reasoning: text.substring(0, 300) };
  if (text.includes('ESCALATE_HUMAN')) return { verdict: 'ESCALATE_HUMAN', reasoning: text.substring(0, 300) };
  return { verdict: 'ESCALATE_HUMAN', reasoning: `Could not parse verdict from reviewer output: ${text.substring(0, 200)}` };
}

module.exports = { runBuilder, runReviewer };
