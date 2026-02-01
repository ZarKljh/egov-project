export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* 시스템 로고 (기존 Next 로고 위치) */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#003366] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">eGov</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#003366]">
            민원 문의 시스템
          </span>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-md text-4xl font-semibold leading-[1.2] tracking-tight text-black dark:text-zinc-50">
            신속하고 정확한 <br />
            <span className="text-[#003366]">민원 문의 서비스</span>를
            시작하세요.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            문의하신 내용은 담당자가 확인 후 성실히 답변해 드립니다. <br />
            로그인 후 게시판 기능을 이용하실 수 있습니다.
          </p>
        </div>

        {/* 버튼 섹션: 로그인 및 회원가입 */}
        <div className="flex flex-col gap-4 mt-12 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#003366] px-8 text-white transition-colors hover:bg-[#002244] dark:bg-zinc-50 dark:text-black dark:hover:bg-[#ccc] md:w-auto min-w-[140px]"
            href="/login"
          >
            로그인
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-8 transition-colors hover:border-[#003366] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-auto min-w-[140px]"
            href="/signup"
          >
            회원가입
          </a>
        </div>
      </main>
    </div>
  );
}
