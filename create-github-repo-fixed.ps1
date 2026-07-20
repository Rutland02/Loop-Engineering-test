# GitHub仓库创建脚本（修正版）
Write-Host "=== GitHub仓库创建脚本（修正版）==="

# 1. 检查GitHub CLI登录状态
Write-Host "
1. 检查GitHub CLI登录状态..."
 = gh auth status 2>&1
if ( -match "Logged in to github.com") {
    Write-Host "✅ GitHub CLI已登录"
} else {
    Write-Host "❌ GitHub CLI未登录"
    Write-Host "请运行: gh auth login -h github.com"
    exit 1
}

# 2. 创建仓库
Write-Host "
2. 创建GitHub仓库..."
 = "pomodoro-timer"
 = "番茄钟计时器 - Loop Engineering 测试项目"

# 尝试创建仓库
Write-Host "创建仓库: "
 = gh repo create  --public --description  2>&1

if ( -match "https://github.com") {
    Write-Host "✅ 仓库创建成功"
    Write-Host "仓库地址: "
    
    # 3. 初始化git并推送代码
    Write-Host "
3. 初始化git并推送代码..."
    
    # 进入项目目录
    Set-Location "E:\VS_Code_Program_File\Loop Engineering test"
    
    # 初始化git
    git init
    git config user.name "CC"
    git config user.email "cc@example.com"
    
    # 创建功能分支
    git checkout -b feature/pomodoro-timer
    
    # 添加所有文件
    git add .
    
    # 提交代码
    git commit -m "初始提交：番茄钟项目完整实现

    - 实现完整的番茄钟功能
    - 开始/暂停/重置按钮
    - 5分钟短休息和15分钟长休息
    - 番茄钟计数显示
    - 音效提醒功能
    - 设置界面
    - 修复编码问题（GBK转UTF-8）"
    
    # 添加远程仓库
    git remote add origin 
    
    # 推送代码
    git push -u origin feature/pomodoro-timer
    
    Write-Host "
✅ 代码推送成功"
    Write-Host "访问地址: https://github.com/Rutland02/pomodoro-timer"
} else {
    Write-Host "❌ 仓库创建失败"
    Write-Host "错误信息: "
    Write-Host "
请手动创建仓库:"
    Write-Host "1. 访问 https://github.com/new"
    Write-Host "2. 仓库名称: pomodoro-timer"
    Write-Host "3. 描述: 番茄钟计时器 - Loop Engineering 测试项目"
    Write-Host "4. 选择Public"
    Write-Host "5. 点击Create repository"
}
