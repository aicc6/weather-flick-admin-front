# Weather Flick Admin Frontend

Weather Flick 서비스 관리를 위한 관리자 대시보드 웹 애플리케이션입니다.

## 📋 프로젝트 개요

Weather Flick Admin Frontend는 서비스 운영진이 사용자, 콘텐츠, 시스템을 효율적으로 관리할 수 있는 React 기반 관리자 대시보드입니다.

### 주요 기능

- **관리자 인증**: 관리자 전용 로그인 및 권한 관리
- **사용자 관리**: 회원 정보 조회, 수정, 상태 관리
- **콘텐츠 관리**: 관광지 정보, 리뷰, 여행 계획 관리
- **시스템 관리**: 서비스 설정, 모니터링, 통계 대시보드
- **날씨 데이터**: 날씨 정보 및 API 상태 모니터링

## 🚀 기술 스택

| 카테고리 | 기술 | 버전 | 선택 이유 |
|---|---|---|---|
| **프레임워크** | React | 18.3.1 | 안정성과 생태계 지원 |
| **언어** | JavaScript (JSX) | ES2022 | 개발 속도 및 팀 역량 |
| **빌드 도구** | Vite | 6.3.5 | 빠른 개발 서버 |
| **스타일링** | TailwindCSS + Radix UI | 4.1.10 | 접근성 중심 디자인 |
| **상태 관리** | Redux Toolkit + RTK Query | 2.8.2 | 서버 상태 최적화 |
| **라우팅** | React Router | 7.6.2 | 최신 라우팅 시스템 |
| **폼 관리** | React Hook Form + Zod | 7.58.1 | 성능과 검증 |
| **HTTP 클라이언트** | Custom Fetch + RTK Query | - | 3중 레이어 구조 |
| **아이콘** | Lucide React | 0.522.0 | 가벼운 아이콘 세트 |

## 📁 프로젝트 구조

```
src/
├── components/          # 컴포넌트 (47개)
│   ├── ui/             # Radix UI 컴포넌트 (30개)
│   ├── auth/           # 인증 컴포넌트
│   ├── layouts/        # 레이아웃 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   └── providers/      # Provider 컴포넌트
├── features/           # 기능별 모듈
│   ├── auth/           # 인증 관리
│   ├── admins/         # 관리자 관리
│   ├── users/          # 사용자 관리
│   ├── content/        # 콘텐츠 관리
│   ├── system/         # 시스템 관리
│   └── weather/        # 날씨 관리
├── store/              # Redux 스토어
│   ├── api/            # RTK Query API (5개)
│   └── slices/         # 상태 슬라이스 (2개)
├── contexts/           # React Context (AuthContext)
├── lib/                # 커스텀 HTTP 클라이언트
├── services/           # API 서비스
├── hooks/              # 커스텀 훅
├── utils/              # 유틸리티 함수
└── constants/          # 상수 정의
```

## ⚙️ 설치 및 실행

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 개발 명령어

```bash
# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format
```

## 🔧 환경 설정

### 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정:

```env
# 관리자 API 서버 주소
VITE_API_BASE_URL=http://localhost:9000

# 애플리케이션 설정
VITE_APP_NAME=Weather Flick Admin
VITE_APP_VERSION=1.0.0

# 보안 설정
VITE_ADMIN_SESSION_TIMEOUT=3600000
```

## 🏗️ 아키텍처 특징

### 상태 관리 전략

- **RTK Query**: 서버 상태 관리 및 자동 캐싱 (Primary)
- **Redux Toolkit**: UI 상태 및 클라이언트 상태
- **Context API**: 인증 상태 관리

```javascript
// RTK Query 사용 예시 (서버 상태)
import { useGetAdminsQuery } from '@/store/api/adminsApi';
import { useGetUsersStatsQuery } from '@/store/api/usersApi';

const { data: admins, isLoading } = useGetAdminsQuery();
const { data: userStats } = useGetUsersStatsQuery();

// Context API 사용 예시 (인증)
const { user, login, logout } = useAuth();
```

### HTTP 통신 (3중 레이어 구조)

효율적인 API 통신을 위한 계층화된 구조:

```javascript
// 1. RTK Query API (주 사용)
import { useGetAdminsStatsQuery } from '@/store/api/adminsApi';
const { data: stats } = useGetAdminsStatsQuery();

// 2. 커스텀 HTTP 클라이언트
import { authHttp } from '@/lib/http';
const response = await authHttp.GET('/auth/admins/stats');

// 3. 기본 API 서비스
import { authAPI } from '@/services/api';
const result = await authAPI.getAdminStats();

// 자동 Bearer 토큰 관리
// 관리자 권한 검증 포함
// 에러 처리 및 재시도 로직
```

### 컴포넌트 설계

- **Feature-Based Architecture**: 기능별 모듈 구조
- **Radix UI**: 접근성을 고려한 UI 컴포넌트
- **JSDoc 타입 힌트**: TypeScript 없이도 타입 안정성

