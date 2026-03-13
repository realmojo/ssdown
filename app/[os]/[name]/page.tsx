import { notFound } from "next/navigation";
import { getMockApp } from "@/lib/mock-apps";
import { Download, ShieldCheck, Star, ThumbsUp, XCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default async function AppDownloadPage({
  params,
}: {
  params: Promise<{ os: string; name: string }>;
}) {
  const { os, name } = await params;
  const app = getMockApp(os, name);

  if (!app) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Banner / Hero Section */}
      <section className="bg-white border-b py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* App Icon */}
          <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-100 flex items-center justify-center">
            {app.content.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.content.iconUrl} alt={app.core.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400">{app.core.name.charAt(0)}</span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              {app.core.name} <span className="text-gray-500 font-normal text-xl">for {app.core.platform}</span>
            </h1>
            <p className="text-gray-600 mt-1">{app.core.developer.name} &bull; {app.core.category.main} &gt; {app.core.category.sub}</p>
            
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-700 font-medium">
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {app.rating.average} ({app.rating.totalCount.toLocaleString()})
              </span>
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                {app.download.license}
              </span>
              <span className="text-gray-500">{app.core.version}</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2 shrink-0">
            <button className="w-full md:w-64 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-green-200">
              <Download className="w-6 h-6" />
              <span>무료 다운로드</span>
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>보안 확인됨 (VirusTotal)</span>
            </div>
            <span className="text-xs text-gray-400">{app.download.fileSize} / {app.core.platform} 용</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8 py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Left Column (Content) */}
        <div className="flex-1 space-y-8">
          
          {/* Pros & Cons */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">장점 및 단점</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                  <ThumbsUp className="w-5 h-5" /> 장점
                </h3>
                <ul className="space-y-2">
                  {app.content.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                  <XCircle className="w-5 h-5" /> 아쉬운 점
                </h3>
                <ul className="space-y-2">
                  {app.content.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Screenshots Gallery (Mock) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">스크린샷</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {app.content.screenshotUrls.map((url, idx) => (
                <div key={idx} className="w-80 h-48 shrink-0 bg-gray-200 rounded-xl overflow-hidden snap-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Screenshot ${idx+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>

          {/* Description Body */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{app.core.name} 상세 정보</h2>
            <div 
              className="prose prose-blue max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: app.content.bodyHtml }}
            />
          </section>

        </div>

        {/* Right Column (Sidebar/Specs) */}
        <div className="lg:w-80 shrink-0 space-y-6">
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">앱 사양</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">버전</span>
                <span className="font-medium text-gray-900">{app.core.version}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">라이선스</span>
                <span className="font-medium text-gray-900">{app.download.license}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">OS 요구사항</span>
                <span className="font-medium text-gray-900">{app.specs.osRequirements}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">언어</span>
                <span className="font-medium text-gray-900">{app.specs.languages.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">업데이트 날짜</span>
                <span className="font-medium text-gray-900">{new Date(app.specs.lastUpdatedDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">개발 환경</span>
                <a href={app.core.developer.websiteUrl} className="font-medium text-blue-600 hover:underline">
                  {app.core.developer.name}
                </a>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
