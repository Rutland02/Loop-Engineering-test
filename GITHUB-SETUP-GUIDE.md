# GitHub CLI操作指南

## 当前状态
- GitHub CLI未登录或登录已过期
- Git仓库有权限问题

## 解决步骤

### 1. 登录GitHub CLI
请运行以下命令登录GitHub：
`ash
gh auth login -h github.com
`

按照提示选择：
- GitHub.com
- HTTPS
- 使用浏览器登录

### 2. 创建仓库并推送代码
登录成功后，运行以下命令：

`ash
# 进入项目目录
cd "E:\VS_Code_Program_File\Loop Engineering test"

# 添加所有文件
git add .

# 提交代码
git commit -m "初始提交：番茄钟项目完整实现"

# 创建GitHub仓库并推送
gh repo create pomodoro-timer --public --source=. --remote=origin --push
`

### 3. 或者分步操作
如果上面的命令有问题，可以分步操作：

`ash
# 创建仓库
gh repo create pomodoro-timer --public

# 添加远程仓库
git remote add origin https://github.com/Rutland02/pomodoro-timer.git

# 推送代码
git push -u origin master
`

## 注意事项
1. 确保GitHub账号有创建仓库的权限
2. 如果仓库已存在，使用 --source=. --remote=origin --push 参数
3. 首次推送可能需要输入GitHub用户名和密码

## 验证结果
推送成功后，访问以下地址查看仓库：
https://github.com/Rutland02/pomodoro-timer
