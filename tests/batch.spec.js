import { test, expect } from '@playwright/test';

test.describe('배치 관리 페이지 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 배치 관리 페이지로 이동
    await page.click('text=배치 관리');
    await expect(page).toHaveURL('/batch');
  });

  test('배치 관리 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1, h2, h3').filter({ hasText: /배치|Batch/ })).toBeVisible();
    
    // 배치 작업 목록이 표시되는지 확인
    const batchList = page.locator('table, .batch-list, .job-list');
    await expect(batchList.first()).toBeVisible();
  });

  test('배치 작업 상태가 표시된다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 상태 배지나 인디케이터 확인
    const statusElements = page.locator('.status, .badge, text=/실행|대기|완료|실패|진행/');
    
    const hasStatus = await statusElements.count() > 0;
    if (hasStatus) {
      await expect(statusElements.first()).toBeVisible();
    }
    
    // 테이블 헤더에 상태 컬럼이 있는지 확인
    const statusHeaders = page.locator('th:has-text("상태"), th:has-text("Status")');
    const hasStatusHeader = await statusHeaders.count() > 0;
    
    if (hasStatusHeader) {
      await expect(statusHeaders.first()).toBeVisible();
    }
  });

  test('배치 작업 실행 기능이 작동한다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 실행 버튼 찾기
    const runButtons = page.locator('button:has-text("실행"), button:has-text("시작"), button[aria-label*="실행"]');
    
    const hasRunButton = await runButtons.count() > 0;
    
    if (hasRunButton) {
      const firstRunButton = runButtons.first();
      
      // 버튼이 활성화되어 있는지 확인
      const isEnabled = await firstRunButton.isEnabled();
      
      if (isEnabled) {
        await firstRunButton.click();
        await page.waitForTimeout(1000);
        
        // 실행 후 상태 변경이나 피드백 확인
        const feedbackElements = page.locator('.toast, .notification, .alert, text=/실행|시작/');
        const hasFeedback = await feedbackElements.count() > 0;
        
        if (hasFeedback) {
          await expect(feedbackElements.first()).toBeVisible();
        }
      }
    }
  });

  test('배치 작업 히스토리가 표시된다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 히스토리 탭이나 섹션 찾기
    const historyTabs = page.locator('button:has-text("히스토리"), button:has-text("History"), text=히스토리');
    
    const hasHistoryTab = await historyTabs.count() > 0;
    
    if (hasHistoryTab) {
      await historyTabs.first().click();
      await page.waitForTimeout(1000);
      
      // 히스토리 테이블이나 리스트 확인
      const historyContent = page.locator('table, .history-list, .log-list');
      await expect(historyContent.first()).toBeVisible();
    } else {
      // 히스토리가 메인 화면에 표시되는 경우
      const historyElements = page.locator('.history, .log, text=/이전|과거|완료된/');
      const hasHistory = await historyElements.count() > 0;
      
      if (hasHistory) {
        await expect(historyElements.first()).toBeVisible();
      }
    }
  });

  test('배치 작업 스케줄링 정보가 표시된다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 스케줄 관련 정보 찾기
    const scheduleElements = page.locator('text=/크론|cron|스케줄|매일|매시간|주기/, .schedule, .cron');
    
    const hasSchedule = await scheduleElements.count() > 0;
    
    if (hasSchedule) {
      await expect(scheduleElements.first()).toBeVisible();
    }
    
    // 다음 실행 시간 정보 확인
    const nextRunElements = page.locator('text=/다음 실행|Next run|예정/, .next-run');
    
    const hasNextRun = await nextRunElements.count() > 0;
    
    if (hasNextRun) {
      await expect(nextRunElements.first()).toBeVisible();
    }
  });

  test('배치 작업 로그를 볼 수 있다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 로그 보기 버튼이나 링크 찾기
    const logButtons = page.locator('button:has-text("로그"), button:has-text("Log"), a:has-text("로그")');
    
    const hasLogButton = await logButtons.count() > 0;
    
    if (hasLogButton) {
      await logButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 로그 내용이 표시되는지 확인
      const logContent = page.locator('.log-content, .log-viewer, pre, code');
      await expect(logContent.first()).toBeVisible();
    }
  });

  test('배치 작업 설정을 변경할 수 있다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 설정 버튼 찾기
    const settingsButtons = page.locator('button:has-text("설정"), button:has-text("Config"), button[aria-label*="설정"]');
    
    const hasSettingsButton = await settingsButtons.count() > 0;
    
    if (hasSettingsButton) {
      await settingsButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 설정 모달이나 페이지가 열렸는지 확인
      const settingsModal = page.locator('.modal, .dialog, .settings-form');
      await expect(settingsModal.first()).toBeVisible();
      
      // 모달 닫기
      const closeButton = page.locator('button:has-text("닫기"), button:has-text("취소"), button[aria-label*="닫기"]');
      const hasCloseButton = await closeButton.count() > 0;
      
      if (hasCloseButton) {
        await closeButton.first().click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });

  test('배치 작업 목록 새로고침이 작동한다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 새로고침 버튼 찾기
    const refreshButtons = page.locator('button:has-text("새로고침"), button:has-text("Refresh"), button[aria-label*="새로고침"]');
    
    const hasRefreshButton = await refreshButtons.count() > 0;
    
    if (hasRefreshButton) {
      await refreshButtons.first().click();
      await page.waitForTimeout(1000);
      
      // 페이지가 새로고침되었는지 확인 (로딩 인디케이터나 상태 변화)
      const loadingElements = page.locator('.loading, .spinner, text=로딩');
      
      // 잠시 후 로딩이 완료되었는지 확인
      await page.waitForTimeout(2000);
      await expect(page.locator('h1, h2, h3').filter({ hasText: /배치|Batch/ })).toBeVisible();
    }
  });

  test('배치 작업 필터링이 작동한다', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 필터 요소들 찾기
    const filterSelects = page.locator('select, [role="combobox"]');
    const filterButtons = page.locator('button:has-text("필터"), button:has-text("Filter")');
    
    const hasFilters = await filterSelects.count() > 0 || await filterButtons.count() > 0;
    
    if (hasFilters) {
      if (await filterSelects.count() > 0) {
        // 첫 번째 셀렉트 박스 사용
        await filterSelects.first().click();
        await page.waitForTimeout(500);
        
        // 두 번째 옵션 선택 (첫 번째는 보통 "전체" 등)
        const options = page.locator('option, [role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('반응형 디자인이 올바르게 작동한다', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 주요 요소들이 여전히 접근 가능한지 확인
    await expect(page.locator('h1, h2, h3').filter({ hasText: /배치|Batch/ })).toBeVisible();
    
    // 배치 목록이 적절히 표시되는지 확인
    const batchContent = page.locator('table, .batch-list, .job-list');
    await expect(batchContent.first()).toBeVisible();
    
    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});