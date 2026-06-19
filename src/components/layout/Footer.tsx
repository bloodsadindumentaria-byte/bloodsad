export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="logo-display text-[#6B5CE7] text-lg tracking-widest">
          BLOOD SAD
        </span>
        <p className="text-[#888888] text-sm">
          © {new Date().getFullYear()} Blood Sad. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
