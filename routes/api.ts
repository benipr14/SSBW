import express, { Request, Response } from "express";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = express.Router();

type Orden = "asc" | "desc";

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
