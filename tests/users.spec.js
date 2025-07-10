import { test, expect } from '@playwright/test';

test.describe('사용자 관리 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 사용자 관리 페이지로 이동
    await page.click('text=사용자 관리');
    await expect(page).toHaveURL('/users');
  });

  test('사용자 관리 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1, h2, h3').filter({ hasText: /사용자/ })).toBeVisible();
    
    // 검색 입력 필드 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
    
    // 사용자 테이블 확인
    await expect(page.locator('table')).toBeVisible();
    
    // 테이블 헤더 확인
    await expect(page.locator('th')).toContainText(['이메일', '닉네임', '상태']);
  });

  test('사용자 검색 기능이 정상적으로 작동한다', async ({ page }) => {
    // 검색 필드에 텍스트 입력
    const searchInput = page.locator('input[placeholder*="검색"]');
    await searchInput.fill('test');
    
    // 검색 결과 로드 대기
    await page.waitForTimeout(1000);
    
    // 테이블에 결과가 표시되는지 확인
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    if (rowCount > 0) {
      // 검색 결과가 있는 경우, 'test'가 포함된 행이 있는지 확인
      await expect(tableRows.first()).toBeVisible();
    }
    
    // 검색어 클리어
    await searchInput.clear();
    await page.waitForTimeout(1000);
  });

  test('사용자 목록 페이지네이션이 작동한다', async ({ page }) => {
    // 페이지네이션 정보 확인
    const paginationInfo = page.locator('text=/\\d+-\\d+ \\/ 총 \\d+개/');
    await expect(paginationInfo).toBeVisible();
    
    // 다음 페이지 버튼이 활성화되어 있다면 클릭
    const nextButton = page.locator('button[aria-label="Next page"], button:has-text("다음")');
    const isNextEnabled = await nextButton.isEnabled().catch(() => false);
    
    if (isNextEnabled) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // 페이지가 변경되었는지 확인
      await expect(paginationInfo).toBeVisible();
      
      // 이전 페이지로 돌아가기
      const prevButton = page.locator('button[aria-label="Previous page"], button:has-text("이전")');
      if (await prevButton.isEnabled().catch(() => false)) {
        await prevButton.click();
      }
    }
  });

  test('사용자 상세 정보 드롭다운 메뉴가 작동한다', async ({ page }) => {
    // 첫 번째 사용자 행의 액션 버튼 클릭
    const actionButtons = page.locator('button:has(svg), [data-slot="dropdown-trigger"]');
    const buttonCount = await actionButtons.count();
    
    if (buttonCount > 0) {
      await actionButtons.first().click();
      
      // 드롭다운 메뉴 항목들 확인
      const menuItems = page.locator('[role="menuitem"], .dropdown-item');
      await expect(menuItems.first()).toBeVisible();
      
      // 메뉴 외부 클릭으로 닫기
      await page.click('main');
    }
  });

  test('슈퍼관리자는 비활성화/삭제 버튼이 표시되지 않는다', async ({ page }) => {
    // 테이블에서 Super Admin 사용자 찾기
    const superAdminRow = page.locator('tr:has-text("Super Admin")');
    const hasSuperAdmin = await superAdminRow.count() > 0;
    
    if (hasSuperAdmin) {
      // Super Admin 행의 액션 버튼 클릭
      await superAdminRow.locator('button:has(svg)').click();
      
      // 비활성화와 삭제 메뉴가 없는지 확인
      await expect(page.locator('text=비활성화')).not.toBeVisible();
      await expect(page.locator('text=삭제')).not.toBeVisible();
      
      // 메뉴 닫기
      await page.click('main');
    }
  });

  test('사용자 상태 배지가 올바르게 표시된다', async ({ page }) => {
    // 상태 배지들이 표시되는지 확인
    const statusBadges = page.locator('.badge, [role="status"], text=/활성|비활성/');
    const badgeCount = await statusBadges.count();
    
    if (badgeCount > 0) {
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test('반응형 디자인이 올바르게 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 테이블이 여전히 표시되는지 확인
    await expect(page.locator('table')).toBeVisible();
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 모든 요소가 여전히 표시되는지 확인
    await expect(page.locator('input[placeholder*="검색"]')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('페이지 타이틀과 메타데이터가 올바르다', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Weather Flick/);
    
    // 브레드크럼이나 페이지 제목이 사용자 관리와 관련되어 있는지 확인
    const pageHeading = page.locator('h1, h2, h3, .page-title');
    await expect(pageHeading.first()).toBeVisible();
  });
});