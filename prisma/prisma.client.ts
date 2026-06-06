// import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const base = new PrismaClient({ adapter });

const prisma = base.$extends({
	model: {
		usuario: {
			async registrar(data: { email: string; nombre: string; contraseña: string; admin?: boolean }) {
				const hash = await bcrypt.hash(data.contraseña, 10);
				return base.usuario.create({
					data: {
						email: data.email,
						nombre: data.nombre,
						contraseña: hash,
						admin: data.admin ?? false
					}
				});
			},
			async autentifica(email: string, contraseña: string) {
				const user = await base.usuario.findUnique({ where: { email } });
				if (!user) {
					throw new Error("Credenciales inválidas");
				}
				const ok = await bcrypt.compare(contraseña, user.contraseña);
				if (!ok) {
					throw new Error("Credenciales inválidas");
				}
				return user;
			}
		}
	}
});

export default prisma;
