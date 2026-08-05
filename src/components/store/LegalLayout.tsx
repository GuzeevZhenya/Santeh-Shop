export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{title}</h1>
      <p className="text-sm text-slate-400 mb-8">Редакция от {updated}</p>
      <div className="prose prose-slate max-w-none text-slate-600 space-y-4 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
