interface PublicPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PublicPageShell({ eyebrow, title, description, children }: PublicPageShellProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,#0758d6,#0a7bf5)]" />
      <div
        className="absolute inset-x-0 top-0 h-72 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-white">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">{description}</p>
        </div>
        <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/95 p-4 shadow-2xl shadow-blue-950/15 backdrop-blur sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}
