#!/usr/bin/env node

const { runLoop } = require('./loop-runner');
const ledger = require('./ledger');
const safety = require('./safety');

const command = process.argv[2] || 'status';
const args = process.argv.slice(3);

function parseArgs() {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--goal' || args[i] === '-g') opts.goal = args[++i];
    if (args[i] === '--pattern' || args[i] === '-p') opts.pattern = args[++i];
    if (args[i] === '--level' || args[i] === '-l') opts.level = args[++i];
    if (args[i] === '--max-iterations' || args[i] === '-n') opts.maxIterations = parseInt(args[++i]);
    if (args[i] === '--max-tokens' || args[i] === '-t') opts.maxTokens = parseInt(args[++i]);
    if (args[i] === '--dry-run' || args[i] === '-d') opts.dryRun = true;
    if (args[i] === '--help' || args[i] === '-h') opts.help = true;
  }
  return opts;
}

function showHelp() {
  console.log('Loop Engineering Engine');
  console.log('');
  console.log('Usage: npm run loop:<command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  loop:start    Run a full Plan→Build→Test→Review→Ship loop');
  console.log('  loop:plan     Show current plan/state');
  console.log('  loop:build    Run build phase only');
  console.log('  loop:test     Run tests only');
  console.log('  loop:review   Run review phase only');
  console.log('  loop:ship     Ship/commit approved changes');
  console.log('  loop:status   Show current ledger state');
  console.log('  loop:evidence Generate evidence pack from current state');
  console.log('');
  console.log('Options:');
  console.log('  --goal, -g <text>      Task goal (required for start)');
  console.log('  --pattern, -p <name>   Loop pattern: feature-development (default)');
  console.log('  --level, -l <level>    Loop level: L1 | L2 (default)');
  console.log('  --max-iterations, -n <n>  Max iterations (default: 5)');
  console.log('  --max-tokens, -t <n>      Max tokens per run (default: 500000)');
  console.log('  --dry-run, -d          Preview without executing');
  console.log('');
  console.log('Examples:');
  console.log('  npm run loop:start -- --goal "Add mute toggle to pomodoro"');
  console.log('  npm run loop:start -- --goal "Fix timer bug" --dry-run');
  console.log('  npm run loop:status');
}

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  switch (command) {
    case 'start': {
      if (!opts.goal) {
        console.log('Error: --goal is required for start command');
        showHelp();
        process.exit(1);
      }
      await runLoop(opts);
      break;
    }
    case 'plan': {
      const state = ledger.getRunState();
      console.log(`Current goal: ${state.goal || '(not set)'}`);
      console.log(`Current phase: ${state.currentPhase}`);
      console.log(`Pattern: ${state.pattern} | Level: ${state.level}`);
      break;
    }
    case 'build': {
      console.log('Build phase — running builder...');
      const state = ledger.getRunState();
      if (!state.goal) {
        console.log('No goal set. Run loop:plan first with a goal.');
        process.exit(1);
      }
      await runLoop({ ...opts, goal: state.goal, maxIterations: 1 });
      break;
    }
    case 'test': {
      const tester = require('./tester');
      const results = tester.runAllTests();
      console.log(results.summary);
      for (const r of results.results) {
        console.log(`  [${r.suite}] ${r.passed ? 'PASS' : 'FAIL'}`);
      }
      process.exit(results.passed ? 0 : 1);
      break;
    }
    case 'review': {
      const state = ledger.getRunState();
      console.log(`Review phase for goal: ${state.goal}`);
      console.log(`Verdict: ${state.verdict || '(not set)'}`);
      console.log(`Attempts: ${state.attempts.length}`);
      break;
    }
    case 'ship': {
      console.log('Ship phase — committing changes...');
      const state = ledger.getRunState();
      if (state.verdict !== 'APPROVE') {
        console.log('Cannot ship: verdict is not APPROVE');
        process.exit(1);
      }
      console.log('Ready to ship. Commit manually or use git.');
      break;
    }
    case 'status': {
      const state = ledger.getRunState();
      console.log(JSON.stringify(state, null, 2));
      break;
    }
    case 'evidence': {
      const state = ledger.getRunState();
      const filePath = safety.buildEvidencePack(state);
      console.log(`Evidence pack: ${filePath}`);
      break;
    }
    default:
      console.log(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Loop engine error:', err.message);
  process.exit(1);
});
