import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';

type Producto = { titulo: string; imagen: string };

type Props = {
  productos: Producto[];
};

export default function CarrouselSSG({ productos }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [productos, emblaApi]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-slate-200 backdrop-blur">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Tarea 12</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Carrousel SSG</h2>
            <p className="mt-1 text-sm text-slate-600">Las imágenes se pasan como props, sin llamar a ningún API.</p>
          </div>
          <div className="text-sm text-slate-500">Datos locales desde `productos.json`</div>
        </div>

        <div className="relative">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container">
              {productos.map((p) => (
                <div key={`${p.titulo}-${p.imagen}`} className="embla__slide">
                  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <img loading="lazy" src={`/images/${p.imagen}`} alt={p.titulo} className="h-72 w-full object-cover" />
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
      </div>
    </section>
  );
}
