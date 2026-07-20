# Loop Engineering - 自动化闭环开发工作流

## 项目目标

本项目旨在实现一套 **Loop Engineering（循环工程）** 工作流，让 AI Agent 能够自主完成「计划→开发→测试→审查→交付→迭代」的闭环开发。

**番茄钟项目作为验证此工作流是否成功的测试用例。**

---

## 当前项目状态

### ?? 番茄钟项目
- **状态**：基础功能已完成，测试中
- **位置**：`src/pomodoro/`
- **功能**：25分钟计时、开始/暂停/重置、番茄钟计数
- **测试**：基础单元测试通过
- **文档**：详见 `README-POMODORO.md`

### ?? 工作流配置
- **约束规则**：`loop-constraints.md` ? 已配置
- **预算管理**：`loop-budget.md` ? 已配置
- **循环账本**：`loop-ledger.json` ? 已初始化
- **运行日志**：`loop-run-log.md` ? 已配置
- **PR监控**：`pr-babysitter-state.md` ? 已配置

---

## Loop Engineering 工作流

`
Plan → Build → Test → Review → Ship → Iterate
  ↑                                        ↓
  └────────────────────────────────────────┘
`

---

## 核心问题分析

### 1. Agent 调度与任务拆解

| 问题 | 说明 |
|------|------|
| 主 Agent 职责 | 如何让主 Agent 正确拆解复杂任务为原子子任务？ |
| Sub-agent 协作 | 多个 Sub-agent 如何并行执行而不冲突？ |
| 任务状态管理 | 如何追踪每个子任务的完成状态？ |
| 上下文传递 | Sub-agent 之间如何共享必要上下文？ |

**目标方案：**
- 实现 Task Planner 模块，将用户需求拆解为 DAG（有向无环图）
- Sub-agent 只返回结论，不返回推理过程
- 使用状态机管理任务生命周期

---

### 2. 自动化验证框架

| 问题 | 说明 |
|------|------|
| 验证触发时机 | 何时自动运行测试？ |
| 验证类型 | 单元测试、集成测试、UI 测试如何统一？ |
| 结果判定 | 如何将测试结果转化为 Pass/Fail 判定？ |
| 截图/UI 验证 | 前端如何自动截图验证？ |

**目标方案：**
- 集成 pytest（后端）+ Playwright（前端）
- 自动运行测试脚本并收集结果
- 将测试报告结构化输出给 Reviewer

---

### 3. 代码审查自动化

| 问题 | 说明 |
|------|------|
| Reviewer 角色 | 如何让 Reviewer 只关注验收标准而非代码风格？ |
| 审查标准 | 如何定义明确的通过/失败标准？ |
| 反馈格式 | Reviewer 如何输出可执行的修改建议？ |
| 角色隔离 | Reviewer 如何避免与 Builder 角色混淆？ |

**目标方案：**
- Reviewer Agent 只对照「验收标准清单」
- 输出格式：未通过条目 + 建议检查链路
- Reviewer 与 Builder 使用不同的 Prompt 角色

---

### 4. 决策引擎与循环控制

| 问题 | 说明 |
|------|------|
| 循环终止条件 | 何时停止迭代？ |
| 通过/失败处理 | 全通过 vs 部分通过 vs 严重失败如何处理？ |
| 最大轮数 | 如何防止无限循环？ |
| 人工交接 | 失败时如何生成可接手的证据包？ |

**目标方案：**
- 设置最大迭代轮数（默认 5 轮）
- 全通过 → 合并；部分通过 → 反馈给 Agent 继续修改；严重失败 → 熔断
- 生成「交接证据包」：Diff + 错误日志 + 上下文摘要

---

### 5. 安全边界与权限控制

| 问题 | 说明 |
|------|------|
| 分支隔离 | Agent 不能直接操作 main 分支 |
| 敏感操作拦截 | DROP TABLE、DELETE 无条件等操作如何拦截？ |
| 成本控制 | 如何限制 Token 消耗和执行时长？ |
| 环境隔离 | Agent 执行环境如何与生产环境隔离？ |

**目标方案：**
- Agent 只在 feature/loop-* 分支上操作
- 设置 Hook 拦截危险 SQL/命令
- 配置单次任务 Token 上限和时间上限
- 使用 Docker 沙盒环境执行

---

### 6. 工具链集成

| 问题 | 说明 |
|------|------|
| Git 集成 | 如何自动拉取代码、创建分支、提交、推送？ |
| CI/CD 集成 | 如何触发 GitHub Actions 运行测试？ |
| Issue 联动 | 如何从 GitHub Issue 自动创建 Loop？ |
| 日志收集 | 如何收集执行日志用于调试？ |

