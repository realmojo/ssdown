import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-400">ERROR 404</p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
            페이지를 찾을 수 없어요
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            주소가 잘못되었거나, 페이지가 이동 또는 삭제되었을 수 있습니다.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
            >
              <Home className="w-4 h-4" />
              홈으로 이동
            </a>
            <a
              href="/software"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              소프트웨어 둘러보기
            </a>
          </div>

          <a
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            이전으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
