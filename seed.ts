import prisma from "./prisma/prisma.client.ts";
import productos from "./productos.json" with { type: "json" };

type ProductoEntrada = {
  titulo: string;
  descripcion: string;
  texto_precio: string;
  imagen: string;
};

type ProductosEntrada = ProductoEntrada[];

function parsePrecio(texto: string): number {
  const cleaned = texto
    .replace(/[\u00A0\s]/g, "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

async function guardarEnDB(productosEntrada: ProductosEntrada): Promise<void> {
  for (const producto of productosEntrada) {
    const titulo = producto.titulo?.trim() ?? "";
    const descripcion = producto.descripcion?.trim() ?? "";
    const imagen = producto.imagen?.trim() ?? "";
    const precio = parsePrecio(producto.texto_precio ?? "0");

    try {
      await prisma.producto.create({
        data: {
          "título": titulo,
          "descripción": descripcion,
          imagen,
          precio,
        },
      });
      // console.log(`Creado: ${titulo}`);
    } catch (error: any) {
      console.error(`Error creando ${titulo}:`, error?.message ?? error);
    }
  }
}

async function main(): Promise<void> {
  await guardarEnDB(productos as ProductosEntrada);
  const count = await prisma.producto.count();
  console.log(`Productos insertados: ${count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
