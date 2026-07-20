# 番茄钟项目 - Loop Engineering 测试用例

## 项目概述
这是一个基于Loop Engineering工作流开发的番茄钟应用，用于验证自动化开发循环的有效性。

## 功能特性
- ? 25分钟倒计时工作时间
- ? 5分钟短休息
- ? 15分钟长休息（每4个番茄钟后）
- ? 开始/暂停/重置按钮控制
- ? 番茄钟计数显示
- ? 音效提醒（待开发）
- ? 设置界面（待开发）
- ? 本地存储设置（待开发）

## 快速开始

### 1. 直接运行
```bash
# 打开番茄钟应用
open src/pomodoro/index.html

# 或者使用npm脚本
npm start
```

### 2. 开发模式
```bash
# 安装开发依赖（如果需要）
npm install

# 运行测试
npm test

# 代码检查
npm run lint
```

## 项目结构
```
pomodoro-timer/
├── src/pomodoro/          # 番茄钟源代码
│   ├── index.html         # 主页面
│   ├── style.css          # 样式文件
│   └── app.js             # 应用逻辑
├── tests/                 # 测试文件
│   └── pomodoro-test.js   # 基础功能测试
├── docs/                  # 文档（待创建）
├── AGENTS.md              # Agent配置
├── LOOP.md                # 循环配置
├── loop-constraints.md    # 约束规则
├── loop-budget.md         # 预算管理
├── loop-ledger.json       # 循环账本
├── loop-run-log.md        # 运行日志
├── pr-babysitter-state.md # PR监控状态
├── package.json           # 项目配置
└── README-POMODORO.md     # 本文件
```

## Loop Engineering 工作流

### 开发流程
1. **计划阶段**：定义要开发的功能
2. **构建阶段**：编写最小必要的代码
3. **测试阶段**：运行测试验证功能
4. **审查阶段**：独立验证器检查代码
5. **交付阶段**：提交PR等待审查
6. **迭代阶段**：根据反馈继续改进

### 当前循环状态
- **PR监控**：L2辅助修复模式
- **功能开发**：按需触发
- **CI修复**：L1仅报告模式

### 预算限制
- 每天最大运行次数：288次
- 每天最大Token消耗：2M
- 单次修复最大尝试次数：3次

## 测试说明

### 手动测试
1. 打开 `src/pomodoro/index.html`
2. 点击"开始"按钮，观察25分钟倒计时
3. 点击"暂停"按钮，验证计时器暂停
4. 点击"重置"按钮，验证计时器重置
5. 等待计时结束，验证自动切换到休息模式

### 自动化测试
```bash
# 运行基础测试
node tests/pomodoro-test.js
```

## 开发规范

### 代码约束
- 只修改 `src/pomodoro/` 目录下的文件
- 不修改配置文件（package.json等）
- 不添加外部依赖
- 保持现有功能不变

### Git工作流
- 在 `feature/pomodoro-*` 分支上开发
- 提交前创建草稿PR
- 提交信息清晰描述修改内容

### 安全规则
- 不修改生产环境配置
- 不删除测试用例
- 不禁用测试来通过CI

## 已知问题
1. 音效功能需要用户交互后才能初始化AudioContext
2. 设置界面尚未实现
3. 没有持久化存储设置

## 下一步开发计划
1. 实现设置界面和配置保存
2. 添加音效提醒功能
3. 实现本地存储设置
4. 添加Playwright自动化测试
5. 添加响应式设计优化

## 贡献指南
欢迎参与番茄钟项目的开发！请遵循以下步骤：
1. Fork本项目
2. 创建特性分支：`git checkout -b feature/pomodoro-new-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/pomodoro-new-feature`
5. 创建Pull Request

## 许可证
本项目采用MIT许可证 - 详见LICENSE文件

---
> 本项目是Loop Engineering工作流的测试用例，用于验证AI Agent自主开发闭环的有效性。
