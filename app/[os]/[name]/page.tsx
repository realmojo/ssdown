import { notFound } from "next/navigation";
import { getApp } from "@/lib/app-utils";
import { FaqItem } from "@/types/app";
import { Download, ShieldCheck, Star, ThumbsUp, XCircle, CheckCircle2, ChevronDown } from "lucide-react";

export const revalidate = 86400;

export default async function AppDownloadPage({
  params,
}: {
  params: Promise<{ os: string; name: string }>;
}) {
  const { os, name } = await params;
  const app = await getApp(os, name);

  if (!app) notFound();

  const securityLabel = {
    Safe: "안전",
    Warning: "주의",
    Dangerous: "위험",
    Unknown: "확인 중",
  }[app.download.security.status];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* ── Hero / Header ── */}
      <section className="bg-white border-b py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6">

          {/* 아이콘 */}
          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
            {app.content.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.content.iconUrl} alt={app.core.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400">{app.core.name.charAt(0)}</span>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {app.core.name}
              <span className="text-gray-400 font-normal text-xl ml-2">for {app.core.platform}</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {app.core.developer.name}
              {app.core.category.main && ` · ${app.core.category.main}`}
              {app.core.category.sub && app.core.category.sub !== app.core.category.main && ` > ${app.core.category.sub}`}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm font-medium">
              {app.rating.average > 0 && (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {app.rating.average.toFixed(1)}
                  {app.rating.totalCount > 0 && (
                    <span className="text-gray-400 font-normal">({app.rating.totalCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                {app.download.license}
              </span>
              {app.core.version && (
                <span className="text-gray-400">v{app.core.version}</span>
              )}
              {app.download.downloadCount && (
                <span className="text-gray-500">다운로드 {app.download.downloadCount}</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2 shrink-0">
            <a
              href={app.download.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-64 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-green-200"
            >
              <Download className="w-6 h-6" />
              <span>무료 다운로드</span>
            </a>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>보안 {securityLabel} · {app.download.fileSize}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 본문 ── */}
      <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8 py-8 px-4 sm:px-6 lg:px-8">

        {/* ── 왼쪽 콘텐츠 ── */}
        <div className="flex-1 space-y-8 min-w-0">

          {/* 요약 */}
          {app.content.shortSummary && (
            <p className="text-gray-700 text-base leading-relaxed">{app.content.shortSummary}</p>
          )}

          {/* 장점 / 단점 */}
          {(app.content.pros.length > 0 || app.content.cons.length > 0) && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-5">장점 및 단점</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {app.content.pros.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                      <ThumbsUp className="w-5 h-5" /> 장점
                    </h3>
                    <ul className="space-y-2">
                      {app.content.pros.map((pro: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {app.content.cons.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                      <XCircle className="w-5 h-5" /> 단점
                    </h3>
                    <ul className="space-y-2">
                      {app.content.cons.map((con: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 스크린샷 */}
          {app.content.screenshotUrls.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">스크린샷</h2>
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
                {app.content.screenshotUrls.map((url: string, idx: number) => (
                  <div key={idx} className="w-80 h-48 shrink-0 bg-gray-200 rounded-xl overflow-hidden snap-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 상세 설명 */}
          {app.content.bodyHtml && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">{app.core.name} 상세 정보</h2>
              <div
                className="prose prose-sm prose-blue max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: app.content.bodyHtml }}
              />
            </section>
          )}

          {/* FAQ */}
          {app.content.faq.length > 0 && (
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">자주 묻는 질문</h2>
              <div className="space-y-3">
                {app.content.faq.map((item: FaqItem, idx: number) => (
                  <details key={idx} className="group border border-gray-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 font-medium text-gray-800 hover:bg-gray-50 list-none">
                      <span>{item.question}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── 오른쪽 사이드바 ── */}
        <div className="lg:w-72 shrink-0 space-y-6">

          {/* 앱 사양 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">앱 사양</h3>
            <dl className="space-y-3 text-sm">
              {app.core.version && (
                <div>
                  <dt className="text-gray-400 mb-0.5">버전</dt>
                  <dd className="font-medium text-gray-900">{app.core.version}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-400 mb-0.5">라이선스</dt>
                <dd className="font-medium text-gray-900">{app.download.license}</dd>
              </div>
              {app.download.fileSize && app.download.fileSize !== 'N/A' && (
                <div>
                  <dt className="text-gray-400 mb-0.5">파일 크기</dt>
                  <dd className="font-medium text-gray-900">{app.download.fileSize}</dd>
                </div>
              )}
              {app.download.downloadCount && (
                <div>
                  <dt className="text-gray-400 mb-0.5">다운로드</dt>
                  <dd className="font-medium text-gray-900">{app.download.downloadCount}</dd>
                </div>
              )}
              {app.specs.osRequirements && (
                <div>
                  <dt className="text-gray-400 mb-0.5">OS 요구사항</dt>
                  <dd className="font-medium text-gray-900">{app.specs.osRequirements}</dd>
                </div>
              )}
              {app.specs.languages.length > 0 && (
                <div>
                  <dt className="text-gray-400 mb-0.5">언어</dt>
                  <dd className="font-medium text-gray-900">{app.specs.languages.join(", ")}</dd>
                </div>
              )}
              {app.specs.lastUpdatedDate && (
                <div>
                  <dt className="text-gray-400 mb-0.5">업데이트</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(app.specs.lastUpdatedDate).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
              )}
              {app.core.developer.name && (
                <div>
                  <dt className="text-gray-400 mb-0.5">개발사</dt>
                  <dd className="font-medium text-gray-900">
                    {app.core.developer.websiteUrl ? (
                      <a href={app.core.developer.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {app.core.developer.name}
                      </a>
                    ) : app.core.developer.name}
                  </dd>
                </div>
              )}
              {app.core.supportedPlatforms.length > 1 && (
                <div>
                  <dt className="text-gray-400 mb-0.5">지원 플랫폼</dt>
                  <dd className="font-medium text-gray-900">{app.core.supportedPlatforms.join(", ")}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* 보안 정보 */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-8 h-8 shrink-0 ${
                app.download.security.status === 'Safe' ? 'text-green-500' :
                app.download.security.status === 'Warning' ? 'text-yellow-500' :
                app.download.security.status === 'Dangerous' ? 'text-red-500' : 'text-gray-400'
              }`} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">보안 상태: {securityLabel}</p>
                {app.download.security.scanProvider && (
                  <p className="text-xs text-gray-400">{app.download.security.scanProvider}</p>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
