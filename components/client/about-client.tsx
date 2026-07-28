"use client";

export function AboutClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 text-center bg-slate-50 dark:bg-slate-900/40">
        <div className="container px-4 md:px-6">
          <div className="inline-block px-3 py-1 mb-6 text-sm font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
            우리의 목표
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-700 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white">
            단순한 도구로, <br className="hidden md:block" /> 강력한 결과를.
          </h1>
          <p className="mx-auto max-w-[900px] text-slate-600 md:text-2xl dark:text-slate-400 leading-relaxed">
            SSDown은 어디에 있든 누구나 디지털 작업을 쉽고 자유롭게, 무료로 처리할 수 있게 만드는 데 집중합니다. 설치도, 비용도, 타협도 없습니다.
          </p>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 blur-3xl opacity-50" />
          <div className="absolute top-[20%] right-[10%] h-[30%] w-[30%] rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-3xl opacity-50" />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Sidebar/Quick Info */}
            <div className="lg:col-span-4 space-y-10">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">SSDown 한눈에 보기</h3>
                <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>100+</strong> 전문가용 도구</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>100%</strong> 브라우저 기반 처리</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>개인정보</strong> 우선 설계</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>글로벌</strong> 접근성</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                <h3 className="text-xl font-bold mb-4">저희를 응원해 주세요</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  SSDown은 계속 무료로 운영할 생각입니다. 저희 도구가 쓸모 있었다면, 널리 알려 주시는 것이 가장 큰 응원입니다.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                    SSDown 공유하기
                  </button>
                </div>
              </div>
            </div>

            {/* Main Narrative */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Our Story */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                  SSDown 이야기
                </h2>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  <p>
                    SSDown은 2023년, 단순한 문제의식에서 출발했습니다. 인터넷에는 '무료'를 내걸었지만 실제로는 무료가 아닌 도구가 너무 많다는 것이었습니다. 대부분 계정을 요구하거나, 팝업 광고 뒤에 다운로드 버튼을 숨기거나, 더 심하면 정체를 알 수 없는 서버에서 파일을 처리해 사용자의 개인정보를 위태롭게 했습니다.
                  </p>
                  <p>
                    저희 개발자와 디자이너로 이뤄진 작은 팀은 번거로움 없이 고품질 이미지 편집, PDF 관리, 영상 변환을 할 수 있는 플랫폼을 만들기로 했습니다. 브라우저 안에서 효율적으로 돌아가도록 알고리즘을 다듬는 데 몇 달을 들였고, 그 결과 저희 도구의 99%는 데이터가 기기를 벗어나지 않습니다.
                  </p>
                  <p>
                    지금 SSDown은 전 세계 수천 명의 사용자에게 필요한 도구를 한곳에서 제공하고 있습니다. 새벽 2시에 PDF를 손보는 학생이든, 사진 묶음을 압축하는 전문 사진가든 저희가 돕겠습니다.
                  </p>
                </div>
              </div>

              {/* Our Commitment */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                  무엇이 다른가
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">클라이언트 우선 처리</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      무거운 작업을 브라우저에서 처리하는 '엣지 컴퓨팅'을 우선합니다. 덕분에 속도가 빠르고 개인정보 보호 수준이 남다릅니다.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">성능 중심</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Next.js로 만들고 속도에 맞춰 최적화했습니다. 저희 도구는 가볍고 반응이 빠르며 바로 사용할 수 있습니다.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">커뮤니티 기반</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      제품 방향은 사용자 의견을 따라 정해집니다. 필요한 도구가 있으신가요? 아마 이미 만들고 있을 겁니다.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04 inter m-7.714 2.138a16.483 16.483 0 00-1.204 5.422c0 5.762 3.397 10.742 8.322 13.114a8.313 8.313 0 008.322-13.114 16.484 16.484 0 00-1.204-5.422L12 5.894z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">언제나 보안 우선</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      파일의 주인은 사용자입니다. 표준 암호화와 검증된 방식을 적용해 안전한 이용 환경을 지킵니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Founders / Team (Generic but personal) */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                  팀 소개
                </h2>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  <p>
                    SSDown은 전 세계의 개발자, 디자이너, 보안 애호가들이 함께 운영합니다. 좋은 소프트웨어 도구는 돈을 낸 사람만의 특권이 아니라 누구나 누릴 수 있는 것이어야 한다고 믿습니다.
                  </p>
                  <p>
                    핵심 엔지니어링 팀은 웹어셈블리와 브라우저 API를 파고들며 웹에서 가능한 것의 한계를 넓히고 있습니다. 콘텐츠 팀은 복잡한 디지털 미디어와 온라인 안전 문제를 헤쳐 나갈 수 있도록 깊이 있는 가이드를 꾸준히 만들고 있습니다.
                  </p>
                </div>
              </div>

              {/* Final CTA */}
              <div className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                  작업 흐름을 개선할 준비가 되셨나요?
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/tools"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
                  >
                    전체 도구 둘러보기
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent px-8 text-base font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    문의하기
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
