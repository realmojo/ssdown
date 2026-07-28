import { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/privacy`;

  return {
    title: "개인정보처리방침 - SSDown",
    description:
      "SSDown의 개인정보처리방침, 구글 애드센스 데이터 이용, 온라인 도구 사용 시 데이터를 다루는 방식을 안내합니다.",
    openGraph: {
      title: "개인정보처리방침 - SSDown",
      description:
        "SSDown의 개인정보처리방침, 구글 애드센스 데이터 이용, 온라인 도구 사용 시 데이터를 다루는 방식을 안내합니다.",
      url: canonical,
      siteName: "SSDown",
      locale: "ko_KR",
      type: "website",
    },
    alternates: buildAlternates(new URL(canonical).pathname),
  };
}

export default async function PrivacyPage() {
  return (
    <div className="container py-12 md:py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last Updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="space-y-6">
        {/* Section 1: Information We Collect */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              1. 수집하는 정보
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              <strong>개인정보:</strong> 저희는 이름, 이메일 주소, 전화번호 등 개인을 식별할 수 있는 정보를 일절 수집하지 않습니다. 완전히 익명으로 서비스를 이용하실 수 있습니다.
            </p>
            <p>
              <strong>이용 데이터 (로그 파일):</strong> 기술적 문제 해결과 트래픽 분석을 위해 일반적인 서버 로그를 사용합니다. 여기에는 IP 주소, 브라우저 종류, 유입 경로, 접속 시각이 포함됩니다. 이 로그는 오직 운영 목적으로만 쓰이며 어떤 개인 프로필과도 연결되지 않습니다.
            </p>
            <p>
              <strong>제출된 콘텐츠 ("무기록" 정책):</strong> 이용자가 입력한 콘텐츠는 오직 도구의 결과를 제공하기 위해서만 처리합니다. 저희는 처리한 콘텐츠의 이력을
              <strong> NOT</strong> 보관하지 않습니다. 결과가 만들어지고 페이지를 벗어나면, 입력한 데이터는 이용자가 조회할 수 있는 어떤 이력 데이터베이스에도 남지 않습니다.
            </p>
          </div>
        </div>

        {/* Section 2: Cookies & Third Party Ads (AdSense) */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
              2. 구글 애드센스 및 제3자 쿠키
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              이 사이트는 <strong>Google AdSense</strong> 를 이용해 광고를 게재합니다. 제3자 공급업체인 구글은 이 사이트에 광고를 노출하기 위해 쿠키를 사용합니다.
            </p>
            <ul className="list-disc list-inside ml-2 space-y-2">
              <li>
                <strong>DoubleClick DART 쿠키:</strong> 구글은 DART 쿠키를 이용해 이용자가 이 사이트와 인터넷상의 다른 사이트를 방문한 기록을 바탕으로 광고를 노출할 수 있습니다.
              </li>
              <li>
                <strong>수신 거부:</strong> Users may opt-out of the use of the
                DART cookie by visiting the Google Ad and Content Network
                privacy policy at{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://policies.google.com/technologies/ads
                </a>
              </li>
            </ul>
            <p className="text-sm mt-2">
              제3자 광고주가 사용하는 이러한 쿠키에 대해 저희는 접근 권한도 통제 권한도 없습니다. 자세한 내용은 해당 광고 서버 각각의 개인정보처리방침을 확인해 주시기 바랍니다.
            </p>
          </div>
        </div>

        {/* Section 3: General Cookies */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              3. 쿠키 사용
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              이용 편의를 위해 일반적인 쿠키를 사용합니다(예: 다크 모드·라이트 모드 설정 기억). 이 쿠키들은 전적으로 안전하며 민감한 개인정보를 담지 않습니다.
            </p>
            <p>
              <strong>분석 도구:</strong> 전체적인 트래픽 흐름을 파악하기 위해 구글 애널리틱스 같은 도구를 사용할 수 있습니다(예: "프랑스에서 몇 명이 방문했는가?"). 이 데이터는 익명 처리되며 IP 주소는 저장 전에 대부분 가려집니다.
            </p>
          </div>
        </div>

        {/* Section 4: Data Security */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              4. 데이터 보안
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              저희는 데이터 보안을 중요하게 생각하지만, 인터넷을 통한 어떤 전송 방식도 100% 안전하지는 않다는 점을 알아 두시기 바랍니다. 통신을 보호하기 위해 통상적으로 인정되는 수단(SSL/HTTPS)을 사용하고자 노력하지만 절대적인 보안을 보장할 수는 없습니다.
            </p>
          </div>
        </div>

        {/* Section 5: Children's Privacy */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              5. Children's Privacy
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              본 서비스는 만 13세 미만을 대상으로 하지 않습니다. 저희는 만 13세 미만 아동의 개인식별정보를 고의로 수집하지 않습니다. 부모 또는 보호자로서 자녀가 저희에게 개인정보를 제공한 사실을 알게 되셨다면 연락해 주시기 바랍니다.
            </p>
          </div>
        </div>

        {/* Section 6: Changes */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              6. 방침의 변경
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              본 개인정보처리방침은 수시로 개정될 수 있습니다. 변경 사항은 이 페이지에 게시되는 즉시 효력이 발생합니다. 주기적으로 확인해 주시기를 권장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
