import { test, expect } from '@playwright/test';

test.describe('대시보드 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 과정
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 대시보드 로드 대기
    await expect(page.locator('text=관리자 대시보드')).toBeVisible();
  });

  test('대시보드 메인 페이지가 정상적으로 로드된다', async ({ page }) => {
    // 헤더 요소들 확인
    await expect(page.locator('text=Weather Flick')).toBeVisible();
    await expect(page.locator('text=관리자 대시보드')).toBeVisible();
    
    // 시스템 상태 카드 확인
    await expect(page.locator('text=시스템 상태')).toBeVisible();
    
    // 통계 카드들 확인
    await expect(page.locator('text=오늘의 날씨')).toBeVisible();
    await expect(page.locator('text=사용자 현황')).toBeVisible();
    await expect(page.locator('text=관리자 현황')).toBeVisible();
    await expect(page.locator('text=여행지 현황')).toBeVisible();
    
    // 콘텐츠 관리 카드들 확인
    await expect(page.locator('text=여행 코스')).toBeVisible();
    await expect(page.locator('text=축제 이벤트')).toBeVisible();
    await expect(page.locator('text=레저 스포츠')).toBeVisible();
    
    // 날씨 통계 카드 확인
    await expect(page.locator('text=날씨 통계')).toBeVisible();
  });

  test('사이드바 네비게이션이 정상적으로 작동한다', async ({ page }) => {
    // 사이드바 메뉴 항목들 확인
    await expect(page.locator('text=대시보드')).toBeVisible();
    await expect(page.locator('text=사용자 관리')).toBeVisible();
    await expect(page.locator('text=관리자 관리')).toBeVisible();
    await expect(page.locator('text=콘텐츠 관리')).toBeVisible();
    await expect(page.locator('text=날씨 관리')).toBeVisible();
    await expect(page.locator('text=관광지 관리')).toBeVisible();
    await expect(page.locator('text=배치 관리')).toBeVisible();
    
    // 각 메뉴 클릭 테스트
    await page.click('text=사용자 관리');
    await expect(page).toHaveURL('/users');
    
    await page.click('text=관리자 관리');
    await expect(page).toHaveURL('/admins');
    
    await page.click('text=콘텐츠 관리');
    await expect(page).toHaveURL('/content');
    
    await page.click('text=배치 관리');
    await expect(page).toHaveURL('/batch');
    
    // 대시보드로 돌아가기
    await page.click('text=대시보드');
    await expect(page).toHaveURL('/');
  });

  test('테마 변경 기능이 정상적으로 작동한다', async ({ page }) => {
    // 테마 변경 버튼 클릭
    await page.click('button[aria-label="테마 변경"]');
    
    // DOM 클래스 변경 확인 (다크 모드 토글)
    const htmlElement = page.locator('html');
    
    // 다크 모드 활성화 확인
    await expect(htmlElement).toHaveClass(/dark/);
    
    // 다시 클릭하여 라이트 모드로 변경
    await page.click('button[aria-label="테마 변경"]');
    
    // 다크 모드 비활성화 확인
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test('사용자 드롭다운 메뉴가 정상적으로 작동한다', async ({ page }) => {
    // 사용자 아바타 클릭
    await page.click('button:has(svg)');
    
    // 드롭다운 메뉴 항목들 확인
    await expect(page.locator('text=설정')).toBeVisible();
    await expect(page.locator('text=로그아웃')).toBeVisible();
    
    // 메뉴 외부 클릭으로 닫기
    await page.click('main');
    await expect(page.locator('text=설정')).not.toBeVisible();
  });

  test('시스템 상태 정보가 표시된다', async ({ page }) => {
    // 시스템 상태 카드 내용 확인
    await expect(page.locator('text=전체 시스템')).toBeVisible();
    await expect(page.locator('text=서비스 & 데이터베이스')).toBeVisible();
    await expect(page.locator('text=외부 API')).toBeVisible();
    
    // 상태 배지들이 존재하는지 확인
    const statusBadges = page.locator('[role="status"], .status-badge, text=/정상|오류|대기/');
    await expect(statusBadges.first()).toBeVisible();
  });

  test('통계 데이터가 표시된다', async ({ page }) => {
    // 숫자 데이터가 표시되는지 확인 (0 이상의 숫자)
    const userStats = page.locator('text=사용자 현황').locator('..').locator('text=/\\d+/');
    await expect(userStats.first()).toBeVisible();
    
    const adminStats = page.locator('text=관리자 현황').locator('..').locator('text=/\\d+/');
    await expect(adminStats.first()).toBeVisible();
    
    const tourStats = page.locator('text=여행지 현황').locator('..').locator('text=/\\d+/');
    await expect(tourStats.first()).toBeVisible();
  });

  test('콘텐츠 관리 바로가기 링크가 작동한다', async ({ page }) => {
    // 여행 코스 관리 바로가기
    await page.click('text=여행 코스').locator('..').locator('button:has-text("관리 바로가기")');
    await expect(page).toHaveURL('/content');
    
    // 대시보드로 돌아가기
    await page.goto('/');
    
    // 축제 이벤트 관리 바로가기
    await page.click('text=축제 이벤트').locator('..').locator('button:has-text("관리 바로가기")');
    await expect(page).toHaveURL('/content');
    
    // 대시보드로 돌아가기
    await page.goto('/');
    
    // 레저 스포츠 관리 바로가기
    await page.click('text=레저 스포츠').locator('..').locator('button:has-text("관리 바로가기")');
    await expect(page).toHaveURL('/content');
  });
});