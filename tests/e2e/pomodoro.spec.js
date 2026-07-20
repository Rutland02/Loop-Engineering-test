const { test, expect } = require('@playwright/test');
const path = require('path');

const HTML_PATH = 'file://' + path.join(__dirname, '..', '..', 'src', 'pomodoro', 'index.html');

test('页面加载后显示初始状态', async ({ page }) => {
  await page.goto(HTML_PATH);
  await expect(page.locator('#timer')).toHaveText('25:00');
  await expect(page.locator('#timer-label')).toHaveText('工作时间');
  await expect(page.locator('#start-btn')).toBeVisible();
  await expect(page.locator('#pause-btn')).toBeVisible();
  await expect(page.locator('#reset-btn')).toBeVisible();
});

test('点击开始后计时器运行', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.click('#start-btn');
  await page.waitForTimeout(2500);
  const text = await page.locator('#timer').textContent();
  expect(text).not.toBe('25:00');
});

test('点击暂停后计时器停止', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.click('#start-btn');
  await page.waitForTimeout(1500);
  await page.click('#pause-btn');
  const text1 = await page.locator('#timer').textContent();
  await page.waitForTimeout(2000);
  const text2 = await page.locator('#timer').textContent();
  expect(text1).toBe(text2);
});

test('点击重置恢复初始状态', async ({ page }) => {
  await page.goto(HTML_PATH);
  await page.click('#start-btn');
  await page.waitForTimeout(1500);
  await page.click('#reset-btn');
  await expect(page.locator('#timer')).toHaveText('25:00');
  await expect(page.locator('#timer-label')).toHaveText('工作时间');
});

test('保存设置', async ({ page }) => {
  await page.goto(HTML_PATH);
  page.on('dialog', async (dialog) => dialog.accept());
  await page.fill('#work-duration', '30');
  await page.fill('#short-break', '10');
  await page.fill('#long-break', '20');
  await page.click('#save-settings');
  await page.click('#reset-btn');
  await expect(page.locator('#timer')).toHaveText('30:00');
});
