-- SSDown Blogs 테이블 생성
CREATE TABLE IF NOT EXISTS ssdown_blogs (
  id TEXT PRIMARY KEY,
  title JSONB NOT NULL,
  excerpt JSONB NOT NULL,
  content JSONB NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'SSDown Team',
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image TEXT DEFAULT '/logo.png',
  read_time INTEGER DEFAULT 5,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived'))
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_ssdown_blogs_category ON ssdown_blogs(category);
CREATE INDEX IF NOT EXISTS idx_ssdown_blogs_status ON ssdown_blogs(status);
CREATE INDEX IF NOT EXISTS idx_ssdown_blogs_published_at ON ssdown_blogs(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ssdown_blogs_tags ON ssdown_blogs USING GIN(tags);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_ssdown_blogs_updated_at
  BEFORE UPDATE ON ssdown_blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- 공개 읽기는 허용, 쓰기는 인증된 사용자만
ALTER TABLE ssdown_blogs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 published 상태의 블로그만 읽을 수 있도록
CREATE POLICY "Public can read published blogs"
  ON ssdown_blogs
  FOR SELECT
  USING (status = 'published');

-- 인증된 사용자만 블로그를 작성/수정/삭제할 수 있도록 (필요시 활성화)
-- CREATE POLICY "Authenticated users can manage blogs"
--   ON ssdown_blogs
--   FOR ALL
--   USING (auth.role() = 'authenticated');

