import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';
import useSWR from 'swr';

type Producto = { id: number; titulo: string; imagen: string };

const API_PRODUCTOS = 'http://localhost/api/productos';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('No se pudieron obtener productos');
  }
  const json = await response.json();
  return json.data as Producto[];
};

export default function Carrousel() {
  const { data, error } = useSWR(API_PRODUCTOS, fetcher);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [data, emblaApi]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-200 backdrop-blur">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Tarea 11</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Carrousel de imágenes</h2>
            <p className="mt-1 text-sm text-slate-600">Componente React integrado como Astro Island.</p>
          </div>
          <div className="text-sm text-slate-500">Fuente: `GET /api/productos`</div>
        </div>

        {error ? (
          <div className="alert alert-error">{String(error)}</div>
        ) : !data ? (
          <p className="text-slate-600">Cargando productos...</p>
        ) : (
          <div className="relative">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {data.map((p) => (
                  <div key={p.id} className="embla__slide">
                    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      <img
                        loading="lazy"
                        src={`http://localhost/public/imagenes/${p.imagen}`}
                        alt={p.titulo}
                        className="h-72 w-full object-cover"
                      />
                      <div className="p-4 text-center">
                        <h3 className="text-sm font-semibold text-slate-900">{p.titulo}</h3>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <button className="btn btn-circle btn-ghost" type="button" onClick={() => emblaApi?.scrollPrev()}>
                ‹
              </button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button className="btn btn-circle btn-ghost" type="button" onClick={() => emblaApi?.scrollNext()}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
