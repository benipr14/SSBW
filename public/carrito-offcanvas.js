(function () {
  const offcanvas = document.getElementById("carritoOffcanvas");
  const lista = document.getElementById("carritoLista");
  const vacio = document.getElementById("carritoVacio");
  const total = document.getElementById("carritoTotal");
  const badge = document.getElementById("badgeCarrito");
  const template = document.getElementById("tplCarritoItem");

  if (!offcanvas || !lista || !vacio || !total || !badge || !template) {
    return;
  }

  const formato = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  });

  const setBadge = (totalItems) => {
    badge.textContent = String(totalItems);
    badge.classList.toggle("d-none", totalItems <= 0);
  };

  const render = (payload) => {
    const items = payload?.data ?? [];
    const meta = payload?.meta ?? { total_items: 0, total_importe: 0 };

    lista.innerHTML = "";
    vacio.classList.toggle("d-none", items.length > 0);
    setBadge(meta.total_items || 0);
    total.textContent = formato.format(Number(meta.total_importe || 0));

    for (const item of items) {
      const node = template.content.firstElementChild.cloneNode(true);
      const img = node.querySelector('[data-field="imagen"]');
      const titulo = node.querySelector('[data-field="titulo"]');
      const detalle = node.querySelector('[data-field="detalle"]');
      const btn = node.querySelector('[data-action="eliminar"]');

      img.src = `/public/imagenes/${item.imagen}`;
      img.alt = item.titulo;
      titulo.textContent = item.titulo;
      detalle.textContent = `${item.cantidad} × ${formato.format(item.precio)} = ${formato.format(item.subtotal)}`;
      btn.dataset.id = String(item.id);
      btn.addEventListener("click", onDeleteClick);

      lista.appendChild(node);
    }
  };

  const loadCarrito = async () => {
    const response = await fetch("/api/carrito", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error("No se pudo cargar el carrito");
    }
    const payload = await response.json();
    render(payload);
  };

  const onDeleteClick = async (event) => {
    const button = event.currentTarget;
    const id = button?.dataset?.id;
    if (!id) {
      return;
    }

    button.disabled = true;
    try {
      const response = await fetch(`/api/carrito/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto del carrito");
      }
      const payload = await response.json();
      render(payload);
    } catch (error) {
      console.error(error);
      button.disabled = false;
    }
  };

  offcanvas.addEventListener("show.bs.offcanvas", () => {
    loadCarrito().catch((error) => {
      console.error(error);
    });
  });
})();
