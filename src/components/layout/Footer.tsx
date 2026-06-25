export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <img src="/logo.png" alt="Roman Wrest Distro" className="h-20 w-auto" />
          <p className="text-[#888888] text-xs text-center sm:text-left">
            Córdoba Capital, Argentina · Envíos por Correo Argentino
          </p>
        </div>
        <p className="text-[#888888] text-sm">
          © {new Date().getFullYear()} Roman Wrest Distro. All rights reserved.
        </p>
      </div>
    </footer>
  )
}