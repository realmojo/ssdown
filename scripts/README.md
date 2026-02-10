# 블로그 포스트 마이그레이션 스크립트

이 스크립트는 정적 포스트 데이터를 Supabase 데이터베이스로 마이그레이션합니다.

## 사전 요구사항

1. Supabase 프로젝트가 생성되어 있어야 합니다.
2. `ssdown_blogs` 테이블이 생성되어 있어야 합니다.
3. 환경 변수가 설정되어 있어야 합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 사용 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 스크립트 실행

```bash
# tsx를 사용하는 경우
npx tsx scripts/migrate-posts-to-supabase.ts

# 또는 ts-node를 사용하는 경우
npx ts-node scripts/migrate-posts-to-supabase.ts
```

## 동작 방식

1. `lib/posts/all-posts.ts`에서 모든 정적 포스트를 읽어옵니다.
2. 각 포스트를 Supabase 스키마 형식으로 변환합니다:
   - `title`, `excerpt`, `content`는 JSONB 형식으로 저장 (영어/한국어)
   - `tags`는 배열로 저장
   - 날짜 필드는 ISO 형식으로 변환
3. 기존 포스트가 있으면 건너뛰고, 없으면 삽입합니다.
4. 마이그레이션 결과를 출력합니다.

## 주의사항

- 이미 존재하는 포스트는 건너뜁니다 (중복 방지).
- Supabase 연결 실패 시 오류를 출력하고 계속 진행합니다.
- 마이그레이션 후에는 `lib/blog-utils.ts`가 자동으로 Supabase에서 데이터를 가져옵니다.
