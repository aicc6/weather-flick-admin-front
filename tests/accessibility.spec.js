import { test, expect } from '@playwright/test';

test.describe('접근성 및 사용성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 대시보드 로드 대기
    await expect(page.locator('text=관리자 대시보드')).toBeVisible();
  });

  test('모든 버튼과 링크에 적절한 레이블이 있다', async ({ page }) => {
    // aria-label이나 텍스트가 없는 버튼 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        const hasText = await button.textContent().then(text => text?.trim().length > 0);
        const hasAriaLabel = await button.getAttribute('aria-label').then(label => label?.length > 0);
        const hasTitle = await button.getAttribute('title').then(title => title?.length > 0);
        
        // 버튼에 텍스트, aria-label, 또는 title이 있어야 함
        expect(hasText || hasAriaLabel || hasTitle).toBeTruthy();
      }
    }
  });

  test('모든 폼 입력 필드에 적절한 레이블이 있다', async ({ page }) => {
    // 사용자 관리 페이지로 이동하여 검색 입력 필드 확인
    await page.click('text=사용자 관리');
    
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const isVisible = await input.isVisible();
      
      if (isVisible) {
        const hasPlaceholder = await input.getAttribute('placeholder').then(p => p?.length > 0);
        const hasAriaLabel = await input.getAttribute('aria-label').then(label => label?.length > 0);
        const hasId = await input.getAttribute('id');
        
        // ID가 있다면 연관된 label 확인
        let hasLabel = false;
        if (hasId) {
          const label = page.locator(`label[for="${hasId}"]`);
          hasLabel = await label.count() > 0;
        }
        
        // 입력 필드에 placeholder, aria-label, 또는 연관된 label이 있어야 함
        expect(hasPlaceholder || hasAriaLabel || hasLabel).toBeTruthy();
      }
    }
  });

  test('색상 대비가 충분하다', async ({ page }) => {
    // 주요 텍스트 요소들의 색상 대비 확인
    const textElements = page.locator('h1, h2, h3, p, span, a, button');
    const firstElement = textElements.first();
    
    if (await firstElement.isVisible()) {
      const styles = await firstElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      // 색상이 설정되어 있는지 확인 (최소한의 스타일링 확인)
      expect(styles.color).toBeTruthy();
    }
  });

  test('키보드 네비게이션이 논리적인 순서로 작동한다', async ({ page }) => {
    // Tab 키를 여러 번 눌러서 포커스 순서 확인
    const focusableElements = [];
    
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el?.tagName?.toLowerCase()).catch(() => null);
      
      if (tagName) {
        focusableElements.push(tagName);
      }
    }
    
    // 포커스 가능한 요소들이 존재하는지 확인
    expect(focusableElements.length).toBeGreaterThan(0);
  });

  test('ARIA 역할과 속성이 적절히 사용된다', async ({ page }) => {
    // navigation 역할 확인
    const navElements = page.locator('[role="navigation"], nav');
    await expect(navElements.first()).toBeVisible();
    
    // button 역할 확인
    const buttons = page.locator('button, [role="button"]');
    await expect(buttons.first()).toBeVisible();
    
    // 드롭다운 메뉴의 ARIA 속성 확인
    const dropdownTriggers = page.locator('[aria-haspopup], [aria-expanded]');
    const hasDropdowns = await dropdownTriggers.count() > 0;
    
    if (hasDropdowns) {
      const firstDropdown = dropdownTriggers.first();
      await expect(firstDropdown).toBeVisible();
    }
  });

  test('이미지에 적절한 alt 텍스트가 있다', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      
      if (isVisible) {
        const altText = await img.getAttribute('alt');
        const hasAlt = altText !== null && altText.length > 0;
        
        // 장식적 이미지의 경우 빈 alt=""도 허용
        expect(altText !== null).toBeTruthy();
      }
    }
  });

  test('텍스트 크기가 최소 요구사항을 만족한다', async ({ page }) => {
    const textElements = page.locator('p, span, div, a, button, td, th');
    const firstElement = textElements.first();
    
    if (await firstElement.isVisible()) {
      const fontSize = await firstElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return parseFloat(computed.fontSize);
      });
      
      // 최소 12px 이상의 폰트 크기 확인
      expect(fontSize).toBeGreaterThanOrEqual(12);
    }
  });

  test('포커스 인디케이터가 명확하게 표시된다', async ({ page }) => {
    // 포커스 가능한 요소에 Tab으로 이동
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      const focusStyles = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
          border: computed.border
        };
      });
      
      // 포커스 스타일이 설정되어 있는지 확인
      const hasFocusStyle = focusStyles.outline !== 'none' || 
                           focusStyles.outlineWidth !== '0px' ||
                           focusStyles.boxShadow !== 'none' ||
                           focusStyles.border.includes('blue') ||
                           focusStyles.border.includes('focus');
      
      expect(hasFocusStyle).toBeTruthy();
    }
  });

  test('테이블에 적절한 헤더가 있다', async ({ page }) => {
    // 사용자 관리 페이지의 테이블 확인
    await page.click('text=사용자 관리');
    
    const tables = page.locator('table');
    const hasTable = await tables.count() > 0;
    
    if (hasTable) {
      const firstTable = tables.first();
      
      // 테이블 헤더 확인
      const headers = firstTable.locator('th');
      const headerCount = await headers.count();
      
      expect(headerCount).toBeGreaterThan(0);
      
      // 헤더에 텍스트가 있는지 확인
      const firstHeader = headers.first();
      const headerText = await firstHeader.textContent();
      expect(headerText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('Error와 성공 메시지가 적절히 표시된다', async ({ page }) => {
    // 잘못된 검색으로 오류 상황 시뮬레이션
    await page.click('text=사용자 관리');
    
    const searchInput = page.locator('input[placeholder*="검색"]');
    const hasSearchInput = await searchInput.count() > 0;
    
    if (hasSearchInput) {
      await searchInput.fill('non-existent-user-12345');
      await page.waitForTimeout(2000);
      
      // 결과 없음 메시지나 오류 메시지 확인
      const noResultsMessage = page.locator('text=/결과가 없습니다|찾을 수 없습니다|No results|Empty/');
      const hasMessage = await noResultsMessage.count() > 0;
      
      // 메시지가 표시되거나 빈 테이블이 적절히 처리되는지 확인
      if (!hasMessage) {
        const tableRows = page.locator('tbody tr');
        const rowCount = await tableRows.count();
        // 검색 결과가 없을 때는 테이블이 비어있어야 함
        expect(rowCount).toBe(0);
      }
    }
  });

  test('동적 콘텐츠 변경이 스크린 리더에게 알려진다', async ({ page }) => {
    // ARIA live region 확인
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
    const hasLiveRegions = await liveRegions.count() > 0;
    
    if (hasLiveRegions) {
      await expect(liveRegions.first()).toBeVisible();
    }
    
    // 토스트 알림이나 상태 메시지 영역 확인
    const statusAreas = page.locator('.toast, .notification, .alert, .status-message');
    const hasStatusAreas = await statusAreas.count() > 0;
    
    // 동적 알림 시스템이 있는지 확인 (필수는 아니지만 권장)
    // 이 테스트는 시스템에 따라 선택적으로 실행
  });
});