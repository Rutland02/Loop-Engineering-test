# 番茄钟开发文档

## 开发环境设置

### 前提条件
- Node.js 18+（用于运行测试和工具）
- 现代浏览器（Chrome、Firefox、Edge等）
- Git（用于版本控制）

### 环境配置
```bash
# 克隆项目
git clone <repository-url>
cd loop-engineering-test

# 安装依赖（如果需要）
npm install

# 运行番茄钟
npm start
```

## 代码架构

### 文件结构
```
src/pomodoro/
├── index.html    # 用户界面
├── style.css     # 样式和布局
└── app.js        # 应用逻辑
```

### 模块说明

#### 1. HTML (index.html)
- 定义用户界面结构
- 包含计时器显示、控制按钮、设置界面
- 使用语义化HTML5标签

#### 2. CSS (style.css)
- 响应式设计，适配不同屏幕尺寸
- 渐变背景和卡片式布局
- 按钮状态和动画效果
- 移动端友好设计

#### 3. JavaScript (app.js)
- `PomodoroTimer` 类：核心应用逻辑
- 状态管理：跟踪计时器状态、当前会话、番茄钟计数
- 事件处理：按钮点击、设置保存
- 音效播放：使用Web Audio API
- 定时器逻辑：倒计时、会话切换

## 功能实现细节

### 计时器逻辑
```javascript
// 状态管理
this.state = {
    isRunning: false,
    isPaused: false,
    currentTime: 25 * 60, // 25分钟（秒）
    currentSession: 'work', // 'work', 'shortBreak', 'longBreak'
    tomatoCount: 0
};

// 计时器滴答
tick() {
    if (this.state.currentTime <= 0) {
        this.sessionComplete();
        return;
    }
    this.state.currentTime--;
    this.updateDisplay();
}
```

### 会话切换逻辑
```javascript
sessionComplete() {
    if (this.state.currentSession === 'work') {
        this.state.tomatoCount++;
        // 每4个番茄钟后长休息
        if (this.state.tomatoCount % 4 === 0) {
            this.state.currentSession = 'longBreak';
            this.state.currentTime = this.settings.longBreakDuration;
        } else {
            this.state.currentSession = 'shortBreak';
            this.state.currentTime = this.settings.shortBreakDuration;
        }
    } else {
        // 休息结束后回到工作
        this.state.currentSession = 'work';
        this.state.currentTime = this.settings.workDuration;
    }
}
```

## 测试策略

### 单元测试
- 测试时间格式化函数
- 测试会话切换逻辑
- 测试设置验证
- 测试番茄钟计数

### 集成测试
- 测试按钮交互
- 测试状态管理
- 测试音效播放

### UI自动化测试（Playwright）
- 测试页面加载
- 测试按钮点击
- 测试计时器显示
- 测试设置保存

## 部署说明

### 本地部署
直接打开 `src/pomodoro/index.html` 即可使用。

### 生产部署
1. 压缩CSS和JavaScript文件
2. 优化图片资源（如果有）
3. 部署到静态文件服务器
4. 配置HTTPS（推荐）

## 性能优化

### 当前优化
- 使用CSS3动画代替JavaScript动画
- 最小化DOM操作
- 使用事件委托

### 潜在优化
- 使用Service Worker缓存资源
- 实现代码分割
- 使用Web Workers处理复杂计算

## 已知限制
1. 音频播放需要用户交互后才能初始化
2. 没有持久化存储设置
3. 不支持后台标签页计时
4. 没有通知API集成

## 扩展建议
1. 添加任务列表功能
2. 实现统计和报告
3. 添加主题切换
4. 支持多语言
5. 添加导出功能

---
> 本文档随项目发展持续更新。
