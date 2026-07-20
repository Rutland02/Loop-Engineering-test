# Loop Engineering

自动化闭环开发引擎，实现 Plan → Build → Test → Review → Ship → Iterate 的 AI 驱动开发循环。

## 项目结构

```
loop-engineering-test/
  src/
    engine/                    # Loop Engineering 引擎
      index.js                 # CLI 入口
      loop-runner.js           # 核心编排器
      ledger.js                # 状态机（loop-ledger.json）
      safety.js                # 电路断路器 + 预算追踪 + 证据包
      tester.js                # 测试运行器
      claude-client.js         # Claude Code CLI 子进程接口
    pomodoro/                  # 番茄钟应用（演示项目）
      index.html / style.css / app.js
  tests/
    pomodoro-test.js           # 单元测试（5 个）
    e2e/pomodoro.spec.js       # Playwright E2E 测试（5 个）
  .claude/                     # Claude Code 代理定义
  .codex/                      # Codex 技能定义
  loop-constraints.md          # 循环约束规则
  loop-budget.md               # 预算限制
  loop-ledger.json             # 循环状态（运行时）
  loop-run-log.md              # 运行日志
  指南文件.md                   # Loop Engineering 实操指南
```

## 快速开始

```bash
# 安装依赖
npm install

# 运行单元测试
npm test

# 运行 E2E 测试
npm run test:e2e

# 运行全部测试
npm run test:all
```

## Loop Engine 命令

```bash
# 查看当前循环状态
npm run loop:status

# 干跑预览（不实际执行构建）
npm run loop:start -- --goal "Add dark mode" --dry-run

# 运行完整闭环（最多 3 轮迭代）
npm run loop:start -- --goal "Add dark mode" -n 3

# 运行测试
npm run loop:test

# 生成证据包
npm run loop:evidence
```

## 工作原理

```
npm run loop:start --goal "Add feature X"
  → 电路断路器预检
  → [Plan]  写入任务卡到 loop-ledger.json
  → [Build] 调用 Claude Code CLI 执行构建
  → [Test]  运行单元测试 + Playwright E2E
  → [Review] 独立 Reviewer 审核变更
  → APPROVE → 提交代码 | REJECT → 重新迭代 | ESCALATE → 生成证据包
```

## 安全机制

- **电路断路器**: 3 次相同错误、5 次连续失败或达到最大迭代数时触发
- **预算控制**: Token 80% → 仅报告模式，100% → 停止
- **证据包**: 失败时自动生成 `reports/evidence-*.md`，含 Diff、测试结果、审查意见
- **分支隔离**: 约束规则限制仅能编辑 `src/pomodoro/`

## 番茄钟演示项目

完整的番茄钟网页应用，作为 Loop Engineering 的验证目标：

- 25 分钟工作计时、5 分钟短休息、15 分钟长休息
- 开始 / 暂停 / 重置控制
- Web Audio API 音效提示
- 自定义时长设置
