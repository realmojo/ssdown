import { NextRequest, NextResponse } from "next/server";

export const proxy = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  let lambdaUrl = "";
  // /api/x/download를 Lambda Function URL로 프록시
  if (pathname.includes("/api/x/download")) {
    lambdaUrl =
      "https://tu3twecupegqsmxdc5z5gvmafe0rgzph.lambda-url.ap-northeast-2.on.aws";
  } else if (pathname.includes("/api/tiktok/download")) {
    lambdaUrl =
      "https://7dbpidoqi3w6lcauapb2n4ayum0djxlq.lambda-url.ap-northeast-2.on.aws";
  } else if (pathname.includes("/api/facebook/download")) {
    lambdaUrl =
      "https://oaax6o5palw36wmgzs4t6rnzey0vmqyc.lambda-url.ap-northeast-2.on.aws";
  } else if (pathname.includes("/api/instagram/download")) {
    lambdaUrl =
      "https://ysemizi4gdsdz72y3lg53gqr3m0qdxer.lambda-url.ap-northeast-2.on.aws";
  } else if (pathname.includes("/api/dailymotion/download")) {
    lambdaUrl =
      "https://o6hzykegrhno3ljhitqqorlbku0ifmhm.lambda-url.ap-northeast-2.on.aws";
  } else if (pathname.includes("/api/9gag/download")) {
    lambdaUrl =
      "https://lltgu4ljkbenhhvlhvbelzhiq40kiubz.lambda-url.ap-northeast-2.on.aws";
  } else if (pathname.includes("/api/bilibili/download")) {
    lambdaUrl = "";
  }

  if (lambdaUrl === "") {
    // Lambda URL이 없으면 기존 API 라우트로 진행
    return;
  }

  // Lambda Function URL로 프록시
  const url = new URL(request.url);
  const queryParams = url.searchParams.toString();
  const proxyUrl = `${lambdaUrl}${queryParams ? `?${queryParams}` : ""}`;

  try {
    const proxyResponse = await fetch(proxyUrl, {
      method: request.method,
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Accept: request.headers.get("accept") || "*/*",
      },
      // 요청 본문이 있으면 전달
      body:
        request.method !== "GET" && request.method !== "HEAD"
          ? await request.text()
          : undefined,
    });

    // Lambda 응답을 그대로 반환 (스트리밍 지원)
    const responseHeaders = new Headers();
    proxyResponse.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Proxy failed", message: error?.message },
      { status: 500 }
    );
  }
};
