import express, { Request, Response } from "express";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = express.Router();

type Orden = "asc" | "desc";

type CarritoItem = { id: number; cantidad: number };

function mapProducto(record: { id: number; título: string; descripción: string; precio: any; imagen: string }) {
  return {
    id: record.id,
    titulo: record.título,
    descripcion: record.descripción,
    precio: typeof record.precio === "number" ? record.precio : Number(record.precio),
    imagen: record.imagen
  };
}

function parseId(idParam: string | string[]): number | null {
  const val = Array.isArray(idParam) ? idParam[0] : idParam;
  const num = Number.parseInt(val, 10);
  return Number.isNaN(num) ? null : num;
}

function parsePrecio(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseQueryInt(raw: unknown, fallback: number): number {
  if (raw === undefined || raw === null) return fallback;
  const val = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(typeof val === "string" ? val : String(val), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function ordenFromQuery(raw: unknown): Orden {
  const norm = (typeof raw === "string" ? raw : "").toLowerCase();
  if (norm === "desc" || norm === "descendente") return "desc";
  return "asc";
}

function totalCarrito(carrito: CarritoItem[] | undefined): number {
  return carrito?.reduce((acc, item) => acc + (item.cantidad || 0), 0) ?? 0;
}

function getBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/imagen-aleatoria", async (req: Request, res: Response) => {
  try {
    const total = await prisma.producto.count();
    if (total === 0) {
      return res.status(404).json({ error: "No hay productos disponibles" });
    }

    const offset = Math.floor(Math.random() * total);
    const [producto] = await prisma.producto.findMany({
      skip: offset,
      take: 1,
      select: { título: true, imagen: true }
    });

    if (!producto) {
      return res.status(404).json({ error: "No se pudo obtener una imagen aleatoria" });
    }

    res.json({
      titulo: producto.título,
      imagenUrl: `${getBaseUrl(req)}/public/imagenes/${producto.imagen}`
    });
  } catch (error: any) {
    logger.error(`GET /api/imagen-aleatoria error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al obtener imagen aleatoria" });
  }
});

async function buildCarritoResponse(carrito: CarritoItem[] | undefined) {
  const base = carrito ?? [];
  const acumulado = new Map<number, number>();
  for (const item of base) {
    const actual = acumulado.get(item.id) ?? 0;
    acumulado.set(item.id, actual + item.cantidad);
  }

  const ids = Array.from(acumulado.keys());
  if (ids.length === 0) {
    return {
      data: [],
      meta: { total_items: 0, total_importe: 0 }
    };
  }

  const productos = await prisma.producto.findMany({
    where: { id: { in: ids } },
    select: { id: true, título: true, precio: true, imagen: true },
    orderBy: { id: "asc" }
  });

  const data = productos.map((producto) => {
    const cantidad = acumulado.get(producto.id) ?? 0;
    const precio = typeof producto.precio === "number" ? producto.precio : Number(producto.precio);
    return {
      id: producto.id,
      titulo: producto.título,
      precio,
      imagen: producto.imagen,
      cantidad,
      subtotal: Number((precio * cantidad).toFixed(2))
    };
  });

  const totalImporte = data.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    data,
    meta: {
      total_items: totalCarrito(base),
      total_importe: Number(totalImporte.toFixed(2))
    }
  };
}

router.get("/carrito", async (req: Request, res: Response) => {
  try {
    const payload = await buildCarritoResponse(req.session.carrito);
    req.session.total_carrito = payload.meta.total_items;
    res.locals.total_carrito = payload.meta.total_items;
    res.json(payload);
  } catch (error: any) {
    logger.error(`GET /api/carrito error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

router.delete("/carrito/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Id inválido" });
  }

  const carrito = req.session.carrito ?? [];
  const nuevoCarrito = carrito.filter((item) => item.id !== id);

  if (nuevoCarrito.length === carrito.length) {
    return res.status(404).json({ error: "Producto no está en el carrito" });
  }

  req.session.carrito = nuevoCarrito;
  const total = totalCarrito(nuevoCarrito);
  req.session.total_carrito = total;
  res.locals.total_carrito = total;

  try {
    const payload = await buildCarritoResponse(nuevoCarrito);
    res.json(payload);
  } catch (error: any) {
    logger.error(`DELETE /api/carrito/${id} error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al eliminar producto del carrito" });
  }
});

router.get("/productos", async (req: Request, res: Response) => {
  const desdeRaw = req.query.desde;
  const hastaRaw = req.query.hasta;
  const ordenRaw = req.query["ordenación"] ?? req.query.ordenacion;

  const desde = Math.max(1, parseQueryInt(desdeRaw, 1));
  const hastaParsed = parseQueryInt(hastaRaw, 20);
  const hasta = Math.max(desde, hastaParsed);
  const order = ordenFromQuery(ordenRaw);

  try {
    const [total, records] = await prisma.$transaction([
      prisma.producto.count(),
      prisma.producto.findMany({
        skip: desde - 1,
        take: hasta - desde + 1,
        orderBy: { id: order }
      })
    ]);

    const data = records.map(mapProducto);
    res.json({
      data,
      meta: {
        total,
        desde,
        hasta: Math.min(hasta, total),
        orden: order
      }
    });
  } catch (error: any) {
    logger.error(`GET /api/productos error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

router.get("/productos/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Id inválido" });
  }

  try {
    const prod = await prisma.producto.findUnique({ where: { id } });
    if (!prod) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(mapProducto(prod));
  } catch (error: any) {
    logger.error(`GET /api/productos/${id} error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

router.post("/productos", async (req: Request, res: Response) => {
  const { titulo, descripcion, precio, imagen } = req.body ?? {};
  const precioNum = parsePrecio(precio);

  if (!titulo || !descripcion || !imagen || precioNum === null) {
    return res.status(400).json({ error: "Faltan campos obligatorios o precio inválido" });
  }

  try {
    const created = await prisma.producto.create({
      data: {
        título: titulo,
        descripción: descripcion,
        precio: precioNum,
        imagen
      }
    });
    res.status(201).json(mapProducto(created));
  } catch (error: any) {
    logger.error(`POST /api/productos error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

router.put("/producto/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Id inválido" });
  }

  const { titulo, descripcion, precio, imagen } = req.body ?? {};
  const updates: Record<string, unknown> = {};

  if (titulo !== undefined) updates.título = titulo;
  if (descripcion !== undefined) updates.descripción = descripcion;
  if (imagen !== undefined) updates.imagen = imagen;
  if (precio !== undefined) {
    const precioNum = parsePrecio(precio);
    if (precioNum === null) {
      return res.status(400).json({ error: "Precio inválido" });
    }
    updates.precio = precioNum;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  try {
    const updated = await prisma.producto.update({ where: { id }, data: updates });
    res.json(mapProducto(updated));
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "No encontrado" });
    }
    logger.error(`PUT /api/producto/${id} error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.delete("/productos/:id", async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Id inválido" });
  }

  try {
    await prisma.producto.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ error: "No encontrado" });
    }
    logger.error(`DELETE /api/productos/${id} error: ${error?.message ?? error}`);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

export default router;
