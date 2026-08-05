import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold text-[#2563EB] mb-4">404</p>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Страница не найдена</h1>
      <Link to="/" className="text-[#2563EB] hover:underline">
        На главную
      </Link>
    </div>
  );
}
