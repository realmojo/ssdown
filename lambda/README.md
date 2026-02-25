# X Saver - AWS Lambda Deployment Guide

`/api/x/download/route.ts`의 기능을 AWS Lambda로 옮기기 위한 가이드입니다.
이 람다 함수는 **AWS Lambda Function URL**과 **Response Streaming** 기능을 사용하여 대용량 파일도 안정적으로 다운로드할 수 있게 해줍니다.

## 1. 전제 조건

- AWS 계정
- Node.js 18.x 또는 20.x 런타임 사용

## 2. 배포 방법 (AWS 콘솔 사용)

1. **AWS Lambda 콘솔 접속**
   - [Functions 페이지](https://console.aws.amazon.com/lambda/home#/functions)로 이동합니다.
   - **Create function** 클릭.

2. **함수 생성**
   - **Function name**: `ssdown-x-download` (원하는 이름)
   - **Runtime**: `Node.js 20.x` (또는 18.x)
   - **Architecture**: `x86_64` (또는 arm64)
   - **Create function** 클릭.

3. **코드 업로드**
   - 생성된 함수의 **Code** 탭으로 이동.
   - 프로젝트 `lambda/x-download/index.mjs` 파일의 내용을 복사하여 `index.mjs`에 붙여넣습니다. (기본 `index.mjs` 내용을 지우고 덮어쓰기)
   - **Deploy** 클릭.

4. **Function URL 활성화 (중요)**
   - **Configuration** 탭 -> **Function URL** 메뉴 선택.
   - **Create function URL** 클릭.
   - **Auth type**: `NONE` (누구나 접근 가능하게 하려면)
   - **Invoke mode**: **`RESPONSE_STREAM`** (반드시 이것을 선택해야 스트리밍 다운로드가 작동함)
   - **Save** 클릭.

5. **제한 시간 및 메모리 설정**
   - **Configuration** 탭 -> **General configuration** -> **Edit**.
   - **Timeout**: `5 min` 이상 (파일이 클 경우를 대비해 15분 권장)
   - **Memory**: `128MB` 또는 `256MB` (스트리밍 방식이라 메모리를 많이 안 쓰지만, CPU 성능을 위해 약간 높여도 됨)
   - **Save**.

## 3. 웹사이트에 적용

Lambda Function URL이 생성되면 `https://<random-id>.lambda-url.<region>.on.aws/` 형식의 주소가 나옵니다.
웹사이트 코드(`/components/client/x-client.tsx` 등)에서 다운로드 엔드포인트를 이 URL로 교체하면 됩니다.

**예시:**

```typescript
// 기존
const downloadUrl = `/api/x/download?videoUrl=${encodeURIComponent(
  url,
)}&filename=${filename}`;

// 변경 후
const LAMBDA_URL = "https://abc12345.lambda-url.ap-northeast-2.on.aws/"; // 생성된 Function URL
const downloadUrl = `${LAMBDA_URL}?videoUrl=${encodeURIComponent(
  url,
)}&filename=${filename}`;
```

## 비용 참고

- Vercel Serverless Function(기본 핸들러)은 요청 수와 **전송 대역폭**에 따라 과금됩니다.
- AWS Lambda Function URL도 **요청 수**와 **실행 시간(GB-seconds)**, 그리고 **데이터 전송(Data Transfer Out)** 비용이 발생합니다.
- 하지만 Lambda Function URL을 사용하면 Vercel의 10초/60초 타임아웃 제한을 피할 수 있고, 스트리밍을 통해 메모리 효율적으로 대용량 파일을 처리할 수 있습니다.