```javascript
/**
 * 관리자 통계 대시보드 컴포넌트
 * @param {Object} props
 * @param {Array} props.stats - 통계 데이터
 * @param {string} props.period - 조회 기간
 */
const AdminStatsCard = ({ stats, period }) => {
  // 컴포넌트 구현
};
```

## 🔗 백엔드 연동

### API 통신

FastAPI 관리자 백엔드와 RESTful API 통신:

```bash
# 관리자 백엔드 서버 실행 (weather-flick-admin-back)
cd ../weather-flick-admin-back
python run_dev.py  # 개발 서버 (포트: 9000)
```

### 주요 API 엔드포인트

- `/auth/*` - 관리자 인증
- `/auth/admins/*` - 관리자 관리
- `/users/*` - 사용자 관리 및 통계
- `/tourist-attractions/*` - 관광지 관리
- `/weather/*` - 날씨 데이터 조회
- `/api/v1/admin/system/*` - 시스템 상태 관리

**실제 구현된 엔드포인트 예시:**
```javascript
GET /auth/admins/stats     // 관리자 통계
GET /users/stats           // 사용자 통계
GET /tourist-attractions/  // 관광지 목록
GET /weather/summary-db    // 날씨 요약
```

## 📱 주요 페이지

### 1. 로그인 (`/login`)
- 관리자 전용 인증 시스템
- 보안 강화된 로그인 프로세스

### 2. 메인 대시보드 (`/`)
- 전체 서비스 통계 요약
- 실시간 모니터링 위젯

### 3. 사용자 관리 (`/users`)
- 회원 목록 및 상세 정보
- 계정 상태 관리 및 권한 설정

### 4. 콘텐츠 관리 (`/content`)
- 관광지 정보 편집
- 리뷰 및 여행 계획 승인

### 5. 시스템 관리 (`/system`)
- 서비스 설정 및 구성
- 로그 모니터링 및 알림 설정

### 6. 관리자 관리 (`/admins`)
- 관리자 계정 관리
- 권한 및 역할 설정

## 🔒 보안 고려사항

### 관리자 권한 관리

- **역할 기반 접근 제어**: 관리자 등급별 권한 분리
- **세션 관리**: 자동 로그아웃 및 동시 접속 제한
- **감사 로그**: 모든 관리자 활동 기록

```javascript
// 권한 확인 예시
const { hasPermission } = useAuth();

if (hasPermission('USER_MANAGEMENT')) {
  // 사용자 관리 기능 접근 허용
}
```

### 데이터 보호

- **민감 정보 마스킹**: 개인정보 보호
- **API 암호화**: HTTPS 통신 강제
- **입력 검증**: XSS 및 SQL Injection 방지

## 🧪 테스트

```bash
# 테스트 실행 (설정 후)
npm run test

# 커버리지 포함
npm run test:coverage

# E2E 테스트
npm run test:e2e
```

## 📦 배포

### 프로덕션 빌드

```bash
npm run build
```

### 정적 파일 서빙

빌드된 `dist/` 폴더를 웹 서버로 서빙:

```bash
# Nginx 설정 예시 (관리자 전용)
server {
    listen 443 ssl;
    server_name admin.your-domain.com;
    
    # SSL 설정 필수
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
        
        # IP 제한 (관리자 접근만 허용)
        allow 192.168.1.0/24;
        deny all;
    }
}
```

## 🤝 기여 가이드

1. **코딩 컨벤션**: ESLint + Prettier 설정 준수
2. **커밋 메시지**: Conventional Commits 사용
3. **보안 리뷰**: 관리자 기능 변경 시 보안 검토 필수
4. **PR 생성**: 린트 검사 및 테스트 통과 필수

## 📈 성능 최적화

- **Code Splitting**: 관리자 기능별 동적 임포트
- **Data Caching**: RTK Query를 통한 효율적 캐싱
- **Bundle Analysis**: 번들 크기 모니터링
- **Lazy Loading**: 관리 페이지별 지연 로딩

## 🔍 모니터링

### 관리자 활동 추적

- **사용자 행동 분석**: 관리자 작업 패턴 모니터링
- **성능 메트릭**: 페이지 로딩 시간 및 API 응답 시간
- **에러 트래킹**: 관리자 오류 실시간 모니터링

---

## 🔗 관련 프로젝트

- [weather-flick-admin-back](../weather-flick-admin-back/) - FastAPI 관리자 백엔드 서버
- [weather-flick-front](../weather-flick-front/) - 사용자 웹 애플리케이션
- [weather-flick-back](../weather-flick-back/) - 메인 백엔드 서버
- [weather-flick-batch](../weather-flick-batch/) - 데이터 수집 배치

**Weather Flick Admin** - 효율적인 서비스 관리를 위한 관리자 대시보드 🛠️📊