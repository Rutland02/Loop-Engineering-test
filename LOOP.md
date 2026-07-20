# Loop Configuration - 番茄钟项目 PR Babysitter

| 模式 | 节奏 | 状态 |
|------|------|------|
| PR Babysitter | 5分钟（工作时间） | L2 辅助修复 |
| 功能开发 | 按需触发 | L2 辅助修复 |
| CI修复 | 10分钟 | L1 仅报告 |

## 限制

- 每个PR最大修复尝试次数：3次
- 自动合并：**禁用**
- 监控：团队创建的PR / 带有 `loop-watch` 标签的PR

## 人工门控

### 安全相关
- 认证/授权代码
- 支付相关功能
- 基础设施配置

### 代码质量
- 超过10个文件的修改
- 涉及架构变更
- 新增外部依赖

### 功能边界
- 修改核心计时逻辑
- 修改音频播放功能
- 修改本地存储逻辑

## 循环模式详情

### 1. PR监控循环
```yaml
pattern: pr-babysitter
cadence: "*/5 * * * *"  # 每5分钟
timeout: 2m
max_iterations: 10
```

### 2. 功能开发循环
```yaml
pattern: feature-development
trigger: "on-demand"  # 按需触发
timeout: 30m
max_iterations: 5
```

### 3. CI修复循环
```yaml
pattern: ci-sweeper
cadence: "*/10 * * * *"  # 每10分钟
timeout: 5m
max_iterations: 3
```

## 番茄钟项目特定循环

### 功能开发阶段
1. **基础计时器**（25分钟倒计时）
   - 验收标准：计时器能正确显示和倒计时
   - 测试：手动验证计时准确性

2. **按钮控制**（开始/暂停/重置）
   - 验收标准：按钮功能正常，状态正确切换
   - 测试：手动测试按钮交互

3. **休息逻辑**（短休息/长休息）
   - 验收标准：工作完成后自动切换休息，4个番茄钟后长休息
   - 测试：验证休息时间切换逻辑

4. **音效功能**
   - 验收标准：计时结束时播放提示音
   - 测试：验证音效播放和静音功能

5. **设置界面**
   - 验收标准：能修改时长设置并保存
   - 测试：验证设置保存和加载

## 监控分支
- `feature/pomodoro-*`：功能开发分支
- `fix/pomodoro-*`：修复分支
- `test/pomodoro-*`：测试分支

## 紧急停止
- 命令：`loop-pause-all`
- 恢复：人类在STATE.md中清除标志
- 用途：防止无限循环或成本超支

---
参见 `loop-constraints.md` 了解详细约束规则。
参见 `loop-budget.md` 了解预算限制。
