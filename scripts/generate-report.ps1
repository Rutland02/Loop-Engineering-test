# 番茄钟项目PR状态报告生成器
# 此脚本仅生成报告，不执行任何代码修改

param(
    [string]$OutputPath = "reports/pr-status-report.md"
)

# 确保输出目录存在
$outputDir = Split-Path -Path $OutputPath -Parent
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 读取PR监控状态
$stateFile = "pr-babysitter-state.md"
if (-not (Test-Path -Path $stateFile)) {
    Write-Error "状态文件 $stateFile 不存在"
    exit 1
}

$stateContent = Get-Content -Path $stateFile -Raw

# 生成报告
$report = @"
# 番茄钟项目PR状态报告
**生成时间**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**项目**: 番茄钟计时器 - Loop Engineering 测试项目

## 监控状态概览

### 当前活跃PR
$(($stateContent | Select-String -Pattern "### 当前开发分支" -Context 0,10).Context.PostContext -join "`n")

### 功能完成状态
$(($stateContent | Select-String -Pattern "### 功能完成状态" -Context 0,15).Context.PostContext -join "`n")

### 测试状态
$(($stateContent | Select-String -Pattern "### 测试状态" -Context 0,10).Context.PostContext -join "`n")

## 预算使用情况
基于 `loop-budget.md` 配置：
- 每日最大运行次数: 288
- 每日最大Token消耗: 2M
- 单次修复最大尝试次数: 3

## 建议操作
1. 检查未完成的PR审查
2. 验证CI/CD流水线状态
3. 更新功能完成状态
4. 运行测试验证当前功能

## 下一步计划
1. 继续开发剩余功能（短休息、长休息、音效、设置）
2. 完善测试用例
3. 准备PR审查
4. 实施自动化测试

---
*此报告由Loop Engineering自动化工作流生成，仅用于状态监控，不执行任何代码修改。*
"@

# 保存报告
$report | Out-File -FilePath $OutputPath -Encoding UTF8

Write-Host "报告已生成: $OutputPath"
Write-Host "报告内容预览:"
Write-Host "===================="
Get-Content -Path $OutputPath | Select-Object -First 20
Write-Host "===================="
