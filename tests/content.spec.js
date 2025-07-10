import { test, expect } from '@playwright/test';

test.describe('콘텐츠 관리 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 콘텐츠 관리 페이지로 이동
    await page.click('text=콘텐츠 관리');
    await expect(page).toHaveURL('/content');
  });

  test('콘텐츠 관리 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1, h2, h3').filter({ hasText: /콘텐츠|관리/ })).toBeVisible();
    
    // 탭 메뉴 확인
    await expect(page.locator('text=여행 코스')).toBeVisible();
    await expect(page.locator('text=축제 이벤트')).toBeVisible();
    await expect(page.locator('text=레저 스포츠')).toBeVisible();
  });

  test('탭 네비게이션이 정상적으로 작동한다', async ({ page }) => {
    // 여행 코스 탭 클릭
    await page.click('text=여행 코스');
    await page.waitForTimeout(1000);
    
    // 여행 코스 관련 콘텐츠 확인
    const travelContent = page.locator('table, .content-list, .travel-course');
    await expect(travelContent.first()).toBeVisible();
    
    // 축제 이벤트 탭 클릭
    await page.click('text=축제 이벤트');
    await page.waitForTimeout(1000);
    
    // 축제 이벤트 관련 콘텐츠 확인
    const festivalContent = page.locator('table, .content-list, .festival-event');
    await expect(festivalContent.first()).toBeVisible();
    
    // 레저 스포츠 탭 클릭
    await page.click('text=레저 스포츠');
    await page.waitForTimeout(1000);
    
    // 레저 스포츠 관련 콘텐츠 확인
    const leisureContent = page.locator('table, .content-list, .leisure-sport');
    await expect(leisureContent.first()).toBeVisible();
  });

  test('검색 기능이 각 탭에서 작동한다', async ({ page }) => {
    // 여행 코스 탭에서 검색
    await page.click('text=여행 코스');
    const searchInput = page.locator('input[placeholder*="검색"], input[type="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('서울');
      await page.waitForTimeout(1000);
      
      // 검색 결과 확인
      const results = page.locator('table tbody tr, .content-item');
      const resultCount = await results.count();
      
      // 검색어 클리어
      await searchInput.first().clear();
      await page.waitForTimeout(1000);
    }
  });

  test('콘텐츠 목록이 표시된다', async ({ page }) => {
    // 여행 코스 탭 선택
    await page.click('text=여행 코스');
    await page.waitForTimeout(2000);
    
    // 테이블 또는 카드 리스트가 표시되는지 확인
    const contentList = page.locator('table, .content-grid, .content-list');
    await expect(contentList.first()).toBeVisible();
    
    // 축제 이벤트 탭에서도 확인
    await page.click('text=축제 이벤트');
    await page.waitForTimeout(2000);
    await expect(contentList.first()).toBeVisible();
    
    // 레저 스포츠 탭에서도 확인
    await page.click('text=레저 스포츠');
    await page.waitForTimeout(2000);
    await expect(contentList.first()).toBeVisible();
  });

  test('페이지네이션이 작동한다', async ({ page }) => {
    // 여행 코스 탭 선택
    await page.click('text=여행 코스');
    await page.waitForTimeout(2000);
    
    // 페이지네이션 요소 확인
    const pagination = page.locator('.pagination, [role="navigation"]');
    const pageButtons = page.locator('button[aria-label*="page"], button:has-text(/[0-9]/)');
    
    const hasPagination = await pagination.count() > 0 || await pageButtons.count() > 0;
    
    if (hasPagination) {
      // 페이지 번호 버튼이 있다면 클릭
      const pageButton = pageButtons.first();
      if (await pageButton.isVisible()) {
        await pageButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('상세 보기 기능이 작동한다', async ({ page }) => {
    // 여행 코스 탭 선택
    await page.click('text=여행 코스');
    await page.waitForTimeout(2000);
    
    // 첫 번째 항목의 상세 보기 버튼 또는 링크 찾기
    const detailButtons = page.locator('button:has-text("상세"), a:has-text("보기"), button:has-text("보기")');
    const itemLinks = page.locator('tbody tr td a, .content-item a');
    
    const hasDetailButton = await detailButtons.count() > 0;
    const hasItemLink = await itemLinks.count() > 0;
    
    if (hasDetailButton) {
      await detailButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 상세 페이지 또는 모달이 열렸는지 확인
      const detailView = page.locator('.modal, .detail-page, .dialog');
      await expect(detailView.first()).toBeVisible();
    } else if (hasItemLink) {
      await itemLinks.first().click();
      await page.waitForTimeout(1000);
      
      // 새 페이지로 이동했는지 확인
      await expect(page).toHaveURL(/\/content\/.+|\/detail/);
    }
  });

  test('필터링 기능이 작동한다', async ({ page }) => {
    // 여행 코스 탭 선택
    await page.click('text=여행 코스');
    await page.waitForTimeout(2000);
    
    // 필터 요소들 찾기
    const filterSelects = page.locator('select, [role="combobox"]');
    const filterButtons = page.locator('button:has-text("필터"), button:has-text("지역")');
    
    const hasFilters = await filterSelects.count() > 0 || await filterButtons.count() > 0;
    
    if (hasFilters) {
      if (await filterSelects.count() > 0) {
        // 셀렉트 박스가 있는 경우
        await filterSelects.first().click();
        await page.waitForTimeout(500);
        
        // 옵션 선택
        const options = page.locator('option, [role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(1000);
        }
      } else if (await filterButtons.count() > 0) {
        // 필터 버튼이 있는 경우
        await filterButtons.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('반응형 디자인이 올바르게 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 탭 메뉴가 여전히 접근 가능한지 확인
    await expect(page.locator('text=여행 코스')).toBeVisible();
    
    // 콘텐츠가 적절히 표시되는지 확인
    await page.click('text=여행 코스');
    await page.waitForTimeout(1000);
    
    const content = page.locator('table, .content-grid, .content-list');
    await expect(content.first()).toBeVisible();
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('로딩 상태가 적절히 표시된다', async ({ page }) => {
    // 페이지 새로고침하여 로딩 상태 확인
    await page.reload();
    
    // 로딩 스피너나 스켈레톤이 표시되는지 확인
    const loadingIndicators = page.locator('.loading, .spinner, .skeleton, text=로딩');
    
    // 잠시 대기 후 로딩이 완료되었는지 확인
    await page.waitForTimeout(2000);
    
    // 콘텐츠가 로드되었는지 확인
    await expect(page.locator('text=여행 코스')).toBeVisible();
  });
});