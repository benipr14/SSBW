import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma/prisma.client.ts";
import logger from "../logger.ts";

const router = express.Router();

router.get("/login", (_req: Request, res: Response) => {
  res.render("login.njk", { error: false, pageTitle: "Iniciar sesión" });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, contraseña } = req.body as { email?: string; contraseña?: string };
  try {
    if (!email || !contraseña) {
      throw new Error("Faltan credenciales");
    }
    const usuario = await prisma.usuario.autentifica(email, contraseña);
    const token = jwt.sign({ usuario: usuario.nombre, email: usuario.email, admin: usuario.admin }, process.env.SECRET_KEY ?? "ssbw_jwt_secret", {
      expiresIn: "2h"
    });

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      })
      .redirect("/");
  } catch (error: any) {
    logger.error(error?.message ?? error);
    res.status(401).render("login.njk", { error: true, pageTitle: "Iniciar sesión" });
  }
});

router.get("/logout", (_req: Request, res: Response) => {
  res.clearCookie("access_token").redirect("/");
});

export default router;
