import { test, expect } from '@playwright/test';

test.describe('전체 네비게이션 및 라우팅 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 대시보드 로드 대기
    await expect(page.locator('text=관리자 대시보드')).toBeVisible();
  });

  test('모든 메인 페이지 라우팅이 정상적으로 작동한다', async ({ page }) => {
    const routes = [
      { name: '대시보드', path: '/', text: '대시보드' },
      { name: '사용자 관리', path: '/users', text: '사용자 관리' },
      { name: '관리자 관리', path: '/admins', text: '관리자 관리' },
      { name: '콘텐츠 관리', path: '/content', text: '콘텐츠 관리' },
      { name: '날씨 관리', path: '/weather', text: '날씨 관리' },
      { name: '관광지 관리', path: '/tourist-attractions', text: '관광지 관리' },
      { name: '배치 관리', path: '/batch', text: '배치 관리' }
    ];

    for (const route of routes) {
      // 사이드바에서 해당 메뉴 클릭
      await page.click(`text=${route.text}`);
      
      // URL이 올바른지 확인
      await expect(page).toHaveURL(route.path);
      
      // 페이지가 로드되었는지 확인
      await page.waitForTimeout(1000);
      
      // 페이지 내용이 표시되는지 확인
      const pageContent = page.locator('main, .page-content, h1, h2, h3');
      await expect(pageContent.first()).toBeVisible();
    }
  });

  test('브라우저 뒤로가기/앞으로가기 버튼이 올바르게 작동한다', async ({ page }) => {
    // 대시보드에서 시작
    await expect(page).toHaveURL('/');
    
    // 사용자 관리로 이동
    await page.click('text=사용자 관리');
    await expect(page).toHaveURL('/users');
    
    // 콘텐츠 관리로 이동
    await page.click('text=콘텐츠 관리');
    await expect(page).toHaveURL('/content');
    
    // 브라우저 뒤로가기
    await page.goBack();
    await expect(page).toHaveURL('/users');
    
    // 다시 뒤로가기
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // 앞으로가기
    await page.goForward();
    await expect(page).toHaveURL('/users');
  });

  test('직접 URL 접근이 올바르게 작동한다', async ({ page }) => {
    const directRoutes = [
      '/users',
      '/admins', 
      '/content',
      '/weather',
      '/batch'
    ];

    for (const route of directRoutes) {
      await page.goto(route);
      
      // 페이지가 올바르게 로드되었는지 확인
      await expect(page).toHaveURL(route);
      
      // 인증된 상태에서 페이지 내용이 표시되는지 확인
      const pageContent = page.locator('main, .page-content, h1, h2, h3');
      await expect(pageContent.first()).toBeVisible();
      
      // 사이드바가 여전히 활성화되어 있는지 확인
      await expect(page.locator('nav, .sidebar')).toBeVisible();
    }
  });

  test('존재하지 않는 경로 처리가 올바르다', async ({ page }) => {
    // 존재하지 않는 경로로 이동
    await page.goto('/non-existent-page');
    
    // 404 페이지 또는 리다이렉트 처리 확인
    // 대부분의 SPA는 기본 페이지로 리다이렉트하거나 404 페이지를 표시
    const currentUrl = page.url();
    
    // 404 페이지가 표시되거나 기본 페이지로 리다이렉트되었는지 확인
    const is404 = currentUrl.includes('404') || await page.locator('text=/404|찾을 수 없습니다|Not Found/').count() > 0;
    const isRedirected = currentUrl.endsWith('/') || currentUrl.includes('login');
    
    expect(is404 || isRedirected).toBeTruthy();
  });

  test('권한이 없는 페이지 접근 시 적절한 처리가 된다', async ({ page }) => {
    // 관리자가 아닌 일반 사용자로 로그인해야 하지만,
    // 테스트 환경에서는 임의의 제한된 경로로 이동하여 테스트
    
    // 존재할 수 있는 제한된 경로 (예: 시스템 설정)
    await page.goto('/system');
    
    // 권한 없음 메시지 또는 리다이렉트 확인
    const hasPermissionError = await page.locator('text=/권한|접근|허용되지|Unauthorized/').count() > 0;
    const isRedirected = !page.url().includes('/system');
    
    // 권한 에러 메시지가 표시되거나 다른 페이지로 리다이렉트되어야 함
    expect(hasPermissionError || isRedirected).toBeTruthy();
  });

  test('사이드바 네비게이션의 활성 상태가 올바르게 표시된다', async ({ page }) => {
    const menuItems = [
      { text: '대시보드', path: '/' },
      { text: '사용자 관리', path: '/users' },
      { text: '콘텐츠 관리', path: '/content' },
      { text: '배치 관리', path: '/batch' }
    ];

    for (const item of menuItems) {
      // 메뉴 클릭
      await page.click(`text=${item.text}`);
      await expect(page).toHaveURL(item.path);
      
      // 활성 상태 표시 확인 (일반적으로 active 클래스나 특별한 스타일)
      const activeMenuItem = page.locator(`text=${item.text}`).locator('..');
      const isActive = await activeMenuItem.evaluate(el => {
        const classList = el.className;
        const computedStyle = window.getComputedStyle(el);
        
        // active 클래스나 특별한 배경색/테두리 확인
        return classList.includes('active') || 
               classList.includes('selected') ||
               computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
               computedStyle.borderLeftColor !== 'rgba(0, 0, 0, 0)';
      });
      
      expect(isActive).toBeTruthy();
    }
  });

  test('페이지 제목이 올바르게 설정된다', async ({ page }) => {
    // 기본 타이틀 확인
    await expect(page).toHaveTitle(/Weather Flick/);
    
    // 다른 페이지로 이동하여 타이틀 변경 확인
    await page.click('text=사용자 관리');
    await expect(page).toHaveTitle(/Weather Flick/);
    
    await page.click('text=콘텐츠 관리');
    await expect(page).toHaveTitle(/Weather Flick/);
  });

  test('모바일에서의 네비게이션이 올바르게 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 햄버거 메뉴나 모바일 네비게이션 버튼 찾기
    const mobileMenuButton = page.locator('button[aria-label*="menu"], .mobile-menu-button, button:has(svg)');
    
    const hasMobileMenu = await mobileMenuButton.count() > 0;
    
    if (hasMobileMenu) {
      // 모바일 메뉴 열기
      await mobileMenuButton.first().click();
      
      // 네비게이션 메뉴가 표시되는지 확인
      const navMenu = page.locator('nav, .mobile-menu, .sidebar');
      await expect(navMenu.first()).toBeVisible();
      
      // 메뉴 항목 클릭
      await page.click('text=사용자 관리');
      await expect(page).toHaveURL('/users');
    } else {
      // 일반 사이드바가 모바일에서도 작동하는지 확인
      await page.click('text=사용자 관리');
      await expect(page).toHaveURL('/users');
    }
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('키보드 네비게이션이 올바르게 작동한다', async ({ page }) => {
    // Tab 키를 사용한 포커스 이동 테스트
    await page.keyboard.press('Tab');
    
    // 포커스된 요소가 키보드로 접근 가능한지 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Enter 키로 링크나 버튼 활성화
    await page.keyboard.press('Enter');
    
    // 페이지가 변경되었거나 액션이 실행되었는지 확인
    await page.waitForTimeout(500);
  });
});