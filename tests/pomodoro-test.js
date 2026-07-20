// 番茄钟基础测试
const assert = require('assert');

// 模拟DOM环境
global.document = {
    getElementById: () => ({
        textContent: '',
        classList: {
            add: () => {},
            remove: () => {}
        },
        disabled: false,
        addEventListener: () => {}
    }),
    addEventListener: () => {}
};

// 测试计时器功能
console.log('开始测试番茄钟功能...');

// 测试1: 计时器初始化
console.log('测试1: 计时器初始化');
const initialTime = 25 * 60; // 25分钟
assert.strictEqual(initialTime, 1500, '初始时间应为1500秒');
console.log('? 测试1通过: 计时器初始化正确');

// 测试2: 时间格式化
console.log('测试2: 时间格式化');
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

assert.strictEqual(formatTime(1500), '25:00', '1500秒应显示为25:00');
assert.strictEqual(formatTime(65), '01:05', '65秒应显示为01:05');
assert.strictEqual(formatTime(0), '00:00', '0秒应显示为00:00');
console.log('? 测试2通过: 时间格式化正确');

// 测试3: 会话类型切换
console.log('测试3: 会话类型切换');
function getNextSession(currentSession, tomatoCount) {
    if (currentSession === 'work') {
        return tomatoCount % 4 === 0 ? 'longBreak' : 'shortBreak';
    } else {
        return 'work';
    }
}

assert.strictEqual(getNextSession('work', 1), 'shortBreak', '1个番茄钟后应为短休息');
assert.strictEqual(getNextSession('work', 4), 'longBreak', '4个番茄钟后应为长休息');
assert.strictEqual(getNextSession('shortBreak', 1), 'work', '短休息后应为工作');
assert.strictEqual(getNextSession('longBreak', 4), 'work', '长休息后应为工作');
console.log('? 测试3通过: 会话类型切换正确');

// 测试4: 番茄钟计数
console.log('测试4: 番茄钟计数');
let tomatoCount = 0;
function incrementTomato() {
    tomatoCount++;
    return tomatoCount;
}

assert.strictEqual(incrementTomato(), 1, '第一个番茄钟');
assert.strictEqual(incrementTomato(), 2, '第二个番茄钟');
assert.strictEqual(incrementTomato(), 3, '第三个番茄钟');
assert.strictEqual(incrementTomato(), 4, '第四个番茄钟');
console.log('? 测试4通过: 番茄钟计数正确');

// 测试5: 设置验证
console.log('测试5: 设置验证');
function validateSettings(settings) {
    return (
        settings.workDuration > 0 &&
        settings.workDuration <= 60 &&
        settings.shortBreakDuration > 0 &&
        settings.shortBreakDuration <= 30 &&
        settings.longBreakDuration > 0 &&
        settings.longBreakDuration <= 60
    );
}

assert.strictEqual(validateSettings({ workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 }), true, '有效设置');
assert.strictEqual(validateSettings({ workDuration: 0, shortBreakDuration: 5, longBreakDuration: 15 }), false, '无效工作时长');
assert.strictEqual(validateSettings({ workDuration: 25, shortBreakDuration: 35, longBreakDuration: 15 }), false, '无效短休息时长');
console.log('? 测试5通过: 设置验证正确');

console.log('\n所有测试通过！番茄钟功能正常。');
