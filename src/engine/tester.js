const { execSync } = require('child_process');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..', '..');

function runUnitTests() {
  try {
    const output = execSync('node tests/pomodoro-test.js', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 30000,
    });
    return { passed: !output.includes('失败') && !output.includes('FAIL') && !output.includes('Error'), output };
  } catch (err) {
    return { passed: false, output: err.stdout || err.message, error: err.message };
  }
}

function runE2ETests() {
  try {
    const output = execSync('npx playwright test --reporter=line', {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 60000,
    });
    return { passed: true, output };
  } catch (err) {
    return { passed: false, output: err.stdout || err.message, error: err.message };
  }
}

function runAllTests() {
  const unit = runUnitTests();
  const e2e = runE2ETests();

  const results = [
    { suite: 'unit', passed: unit.passed, output: unit.output.substring(0, 500) },
    { suite: 'e2e', passed: e2e.passed, output: e2e.output.substring(0, 500) },
  ];

  const allPassed = unit.passed && e2e.passed;

  return {
    passed: allPassed,
    results,
    summary: `Unit: ${unit.passed ? 'PASS' : 'FAIL'} | E2E: ${e2e.passed ? 'PASS' : 'FAIL'}`,
  };
}

module.exports = { runUnitTests, runE2ETests, runAllTests };
