import { useEffect, useState } from "react";

type DogApiResponse = {
  message: string;
  status: string;
};

const DOG_API_URL = "https://dog.ceo/api/breeds/image/random";

function Perritos() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDog = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(DOG_API_URL);
      if (!response.ok) {
        throw new Error("No se pudo cargar un perrito.");
      }
      const data = (await response.json()) as DogApiResponse;
      setImageUrl(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDog();
  }, []);

  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-indigo-100 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500">Perritos</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Imagen aleatoria</h2>
        </div>
        <button
          type="button"
          onClick={() => void loadDog()}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          ¡Otro!
        </button>
      </div>

      <div className="flex min-h-[20rem] items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando perrito...</p>
        ) : error ? (
          <p className="px-6 text-center text-sm text-red-600">{error}</p>
        ) : (
          <img
            src={imageUrl}
            alt="Perrito aleatorio"
            className="h-full max-h-[24rem] w-full object-cover"
          />
        )}
      </div>
    </article>
  );
}

export default Perritos;
