import useSWR from "swr";

type StoreImageResponse = {
  titulo: string;
  imagenUrl: string;
};

const API_URL = import.meta.env.VITE_STORE_API_URL ?? "http://localhost:3000/api/imagen-aleatoria";

const fetcher = async (url: string) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error("No se pudo cargar la imagen de la tienda.");
  }
  return (await response.json()) as StoreImageResponse;
};

function Cuadros() {
  const { data, error, isLoading, mutate } = useSWR(API_URL, fetcher);

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-amber-100 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">Cuadros</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Imagen de la tienda</h2>
        </div>
        <button
          type="button"
          onClick={() => void mutate()}
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          ¡Otro! <span aria-hidden="true">🎨</span>
        </button>
      </div>

      <div className="flex min-h-[20rem] items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando imagen de la tienda...</p>
        ) : error ? (
          <p className="px-6 text-center text-sm text-red-600">{error.message}</p>
        ) : data ? (
          <figure className="h-full w-full">
            <img
              src={data.imagenUrl}
              alt={data.titulo}
              className="h-full max-h-[24rem] w-full object-cover"
            />
            <figcaption className="border-t border-white/80 bg-white/80 p-3 text-center text-sm text-slate-600">
              {data.titulo}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </article>
  );
}

export default Cuadros;
