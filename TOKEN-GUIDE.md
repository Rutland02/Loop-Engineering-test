# 使用个人访问令牌上传代码

## 替代方案：使用GitHub个人访问令牌

如果GitHub CLI登录有问题，可以使用个人访问令牌。

### 步骤1：创建个人访问令牌
1. 访问: https://github.com/settings/tokens
2. 点击 **Generate new token** 按钮
3. 选择 **repo** 权限（完整仓库访问权限）
4. 点击 **Generate token** 按钮
5. 复制生成的令牌（只显示一次）

### 步骤2：使用令牌登录GitHub CLI
`ash
gh auth login --with-token <<< "YOUR_TOKEN_HERE"
`

或者使用以下命令：
`ash
echo "YOUR_TOKEN_HERE" | gh auth login --with-token
`

### 步骤3：创建仓库并上传代码
登录成功后，运行：
`ash
# 进入项目目录
cd "E:\VS_Code_Program_File\Loop Engineering test"

# 初始化git
git init
git config user.name "CC"
git config user.email "cc@example.com"

# 创建功能分支
git checkout -b feature/pomodoro-timer

# 添加所有文件
git add .

# 提交代码
git commit -m "初始提交：番茄钟项目完整实现"

# 创建GitHub仓库
gh repo create pomodoro-timer --public --source=. --remote=origin --push
`

## 注意事项

1. **安全性**: 个人访问令牌相当于密码，请妥善保管
2. **权限**: 只选择必要的权限（repo权限）
3. **有效期**: 可以设置令牌的有效期
4. **撤销**: 使用后可以随时撤销令牌

## 使用SSH密钥（更安全）

如果可能，建议使用SSH密钥而不是令牌：

### 步骤1：生成SSH密钥
`ash
ssh-keygen -t ed25519 -C "your_email@example.com"
`

### 步骤2：添加SSH密钥到GitHub
1. 复制公钥内容: cat ~/.ssh/id_ed25519.pub
2. 访问: https://github.com/settings/keys
3. 点击 **New SSH key** 按钮
4. 粘贴公钥并保存

### 步骤3：使用SSH克隆和推送
`ash
# 使用SSH克隆
git clone git@github.com:YOUR_USERNAME/pomodoro-timer.git

# 或者添加远程仓库
git remote add origin git@github.com:YOUR_USERNAME/pomodoro-timer.git
`

## 推荐方案

1. **最佳方案**: 使用GitHub Desktop（图形界面，最简单）
2. **次佳方案**: 使用SSH密钥（最安全）
3. **备选方案**: 使用个人访问令牌

---
创建时间: 2026-07-20 22:14:54
