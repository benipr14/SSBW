import { Link } from 'react-router-dom';

export default function Portada() {
  return (
    <main className="min-h-screen px-4 py-10 bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-4xl">
        <header className="mb-8 rounded-2xl bg-white p-8 shadow-md">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Tarea 10 · Portada</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Portada · Tarea 10</h1>
          <p className="mt-2 text-slate-600">Bienvenido. Usa las pestañas para navegar entre las secciones y visita la SPA para ver componentes interactivos.</p>
        </header>

        <nav className="mb-6">
          <div className="tabs">
            <a className="tab tab-lifted tab-active">Inicio</a>
            <a className="tab tab-lifted">Noticias</a>
            <Link className="tab tab-lifted" to="/tarea9">Tarea 9</Link>
          </div>
        </nav>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Introducción</h2>
          <p className="text-slate-700">También puedes ir al <Link to="/carousel" className="text-indigo-600 underline">carrousel</Link> o a la <Link to="/tarea9" className="text-indigo-600 underline">Tarea 9</Link> para ver las galerías interactivas.</p>
        </section>
      </section>
    </main>
  );
}

