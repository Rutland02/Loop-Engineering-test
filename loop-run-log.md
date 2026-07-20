# Loop Run Log - 番茄钟项目

每次运行追加一个条目。删除超过30天的条目。

## 格式

```json
{
  "run_id": "2026-07-20T21:15:00Z",
  "pattern": "feature-development",
  "duration_s": 45,
  "items_found": 4,
  "actions_taken": 1,
  "escalations": 0,
  "tokens_estimate": 52000,
  "outcome": "report-only | fix-proposed | escalated | no-op",
  "feature": "计时功能",
  "files_changed": ["src/pomodoro/app.js"],
  "tests_passed": true
}
```

## 最近运行

<!-- 循环代理会在下面追加条目 -->

## 番茄钟项目特定字段

### 可选字段说明
- `feature`: 当前开发的功能（如：计时功能、暂停功能、音效功能）
- `files_changed`: 本次修改的文件列表
- `tests_passed`: 测试是否通过
- `error_message`: 如果失败，记录错误信息
- `review_status`: PR审查状态

### 功能开发日志示例
```json
{
  "run_id": "2026-07-20T21:15:00Z",
  "pattern": "feature-development",
  "feature": "基础计时功能",
  "duration_s": 120,
  "items_found": 1,
  "actions_taken": 1,
  "escalations": 0,
  "tokens_estimate": 25000,
  "outcome": "fix-proposed",
  "files_changed": ["src/pomodoro/app.js", "src/pomodoro/index.html"],
  "tests_passed": true,
  "review_status": "pending"
}
```

### 修复日志示例
```json
{
  "run_id": "2026-07-20T21:20:00Z",
  "pattern": "ci-sweeper",
  "feature": "修复计时器暂停功能",
  "duration_s": 45,
  "items_found": 1,
  "actions_taken": 1,
  "escalations": 0,
  "tokens_estimate": 15000,
  "outcome": "fix-proposed",
  "files_changed": ["src/pomodoro/app.js"],
  "tests_passed": false,
  "error_message": "暂停按钮点击无反应",
  "review_status": "approved"
}
```
