import useSWR from 'swr';
import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

type Producto = { id: number; titulo: string; imagen: string };

const API_PRODUCTOS = import.meta.env.VITE_STORE_API_BASE ?? '/api/productos';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudieron obtener productos');
  const json = await res.json();
  return json.data as Producto[];
};

export default function CarouselPage() {
  const { data, error } = useSWR(API_PRODUCTOS, fetcher);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [data, emblaApi]);

  return (
    <main className="min-h-screen px-4 py-10 text-slate-800">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Carrousel de imágenes</h1>

        {error ? (
          <div className="alert alert-error">{String(error)}</div>
        ) : !data ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="relative">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container">
                {data.map((p) => (
                  <div key={p.id} className="embla__slide">
                    <div className="card">
                      <div className="card-body p-2">
                        <img loading="lazy" src={`/public/imagenes/${p.imagen}`} alt={p.titulo} className="h-64 w-full object-cover rounded-lg" />
                        <h3 className="mt-2 text-center text-sm">{p.titulo}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <button
                aria-label="Anterior"
                className="btn btn-ghost btn-circle"
                onClick={() => emblaApi && emblaApi.scrollPrev()}
              >
                ◀
              </button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <button
                aria-label="Siguiente"
                className="btn btn-ghost btn-circle"
                onClick={() => emblaApi && emblaApi.scrollNext()}
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
