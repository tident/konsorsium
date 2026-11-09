// src/app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-6 md:px-8 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-xs text-slate-500">
          © 2026 Tim Konsorsium. All rights reserved.
        </p>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Bantuan</span>
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privasi</span>
          <span className="hover:text-indigo-600 cursor-pointer transition-colors">Ketentuan</span>
        </div>
      </div>
    </footer>
  );
}