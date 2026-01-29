export function AndroidAppLink({ className }: { className?: string }) {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=com.mojoday.ssdown"
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 mx-auto max-w-sm ${className}`}
    >
      <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
        </svg>
      </div>
      <div className="flex flex-col items-start min-w-0">
        <span className="text-xs leading-tight opacity-90 font-medium">
          Get the App on
        </span>
        <span className="text-lg font-bold leading-tight">Google Play</span>
      </div>
      <svg
        className="w-4 h-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
