import Perritos from '../components/Perritos';
import Cuadros from '../components/Cuadros';

export default function Tarea9Page() {
  return (
    <main className="min-h-screen px-4 py-10 text-slate-800">
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <header className="text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.35em] text-indigo-500">Tarea 9 · SPA</p>
          <h1 className="font-garamond text-5xl italic text-slate-900 md:text-6xl">Galería de Tienda Prado</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 md:text-base">Dos componentes React: uno consume una API externa de perritos y el otro una API de la tienda.</p>
        </header>

        <div className="grid w-full gap-6 md:grid-cols-2">
          <Perritos />
          <Cuadros />
        </div>
      </section>
    </main>
  );
}
