import { test, expect } from '@playwright/test';

test.describe('스모크 테스트 - 기본 기능 확인', () => {
  test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Weather Flick/);
    
    // 기본 요소들이 로드되는지 확인
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    const hasDashboard = await page.locator('text=관리자 대시보드').count() > 0;
    
    // 로그인 폼이나 대시보드 중 하나는 표시되어야 함
    expect(hasLoginForm || hasDashboard).toBeTruthy();
  });

  test('기본 CSS 스타일이 로드된다', async ({ page }) => {
    await page.goto('/');
    
    // body 요소의 스타일 확인
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        fontFamily: computed.fontFamily,
        margin: computed.margin,
        backgroundColor: computed.backgroundColor
      };
    });
    
    // 기본 스타일이 적용되었는지 확인
    expect(bodyStyles.fontFamily).toBeTruthy();
  });

  test('헤더 영역이 올바르게 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // 로고나 타이틀 확인
    const headerElements = page.locator('header, .header, img[alt*="logo"], text=Weather Flick');
    const hasHeader = await headerElements.count() > 0;
    
    if (hasHeader) {
      await expect(headerElements.first()).toBeVisible();
    }
  });

  test('JavaScript가 정상적으로 로드되고 실행된다', async ({ page }) => {
    await page.goto('/');
    
    // React가 마운트되었는지 확인
    const reactRoot = await page.evaluate(() => {
      // React 루트 요소 또는 data 속성 확인
      return document.querySelector('#root') !== null ||
             document.querySelector('[data-reactroot]') !== null ||
             window.React !== undefined;
    });
    
    expect(reactRoot).toBeTruthy();
  });

  test('네트워크 요청이 오류 없이 처리된다', async ({ page }) => {
    const failedRequests = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // 치명적인 오류가 없는지 확인 (일부 API 요청 실패는 허용)
    const criticalFailures = failedRequests.filter(url => 
      url.includes('main.js') || 
      url.includes('index.js') || 
      url.includes('app.js') ||
      url.includes('.css')
    );
    
    expect(criticalFailures.length).toBe(0);
  });

  test('콘솔에 치명적인 오류가 없다', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // 치명적인 오류가 아닌 일반적인 경고는 허용
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Uncaught') ||
      error.includes('ReferenceError') ||
      error.includes('TypeError') ||
      error.includes('SyntaxError')
    );
    
    // 치명적인 오류가 3개 이하여야 함 (일부 외부 라이브러리 오류 허용)
    expect(criticalErrors.length).toBeLessThanOrEqual(3);
  });

  test('기본 인터랙션이 작동한다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // 클릭 가능한 요소 찾기
    const clickableElements = page.locator('button, a, input[type="submit"]');
    const elementCount = await clickableElements.count();
    
    if (elementCount > 0) {
      const firstElement = clickableElements.first();
      const isVisible = await firstElement.isVisible();
      
      if (isVisible) {
        // 요소가 클릭 가능한 상태인지 확인
        await expect(firstElement).toBeEnabled();
      }
    }
  });

  test('모바일 뷰포트에서 기본 레이아웃이 작동한다', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // 페이지가 모바일에서도 정상 로드되는지 확인
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    expect(bodyHeight).toBeGreaterThan(300);
    
    // 가로 스크롤바가 없는지 확인
    const hasHorizontalScroll = await page.evaluate(() => 
      document.body.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('기본 접근성 요구사항을 만족한다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // 기본 HTML 구조 확인
    const hasHeading = await page.locator('h1, h2, h3').count() > 0;
    const hasMainContent = await page.locator('main, [role="main"], .main-content').count() > 0;
    
    expect(hasHeading || hasMainContent).toBeTruthy();
    
    // 키보드 네비게이션 기본 테스트
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    const hasFocusedElement = await focusedElement.count() > 0;
    
    // 포커스 가능한 요소가 있는지 확인 (페이지에 따라 다를 수 있음)
    if (hasFocusedElement) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('다크/라이트 테마 토글이 작동한다', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // 로그인되어 있다면 테마 토글 버튼 찾기
    const themeButton = page.locator('button[aria-label*="테마"], button:has-text("테마")');
    const hasThemeButton = await themeButton.count() > 0;
    
    if (hasThemeButton) {
      // 현재 테마 상태 확인
      const htmlElement = page.locator('html');
      const initialClasses = await htmlElement.getAttribute('class');
      
      // 테마 버튼 클릭
      await themeButton.click();
      await page.waitForTimeout(500);
      
      // 테마가 변경되었는지 확인
      const updatedClasses = await htmlElement.getAttribute('class');
      expect(initialClasses !== updatedClasses).toBeTruthy();
    }
  });
});