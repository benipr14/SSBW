// Componente Perritos - Galería externa
class Perritos {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.imageUrl = null;
    this.loading = false;
    this.error = null;
    this.render();
    this.loadDog();
  }

  render() {
    this.container.innerHTML = `
      <div class="card h-100 shadow-sm d-flex flex-column">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">🐕 Perritos Aleatorios</h5>
        </div>
        <div class="card-body d-flex flex-column flex-grow-1" style="min-height: 30rem;">
          <div id="perritos-content" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            <div id="perritos-loader" class="text-center text-muted">
              Cargando...
            </div>
            <img id="perritos-image" src="" alt="Perrito aleatorio" style="display: none; max-height: 100%; max-width: 100%; object-fit: contain; border-radius: 0.25rem;" />
            <div id="perritos-error" class="alert alert-danger mb-0" style="display: none;"></div>
          </div>
        </div>
        <div class="card-footer bg-white">
          <button id="perritos-btn" class="btn btn-primary w-100">¡Otro!</button>
        </div>
      </div>
    `;

    document.getElementById("perritos-btn").addEventListener("click", () => this.loadDog());
  }

  async loadDog() {
    this.loading = true;
    this.error = null;
    this.updateUI();

    try {
      const response = await fetch("https://dog.ceo/api/breeds/image/random");
      if (!response.ok) throw new Error("Error al cargar la imagen");
      const data = await response.json();
      this.imageUrl = data.message;
      this.loading = false;
      this.updateUI();
    } catch (err) {
      this.error = err.message || "Error desconocido";
      this.loading = false;
      this.updateUI();
    }
  }

  updateUI() {
    const loader = document.getElementById("perritos-loader");
    const image = document.getElementById("perritos-image");
    const errorDiv = document.getElementById("perritos-error");
    const btn = document.getElementById("perritos-btn");

    loader.style.display = this.loading ? "flex" : "none";
    image.style.display = this.imageUrl && !this.loading ? "block" : "none";
    errorDiv.style.display = this.error ? "block" : "none";

    if (this.imageUrl) {
      image.src = this.imageUrl;
    }

    if (this.error) {
      errorDiv.textContent = this.error;
    }

    btn.disabled = this.loading;
  }
}

// Componente Cuadros - Galería de la tienda
class Cuadros {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.data = null;
    this.loading = false;
    this.error = null;
    this.apiUrl = "/api/imagen-aleatoria";
    this.render();
    this.loadImage();
  }

  render() {
    this.container.innerHTML = `
      <div class="card h-100 shadow-sm d-flex flex-column">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">🖼️ Cuadros de la Tienda</h5>
        </div>
        <div class="card-body d-flex flex-column flex-grow-1" style="min-height: 30rem;">
          <div id="cuadros-content" class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
            <div id="cuadros-loader" class="text-center text-muted">
              Cargando...
            </div>
            <figure id="cuadros-figure" style="display: none; margin: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <img id="cuadros-image" src="" alt="Cuadro aleatorio" style="max-height: 100%; max-width: 100%; object-fit: contain; border-radius: 0.25rem;" />
              <figcaption id="cuadros-title" class="text-center text-muted small mt-2"></figcaption>
            </figure>
            <div id="cuadros-error" class="alert alert-danger mb-0" style="display: none;"></div>
          </div>
        </div>
        <div class="card-footer bg-white">
          <button id="cuadros-btn" class="btn btn-success w-100">¡Otro!</button>
        </div>
      </div>
    `;

    document.getElementById("cuadros-btn").addEventListener("click", () => this.loadImage());
  }

  async loadImage() {
    this.loading = true;
    this.error = null;
    this.updateUI();
    console.log("Cuadros: Cargando imagen desde", this.apiUrl);

    try {
      const response = await fetch(this.apiUrl, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("Cuadros: Respuesta recibida, status:", response.status);
      if (!response.ok) throw new Error(`Error ${response.status} al cargar la imagen`);
      const result = await response.json();

      console.log("Cuadros: JSON parseado:", result);

      // El endpoint devuelve { titulo, imagenUrl } directamente
      if (result.titulo && result.imagenUrl) {
        this.data = {
          titulo: result.titulo,
          imagenUrl: result.imagenUrl
        };
        console.log("Cuadros: Datos asignados:", this.data);
      } else if (result.data) {
        // Por si acaso viene envuelto en data
        this.data = result.data;
      } else {
        throw new Error("Formato de respuesta inesperado");
      }

      this.loading = false;
      this.updateUI();
    } catch (err) {
      this.error = err.message || "Error desconocido";
      console.error("Cuadros error:", err);
      this.loading = false;
      this.updateUI();
    }
  }

  updateUI() {
    const loader = document.getElementById("cuadros-loader");
    const figure = document.getElementById("cuadros-figure");
    const image = document.getElementById("cuadros-image");
    const title = document.getElementById("cuadros-title");
    const errorDiv = document.getElementById("cuadros-error");
    const btn = document.getElementById("cuadros-btn");

    loader.style.display = this.loading ? "flex" : "none";
    figure.style.display = this.data && !this.loading ? "block" : "none";
    errorDiv.style.display = this.error ? "block" : "none";

    if (this.data) {
      image.src = this.data.imagenUrl;
      title.textContent = this.data.titulo;
    }

    if (this.error) {
      errorDiv.textContent = this.error;
    }

    btn.disabled = this.loading;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando galerías...");
  if (document.getElementById("perritos-container")) {
    console.log("Inicializando Perritos");
    new Perritos("perritos-container");
  }
  if (document.getElementById("cuadros-container")) {
    console.log("Inicializando Cuadros");
    new Cuadros("cuadros-container");
  }
});
