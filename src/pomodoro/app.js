// 番茄钟应用
class PomodoroTimer {
    constructor() {
        // 默认设置
        this.settings = {
            workDuration: 25 * 60, // 25分钟（秒）
            shortBreakDuration: 5 * 60, // 5分钟（秒）
            longBreakDuration: 15 * 60, // 15分钟（秒）
            tomatoesBeforeLongBreak: 4 // 4个番茄钟后长休息
        };
        
        // 状态
        this.state = {
            isRunning: false,
            isPaused: false,
            currentTime: this.settings.workDuration,
            currentSession: 'work', // 'work', 'shortBreak', 'longBreak'
            tomatoCount: 0,
            intervalId: null,
            soundEnabled: true
        };
        
        // DOM元素
        this.elements = {
            timer: document.getElementById('timer'),
            timerLabel: document.getElementById('timer-label'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            tomatoCount: document.getElementById('tomato-count'),
            sessionType: document.getElementById('session-type'),
            workDuration: document.getElementById('work-duration'),
            shortBreak: document.getElementById('short-break'),
            longBreak: document.getElementById('long-break'),
            saveSettings: document.getElementById('save-settings'),
            soundToggle: document.getElementById('sound-toggle')
        };
        
        // 音效
        this.audioContext = null;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 绑定事件
        this.elements.startBtn.addEventListener('click', () => this.start());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.resetBtn.addEventListener('click', () => this.reset());
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        this.elements.soundToggle.addEventListener('change', (e) => {
            this.state.soundEnabled = e.target.checked;
        });
        
        // 初始化音效上下文
        this.initAudio();
        
        // 更新显示
        this.updateDisplay();
    }
    
    initAudio() {
        // 创建音频上下文（需要用户交互后才能创建）
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }
    
    start() {
        if (this.state.isRunning && !this.state.isPaused) {
            return;
        }
        
        if (this.state.isPaused) {
            // 恢复暂停的计时器
            this.state.isPaused = false;
            this.state.isRunning = true;
            this.state.intervalId = setInterval(() => this.tick(), 1000);
            this.updateButtons();
            this.elements.timer.classList.add('running');
            return;
        }
        
        // 开始新的计时
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.intervalId = setInterval(() => this.tick(), 1000);
        this.updateButtons();
        this.elements.timer.classList.add('running');
    }
    
    pause() {
        if (!this.state.isRunning || this.state.isPaused) {
            return;
        }
        
        this.state.isPaused = true;
        this.state.isRunning = false;
        clearInterval(this.state.intervalId);
        this.updateButtons();
        this.elements.timer.classList.remove('running');
    }
    
    reset() {
        // 停止计时器
        clearInterval(this.state.intervalId);
        
        // 重置状态
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.state.currentTime = this.settings.workDuration;
        this.state.currentSession = 'work';
        
        // 更新显示
        this.updateDisplay();
        this.updateButtons();
        this.elements.timer.classList.remove('running');
    }
    
    tick() {
        if (this.state.currentTime <= 0) {
            // 当前会话结束
            this.sessionComplete();
            return;
        }
        
        this.state.currentTime--;
        this.updateDisplay();
    }
    
    sessionComplete() {
        // 停止计时器
        clearInterval(this.state.intervalId);
        this.state.isRunning = false;
        this.elements.timer.classList.remove('running');
        
        // 播放音效
        this.playSound();
        
        // 根据当前会话类型处理
        if (this.state.currentSession === 'work') {
            // 工作会话完成
            this.state.tomatoCount++;
            this.elements.tomatoCount.textContent = this.state.tomatoCount;
            
            // 决定下一个休息类型
            if (this.state.tomatoCount % this.settings.tomatoesBeforeLongBreak === 0) {
                this.state.currentSession = 'longBreak';
                this.state.currentTime = this.settings.longBreakDuration;
                this.elements.sessionType.textContent = '长休息';
            } else {
                this.state.currentSession = 'shortBreak';
                this.state.currentTime = this.settings.shortBreakDuration;
                this.elements.sessionType.textContent = '短休息';
            }
        } else {
            // 休息会话完成，回到工作
            this.state.currentSession = 'work';
            this.state.currentTime = this.settings.workDuration;
            this.elements.sessionType.textContent = '工作';
        }
        
        // 更新显示
        this.updateDisplay();
        this.updateButtons();
        
        // 自动开始下一个会话（可选）
        // setTimeout(() => this.start(), 2000);
    }
    
    updateDisplay() {
        // 更新计时器显示
        const minutes = Math.floor(this.state.currentTime / 60);
        const seconds = this.state.currentTime % 60;
        this.elements.timer.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 更新标签
        switch (this.state.currentSession) {
            case 'work':
                this.elements.timerLabel.textContent = '工作时间';
                break;
            case 'shortBreak':
                this.elements.timerLabel.textContent = '短休息';
                break;
            case 'longBreak':
                this.elements.timerLabel.textContent = '长休息';
                break;
        }
        
        // 更新番茄钟计数
        this.elements.tomatoCount.textContent = this.state.tomatoCount;
    }
    
    updateButtons() {
        // 更新按钮状态
        this.elements.startBtn.disabled = this.state.isRunning && !this.state.isPaused;
        this.elements.pauseBtn.disabled = !this.state.isRunning || this.state.isPaused;
        
        // 更新按钮文本
        if (this.state.isPaused) {
            this.elements.startBtn.textContent = '继续';
        } else if (this.state.isRunning) {
            this.elements.startBtn.textContent = '运行中';
        } else {
            this.elements.startBtn.textContent = '开始';
        }
    }
    
    saveSettings() {
        // 获取并验证设置值
        const workDuration = parseInt(this.elements.workDuration.value) || 25;
        const shortBreak = parseInt(this.elements.shortBreak.value) || 5;
        const longBreak = parseInt(this.elements.longBreak.value) || 15;
        
        // 更新设置
        this.settings.workDuration = workDuration * 60;
        this.settings.shortBreakDuration = shortBreak * 60;
        this.settings.longBreakDuration = longBreak * 60;
        
        // 如果计时器未运行，重置为新的工作时长
        if (!this.state.isRunning && this.state.currentSession === 'work') {
            this.state.currentTime = this.settings.workDuration;
            this.updateDisplay();
        }
        
        // 显示保存成功提示
        alert('设置已保存！');
    }
    
    playSound() {
        if (!this.state.soundEnabled || !this.audioContext) {
            return;
        }
        
        // 创建简单的提示音
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
}

// 页面加载完成后初始化番茄钟
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
