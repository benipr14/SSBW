import express, { Request, Response } from "express";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = express.Router();

function mapCard(record: { id: number; título: string; precio: any; imagen: string }) {
  return {
    id: record.id,
    titulo: record.título,
    precio: typeof record.precio === "number" ? record.precio : Number(record.precio),
    imagen: record.imagen
  };
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function totalCarrito(carrito: { id: number; cantidad: number }[] | undefined): number {
  return carrito?.reduce((acc, item) => acc + (item.cantidad || 0), 0) ?? 0;
}

// Portada: lista de productos sin descripción
router.get("/", async (_req: Request, res: Response) => {
  try {
    const records = await prisma.producto.findMany({
      select: {
        id: true,
        título: true,
        precio: true,
        imagen: true
      },
      orderBy: { id: "asc" }
    });

    const cards = records.map(mapCard);
    res.render("portada.njk", { pageTitle: "Tienda Prado", cards, busqueda: "" });
  } catch (error: any) {
    console.error("~ error portada:", error?.message ?? error);
    res.status(500).send(`Error: ${error?.message ?? "desconocido"}`);
  }
});

// Búsqueda
router.get("/buscar", async (req: Request, res: Response) => {
  const termino = (req.query.busqueda as string | undefined)?.trim() ?? "";
  try {
    const records = termino
      ? await prisma.producto.findMany({
          select: {
            id: true,
            título: true,
            precio: true,
            imagen: true,
            descripción: true
          },
          orderBy: { id: "asc" }
        })
      : [];

    const termNorm = normalize(termino);
    const filtered = records.filter((r) => {
      const tituloNorm = normalize(r.título ?? "");
      const descNorm = normalize(r.descripción ?? "");
      return tituloNorm.includes(termNorm) || descNorm.includes(termNorm);
    });

    const cards = filtered.map(mapCard);
    res.render("portada.njk", { pageTitle: "Búsqueda", cards, busqueda: termino });
  } catch (error: any) {
    console.error("~ error buscar:", error?.message ?? error);
    res.status(500).send(`Error: ${error?.message ?? "desconocido"}`);
  }
});

// Detalle por id
router.get("/producto/:id", async (req: Request, res: Response) => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return res.status(400).send("Id inválido");
  }
  try {
    const prod = await prisma.producto.findUnique({ where: { id } });
    if (!prod) {
      return res.status(404).render("404.njk", { pageTitle: "No encontrado", path: req.path });
    }

    const item = {
      id: prod.id,
      titulo: prod.título,
      descripcion: prod.descripción,
      precio: typeof prod.precio === "number" ? prod.precio : Number(prod.precio),
      imagen: prod.imagen
    };

    res.render("detalle.njk", { pageTitle: item.titulo, item });
  } catch (error: any) {
    console.error("~ error detalle:", error?.message ?? error);
    res.status(500).send(`Error: ${error?.message ?? "desconocido"}`);
  }
});

// Añadir al carrito
router.post("/al-carrito/:id", async (req: Request, res: Response) => {
  const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = Number.parseInt(idParam, 10);
  const cantidad = Number.parseInt(req.body?.cantidad, 10) || 0;

  if (Number.isNaN(id) || cantidad <= 0) {
    return res.status(400).send("Petición inválida");
  }

  try {
    const prod = await prisma.producto.findUnique({ where: { id }, select: { id: true } });
    if (!prod) {
      return res.status(404).render("404.njk", { pageTitle: "No encontrado", path: req.path });
    }

    if (!req.session.carrito) {
      req.session.carrito = [];
    }
    req.session.carrito.push({ id, cantidad });
    const total = totalCarrito(req.session.carrito);
    req.session.total_carrito = total;
    res.locals.total_carrito = total;
    logger.debug(`Al carrito id=${id} cantidad=${cantidad}. Total ahora: ${total}`);

    res.redirect(`/producto/${id}`);
  } catch (error: any) {
    logger.error(`Error al añadir al carrito: ${error?.message ?? error}`);
    res.status(500).send(`Error: ${error?.message ?? "desconocido"}`);
  }
});

export default router;
