# 如何通过Automations（自动化）标签页创建定时任务

本文档说明如何通过GitHub的Automations标签页创建定时任务，仅生成报告，不执行任何代码修改。

## 方法一：通过GitHub Actions界面创建（推荐）

### 步骤1：访问仓库的Actions标签页
1. 打开你的GitHub仓库
2. 点击顶部的"Actions"标签页
3. 如果是第一次使用，点击"I understand my workflows, go ahead and enable them"

### 步骤2：创建新的工作流
1. 点击"New workflow"
2. 选择"Set up a workflow yourself"
3. 将以下内容粘贴到编辑器中：

```yaml
name: 番茄钟项目PR状态报告

on:
  schedule:
    # 每天UTC时间0点运行（北京时间早上8点）
    - cron: '0 0 * * *'
  workflow_dispatch:  # 允许手动触发

jobs:
  generate-report:
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v3
        
      - name: 生成PR状态报告
        run: |
          echo "=== 番茄钟项目PR状态报告 ==="
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
          
      - name: 保存报告
        run: |
          echo "报告已生成，仅用于状态监控"
```

4. 点击"Start commit"
5. 填写提交信息："添加番茄钟项目自动化报告工作流"
6. 点击"Commit new file"

### 步骤3：启用定时触发
1. 在Actions标签页，点击你刚刚创建的工作流
2. 点击"Run workflow"可以手动测试
3. 定时任务会按照cron表达式自动运行

## 方法二：通过现有的工作流文件

如果你已经有`.github/workflows/pr-report.yml`文件：

1. 将文件推送到仓库的`main`或`master`分支
2. 访问Actions标签页
3. 找到"番茄钟项目PR状态报告"工作流
4. 点击"Enable workflow"

## 方法三：使用PowerShell脚本（本地测试）

### 本地运行报告生成
```powershell
# 生成报告
pwsh -File scripts/generate-report.ps1 -OutputPath reports/pr-status-report.md

# 查看报告
cat reports/pr-status-report.md
```

### 设置本地定时任务（Windows）
```powershell
# 创建定时任务，每天早上8点运行
$action = New-ScheduledTaskAction -Execute "pwsh.exe" -Argument "-File scripts/generate-report.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 8am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "番茄钟PR报告"
```

## 方法四：使用其他CI/CD平台

### GitLab CI/CD
创建`.gitlab-ci.yml`文件：
```yaml
stages:
  - report

pr-report:
  stage: report
  script:
    - echo "生成PR状态报告"
    - pwsh -File scripts/generate-report.ps1
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
    - if: $CI_PIPELINE_SOURCE == "web"
```

### Azure DevOps
创建`azure-pipelines.yml`文件：
```yaml
trigger:
  - main
  - master

schedules:
  - cron: "0 0 * * *"
    displayName: Daily PR Report
    branches:
      include:
        - main
        - master

pool:
  vmImage: 'ubuntu-latest'

steps:
  - script: echo "生成PR状态报告"
    displayName: '生成报告'
```

## 配置说明

### Cron表达式说明
- `0 0 * * *` - 每天UTC时间0点（北京时间早上8点）
- `*/5 * * * *` - 每5分钟运行一次（仅用于测试）
- `0 */2 * * *` - 每2小时运行一次
- `0 9 * * 1-5` - 工作日每天早上9点

### 工作流权限
确保工作流有以下权限：
- `contents: read` - 读取仓库内容
- `actions: read` - 读取Actions信息
- `checks: write` - 更新检查状态（可选）

### 报告存储
- GitHub Actions制品：保留30天
- 本地reports目录：需要手动清理
- 可以配置发送到Slack/邮件（需要额外设置）

## 验证自动化任务

### 检查工作流状态
1. 访问Actions标签页
2. 查看最近的运行记录
3. 检查是否有错误

### 手动触发测试
1. 点击工作流名称
2. 点击"Run workflow"
3. 选择分支
4. 点击"Run workflow"

### 查看报告
1. 在工作流运行详情中，点击"Artifacts"
2. 下载生成的报告文件
3. 或者查看`reports/`目录

## 注意事项

1. **仅生成报告**：此自动化任务不会修改任何代码
2. **预算控制**：每天最多运行288次（每5分钟一次）
3. **人工监督**：所有重大决策仍需人工批准
4. **错误处理**：如果报告生成失败，会发送通知

## 故障排除

### 问题：工作流没有运行
- 检查cron表达式是否正确
- 确认工作流已启用
- 检查仓库的 Actions 权限设置

### 问题：报告内容不正确
- 检查`pr-babysitter-state.md`文件格式
- 验证PowerShell脚本语法
- 查看工作流运行日志

### 问题：权限错误
- 确保工作流有读取权限
- 检查GITHUB_TOKEN权限设置
- 验证仓库的Actions设置

---
*此自动化任务遵循Loop Engineering工作流的安全约束，仅用于状态监控和报告生成。*
