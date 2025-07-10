import { test, expect } from '@playwright/test';

test.describe('인증 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('로그인 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 로그인 페이지인지 확인
    await expect(page).toHaveTitle(/Weather Flick/);
    
    // 로그인 폼 요소들이 존재하는지 확인
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('잘못된 자격 증명으로 로그인 시도 시 오류 메시지가 표시된다', async ({ page }) => {
    // 잘못된 이메일과 비밀번호 입력
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 오류 메시지 확인 (토스트 메시지 또는 에러 텍스트)
    await expect(page.locator('text=로그인에 실패했습니다')).toBeVisible({ timeout: 5000 });
  });

  test('유효한 자격 증명으로 로그인이 성공한다', async ({ page }) => {
    // 테스트용 관리자 계정으로 로그인
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 대시보드로 리다이렉트되는지 확인
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Weather Flick')).toBeVisible();
    await expect(page.locator('text=관리자 대시보드')).toBeVisible();
  });

  test('로그아웃 기능이 정상적으로 작동한다', async ({ page }) => {
    // 먼저 로그인
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 대시보드 로드 대기
    await expect(page.locator('text=관리자 대시보드')).toBeVisible();
    
    // 사용자 드롭다운 메뉴 클릭
    await page.click('[data-slot="dropdown-trigger"]');
    
    // 로그아웃 버튼 클릭
    await page.click('text=로그아웃');
    
    // 로그인 페이지로 리다이렉트되는지 확인
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});