**目标方案：**
- 封装 Git 操作为 Skill
- 集成 GitHub API 触发 CI
- 支持 Webhook 触发 Proactive Loop
- 结构化日志输出

---

## 技术架构

`
┌─────────────────────────────────────────────────────────┐
│                    Loop Engineering Engine               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │  Plan   │───→│  Build  │───→│  Test   │             │
│  │ Module  │    │ Module  │    │ Module  │             │
│  └─────────┘    └─────────┘    └─────────┘             │
│       │              │              │                   │
│       ↓              ↓              ↓                   │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐             │
│  │ Review  │───→│ Decision│───→│  Ship   │             │
│  │ Module  │    │ Engine  │    │ Module  │             │
│  └─────────┘    └─────────┘    └─────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │                    │
         ↓                    ↓
┌─────────────────┐  ┌─────────────────┐
│   Sub-agents    │  │   Skill Pool    │
│  (Builder/      │  │  (Git/Test/     │
│   Reviewer)     │  │   Deploy)       │
└─────────────────┘  └─────────────────┘
         │                    │
         ↓                    ↓
┌─────────────────────────────────────────┐
│          Verification Layer             │
│  (pytest / Playwright / Linter)         │
└─────────────────────────────────────────┘
`

---

## 番茄钟作为测试用例

### 为什么选择番茄钟？

| 特点 | 对 Loop Engineering 的验证价值 |
|------|-------------------------------|
| 需求明确 | 计时、暂停、重置等功能边界清晰 |
| 前后端分离 | 验证多模块协作能力 |
| UI 交互 | 验证 Playwright 自动化测试能力 |
| 状态管理 | 验证复杂状态的正确性 |
| 可视化验证 | 截图可直观判断 UI 是否正确 |

### 番茄钟功能清单

- [x] 25 分钟倒计时
- [x] 开始/暂停/重置按钮
- [x] 番茄钟计数显示
- [ ] 5 分钟短休息
- [ ] 15 分钟长休息（每 4 个番茄钟后）
- [ ] 音效提醒
- [ ] 设置界面

---

## 循环周期建议

| 循环类型 | 时长 | 适用场景 |
|----------|------|---------|
| Micro Loop | 25-50 分钟 | 单个功能点开发 |
| Mini Loop | 2-4 小时 | 功能模块开发 |
| Standard Loop | 1-2 天 | 完整特性开发 |
| Mega Loop | 1 周 | 版本迭代 |

---

## 里程碑计划

| 阶段 | 目标 | 验证标准 |
|------|------|---------|
| M1: 基础框架 | 实现 Plan → Build → Test 循环 | 番茄钟核心计时功能完成 |
| M2: 审查闭环 | 加入 Reviewer 和 Decision Engine | 自动审查通过率 > 80% |
| M3: 安全机制 | 实现熔断和证据包 | 失败时能生成交接报告 |
| M4: 工具集成 | 集成 Git、CI/CD | 端到端自动化完成 |

---

## 快速开始

### 环境要求

- Node.js 18+ 或 Python 3.8+
- Git
- Docker（可选，用于沙盒执行）

### 安装步骤

```bash
git clone <repository-url>
cd loop-engineering-test
npm install
```

### 运行番茄钟

```bash
# 打开番茄钟应用
npm start

# 运行测试
npm test

# 代码检查
npm run lint
```

### 运行 Loop

```bash
# 运行完整的 Loop Engineering 流程
npm run loop:start

# 运行单个阶段
npm run loop:plan
npm run loop:build
npm run loop:test
npm run loop:review
```

---

## 项目结构

```
loop-engineering-test/
├── README.md                    # 项目说明
├── README-POMODORO.md           # 番茄钟项目说明
├── 指南文件.md                   # Loop Engineering 详解
├── src/
│   ├── pomodoro/                # 番茄钟项目（测试用例）
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   └── engine/                  # Loop Engineering 引擎（待实现）
├── tests/                       # 测试文件
├── docs/                        # 文档
├── .claude/                     # Claude代理配置
├── .codex/                      # Codex代理配置
├── .grok/                       # Grok代理配置
├── AGENTS.md                    # Agent配置
├── LOOP.md                      # 循环配置
├── loop-constraints.md          # 约束规则
├── loop-budget.md               # 预算管理
├── loop-ledger.json             # 循环账本
├── loop-run-log.md              # 运行日志
├── pr-babysitter-state.md       # PR监控状态
└── package.json                 # 项目配置
```

---

## 贡献指南

欢迎参与 Loop Engineering 工作流的建设！

1. Fork 本项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

## 许可证

本项目采用 MIT 许可证

---

> Loop Engineering 的核心：让 AI Agent 从「被动执行」转变为「主动闭环」，实现真正的自动化开发。
