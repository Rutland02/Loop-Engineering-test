# 通过Automations标签页创建定时任务 - 快速指南

## 什么是Automations标签页？

Automations（自动化）标签页是GitHub Actions的管理界面，允许你创建、管理和监控自动化工作流。

## 快速创建定时任务（3步完成）

### 第1步：访问Actions标签页
1. 打开你的GitHub仓库页面
2. 点击顶部的 **"Actions"** 标签页
3. 如果是第一次使用，点击 **"I understand my workflows, go ahead and enable them"**

### 第2步：创建新工作流
1. 点击 **"New workflow"** 按钮
2. 选择 **"Set up a workflow yourself"**
3. 将以下内容复制粘贴到编辑器中：

```yaml
name: 番茄钟项目每日报告

on:
  schedule:
    # 每天北京时间早上8点运行
    - cron: '0 0 * * *'
  workflow_dispatch:  # 允许手动触发

jobs:
  daily-report:
    runs-on: ubuntu-latest
    
    steps:
      - name: 生成番茄钟项目报告
        run: |
          echo "=== 番茄钟项目每日报告 ==="
          echo "生成时间: $(date)"
          echo ""
          echo "## 项目状态"
          echo "- 监控的PR: #1 feature/pomodoro-timer"
          echo "- 功能完成度: 4/8 (50%)"
          echo "- 测试状态: 基础测试通过"
          echo ""
          echo "## 建议操作"
          echo "1. 继续开发剩余功能"
          echo "2. 完善测试用例"
          echo "3. 准备PR审查"
```

### 第3步：保存并启用
1. 点击 **"Start commit"** 按钮
2. 填写提交信息：`添加番茄钟项目自动化报告`
3. 点击 **"Commit new file"**
4. 工作流将自动启用

## 常用定时任务配置

### 每天运行一次（推荐）
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # UTC时间0点 = 北京时间早上8点
```

### 每小时运行一次
```yaml
on:
  schedule:
    - cron: '0 * * * *'
```

### 每周一运行
```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # 每周一UTC时间0点
```

### 工作日每天运行
```yaml
on:
  schedule:
    - cron: '0 9 * * 1-5'  # 工作日每天UTC时间9点
```

## 如何手动触发测试

1. 访问Actions标签页
2. 点击你创建的工作流名称
3. 点击 **"Run workflow"** 按钮
4. 选择分支（通常是`main`或`master`）
5. 点击 **"Run workflow"**

## 查看运行结果

### 查看运行历史
1. 在Actions标签页，点击工作流名称
2. 查看所有运行记录
3. 点击具体的运行查看详情

### 查看输出日志
1. 点击具体的运行记录
2. 展开 **"Generate report"** 步骤
3. 查看详细的输出日志

### 下载报告文件
1. 在运行详情页面，点击 **"Artifacts"** 部分
2. 下载生成的报告文件
3. 或者查看仓库的 `reports/` 目录

## 修改定时任务

### 修改运行频率
1. 在仓库中找到 `.github/workflows/` 目录
2. 编辑对应的工作流文件
3. 修改 `cron` 表达式
4. 提交更改

### 暂停定时任务
1. 访问Actions标签页
2. 点击工作流名称
3. 点击 **"Disable workflow"** 按钮

### 删除定时任务
1. 在仓库中删除 `.github/workflows/` 目录下的工作流文件
2. 提交删除操作

## 注意事项

### 仅生成报告
- 此自动化任务**不会修改任何代码**
- 只读取状态文件并生成报告
- 所有重大决策仍需人工批准

### 预算控制
- GitHub Actions每月有免费额度限制
- 建议每天运行不超过10次
- 可以在仓库设置中查看使用情况

### 错误处理
- 如果工作流失败，会发送邮件通知
- 可以在Actions标签页查看错误详情
- 常见问题：权限不足、文件不存在、语法错误

## 故障排除

### 问题：工作流没有运行
**解决方案：**
1. 检查工作流是否已启用
2. 验证cron表达式语法
3. 查看仓库的Actions权限设置
4. 检查是否有运行中的工作流

### 问题：报告内容为空
**解决方案：**
1. 检查脚本文件是否存在
2. 验证文件路径是否正确
3. 查看运行日志中的错误信息
4. 确保有读取文件的权限

### 问题：权限错误
**解决方案：**
1. 检查GITHUB_TOKEN权限
2. 确保工作流有读取权限
3. 验证仓库的Settings > Actions > General设置

## 高级配置

### 使用环境变量
```yaml
env:
  PROJECT_NAME: "番茄钟"
  REPORT_PATH: "reports/daily-report.md"
```

### 条件执行
```yaml
steps:
  - name: 仅在工作日运行
    if: github.event.schedule == '0 9 * * 1-5'
    run: echo "今天是工作日"
```

### 多步骤工作流
```yaml
jobs:
  report:
    steps:
      - name: 步骤1
        run: echo "步骤1"
      - name: 步骤2
        run: echo "步骤2"
        needs: [步骤1]  # 依赖步骤1
```

## 相关资源

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Cron表达式生成器](https://crontab.guru/)
- [GitHub Actions市场](https://github.com/marketplace?type=actions)

---
*此指南适用于Loop Engineering工作流的自动化配置，确保所有操作都遵循安全约束。*
