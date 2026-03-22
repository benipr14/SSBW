import "dotenv/config";
import prisma from "./prisma/prisma.client.ts";
import logger from "./logger.ts";

async function main() {
  const usuarios = [
    { email: "admin@example.com", nombre: "Admin", contraseña: "admin123", admin: true },
    { email: "user@example.com", nombre: "Usuario", contraseña: "user123", admin: false }
  ];

  for (const u of usuarios) {
    try {
      const existing = await prisma.usuario.findUnique({ where: { email: u.email } });
      if (existing) {
        logger.info(`Usuario ya existe ${u.email}, se omite`);
        continue;
      }
      const creado = await prisma.usuario.registrar(u);
      logger.info(`Creado usuario ${creado.email} admin:${creado.admin}`);
    } catch (error: any) {
      logger.error(`Error creando ${u.email}: ${error?.message ?? error}`);
    }
  }

  // Prueba de autentificacion
  try {
    const ok = await prisma.usuario.autentifica("admin@example.com", "admin123");
    logger.info(`Autenticado ${ok.email}`);
  } catch (error: any) {
    logger.error(`Fallo autenticación: ${error?.message ?? error}`);
  }
}

main()
  .catch((err) => {
    logger.error(err?.message ?? err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
