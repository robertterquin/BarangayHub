interface PublicPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PublicPageShell({ eyebrow, title, description, icon, children }: PublicPageShellProps) {
  return (
    <section className="relative min-h-[calc(100vh-86px)] overflow-hidden bg-[#eef6f8]">
      <div className="relative overflow-hidden bg-linear-to-br from-[#12378f] via-[#075fe1] to-[#1389ff]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.38) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.38) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.18),transparent_55%)]" />

        <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-blue-50">
            {eyebrow}
          </p>
          <div className="mt-4 flex items-start gap-3">
            {icon && (
              <span className="mt-1 hidden text-white/90 sm:block">
                {icon}
              </span>
            )}
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-sm sm:text-5xl">
              {title}
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-blue-50">
            {description}
          </p>
        </div>
      </div>

      <div className="relative mx-auto -mt-10 max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
